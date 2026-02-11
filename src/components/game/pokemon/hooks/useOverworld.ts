// ============================================================================
// Pokemon RPG — Overworld Hook (player movement, encounters)
// ============================================================================

import { useRef, useCallback } from 'react';
import type { Player, Direction, GameMap } from '../engine/types';
import { SCALED_TILE, PLAYER_SPEED, ENCOUNTER_RATE } from '../engine/constants';
import { isTileWalkable, canCrossLedge, isTallGrass, isNPCAtTile, getAdjacentTile, checkWarp, getTileType } from '../engine/collision';
import { setCameraTarget } from '../engine/camera';
import type { Camera } from '../engine/types';

export interface OverworldState {
  player: Player;
  currentMap: GameMap;
}

export function useOverworld() {
  const stateRef = useRef<OverworldState | null>(null);
  const encounterCallback = useRef<((encounterType?: 'grass' | 'surf' | 'fishing' | 'cave') => void) | null>(null);
  const warpCallback = useRef<((mapId: string, x: number, y: number) => void) | null>(null);
  const connectionCallback = useRef<((mapId: string, x: number, y: number) => void) | null>(null);
  const npcCallback = useRef<((npcId: string) => void) | null>(null);
  const stepCallback = useRef<(() => void) | null>(null);
  const surfCallback = useRef<(() => boolean) | null>(null);
  const fieldMoveCallback = useRef<((move: 'cut' | 'strength') => boolean) | null>(null);
  const stepCountRef = useRef(0);

  const init = useCallback((map: GameMap, startX: number, startY: number): Player => {
    const player: Player = {
      x: startX * SCALED_TILE,
      y: startY * SCALED_TILE,
      tileX: startX,
      tileY: startY,
      direction: 'down',
      isMoving: false,
      moveProgress: 0,
      spriteFrame: 0,
      speed: PLAYER_SPEED,
      isSurfing: false,
      isBiking: false,
    };

    stateRef.current = { player, currentMap: map };
    return player;
  }, []);

  const setMap = useCallback((map: GameMap) => {
    if (stateRef.current) {
      stateRef.current.currentMap = map;
    }
  }, []);

  const onEncounter = useCallback((cb: (encounterType?: 'grass' | 'surf' | 'fishing' | 'cave') => void) => {
    encounterCallback.current = cb;
  }, []);

  const onWarp = useCallback((cb: (mapId: string, x: number, y: number) => void) => {
    warpCallback.current = cb;
  }, []);

  const onConnection = useCallback((cb: (mapId: string, x: number, y: number) => void) => {
    connectionCallback.current = cb;
  }, []);

  const onNPCInteract = useCallback((cb: (npcId: string) => void) => {
    npcCallback.current = cb;
  }, []);

  const onStep = useCallback((cb: () => void) => {
    stepCallback.current = cb;
  }, []);

  /** Register callback to check if player can surf (has badge + party has Surf). Returns true if allowed. */
  const onSurfCheck = useCallback((cb: () => boolean) => {
    surfCallback.current = cb;
  }, []);

  /** Register callback for field move checks (Cut, Strength). Returns true if party has the move. */
  const onFieldMoveCheck = useCallback((cb: (move: 'cut' | 'strength') => boolean) => {
    fieldMoveCallback.current = cb;
  }, []);

  /** Toggle biking on/off. */
  const toggleBike = useCallback(() => {
    const state = stateRef.current;
    if (!state || state.player.isMoving || state.player.isSurfing) return;
    state.player.isBiking = !state.player.isBiking;
    state.player.speed = state.player.isBiking ? PLAYER_SPEED * 2 : PLAYER_SPEED;
  }, []);

  /** Use fishing rod: returns true if facing water (triggers encounter via callback). */
  const useFishingRod = useCallback((): boolean => {
    const state = stateRef.current;
    if (!state || state.player.isMoving) return false;
    const { player, currentMap } = state;
    const facing = getAdjacentTile(player.tileX, player.tileY, player.direction);
    const facingTile = getTileType(currentMap, facing.x, facing.y);
    if (facingTile === 'surfable') {
      encounterCallback.current?.('fishing');
      return true;
    }
    return false;
  }, []);

  /** Check if the player is at a map edge and should transition via connection. */
  const checkConnection = useCallback((player: Player, map: GameMap): boolean => {
    if (!connectionCallback.current) return false;

    // Determine which edge (if any) the player is at
    const directionChecks: { condition: boolean; direction: Direction; calcPosition: (conn: { offset: number }) => { x: number; y: number } }[] = [
      {
        condition: player.tileY < 0,
        direction: 'up',
        calcPosition: (conn) => ({ x: player.tileX + conn.offset, y: -1 }),  // will be placed at bottom of target map
      },
      {
        condition: player.tileY >= map.height,
        direction: 'down',
        calcPosition: (conn) => ({ x: player.tileX + conn.offset, y: 0 }),  // top of target map
      },
      {
        condition: player.tileX < 0,
        direction: 'left',
        calcPosition: (conn) => ({ x: -1, y: player.tileY + conn.offset }),  // right side of target map
      },
      {
        condition: player.tileX >= map.width,
        direction: 'right',
        calcPosition: (conn) => ({ x: 0, y: player.tileY + conn.offset }),  // left side of target map
      },
    ];

    for (const check of directionChecks) {
      if (!check.condition) continue;

      const conn = map.connections.find(c => c.direction === check.direction);
      if (!conn) continue;

      const pos = check.calcPosition(conn);

      // Resolve final position based on direction — place at opposite edge of target map
      // We don't know the target map dimensions here, so we use sentinel values
      // that PokemonCanvas.loadMap will resolve. Use -1 as "place at far edge".
      const finalX = pos.x;
      const finalY = pos.y;

      connectionCallback.current(conn.targetMap, finalX, finalY);
      return true;
    }

    return false;
  }, []);

  /** Main update: call every frame with input directions and A button. */
  const update = useCallback((
    dirX: number,
    dirY: number,
    aPressed: boolean,
    camera: Camera
  ): Player | null => {
    const state = stateRef.current;
    if (!state) return null;

    const { player, currentMap } = state;

    // If currently moving, continue the movement animation
    if (player.isMoving) {
      player.moveProgress += player.speed / SCALED_TILE;

      if (player.moveProgress >= 1) {
        // Movement complete
        player.moveProgress = 0;
        player.isMoving = false;
        player.x = player.tileX * SCALED_TILE;
        player.y = player.tileY * SCALED_TILE;

        // Step counter for friendship
        stepCountRef.current++;
        if (stepCountRef.current % 128 === 0) {
          stepCallback.current?.();
        }

        // Check for map connection (edge of map)
        if (checkConnection(player, currentMap)) {
          return player;
        }

        // Check for warp at destination
        const warp = checkWarp(currentMap, player.tileX, player.tileY);
        if (warp && warpCallback.current) {
          warpCallback.current(warp.targetMap, warp.targetX, warp.targetY);
          return player;
        }

        // Exit surf when stepping onto walkable land
        if (player.isSurfing) {
          const currentTile = getTileType(currentMap, player.tileX, player.tileY);
          if (currentTile && currentTile !== 'surfable') {
            player.isSurfing = false;
          }
        }

        // Check for wild encounter in tall grass or while surfing
        if (isTallGrass(currentMap, player.tileX, player.tileY) || player.isSurfing) {
          if (Math.random() < ENCOUNTER_RATE && encounterCallback.current && !player.isBiking) {
            encounterCallback.current(player.isSurfing ? 'surf' : 'grass');
            return player;
          }
        }
      }

      // Update camera
      setCameraTarget(camera, player.x + SCALED_TILE / 2, player.y + SCALED_TILE / 2);
      return player;
    }

    // Not moving — process new input
    let direction: Direction | null = null;
    if (dirY < 0) direction = 'up';
    else if (dirY > 0) direction = 'down';
    else if (dirX < 0) direction = 'left';
    else if (dirX > 0) direction = 'right';

    if (direction) {
      // Face the direction first
      player.direction = direction;

      // Try to move
      const target = getAdjacentTile(player.tileX, player.tileY, direction);

      // Allow moving off-map if there's a connection in that direction
      const hasConnection = currentMap.connections.some(c => c.direction === direction);
      const isOffMap = target.x < 0 || target.y < 0 || target.x >= currentMap.width || target.y >= currentMap.height;

      if (isOffMap && hasConnection) {
        // Allow the move — connection will be handled when movement completes
        player.tileX = target.x;
        player.tileY = target.y;
        player.isMoving = true;
        player.moveProgress = 0;
      } else {
        const canWalk = isTileWalkable(currentMap, target.x, target.y, player.isSurfing);
        const isLedge = canCrossLedge(currentMap, player.tileX, player.tileY, direction);
        const npcBlocking = isNPCAtTile(currentMap.npcs, target.x, target.y);

        if ((canWalk || isLedge) && !npcBlocking) {
          player.tileX = target.x;
          player.tileY = target.y;
          player.isMoving = true;
          player.moveProgress = 0;
        }
      }
    }

    // A button: interact with NPC, surf prompt, field moves, or sign in front
    if (aPressed && !player.isMoving) {
      const facing = getAdjacentTile(player.tileX, player.tileY, player.direction);
      const npc = isNPCAtTile(currentMap.npcs, facing.x, facing.y);
      if (npc && npcCallback.current) {
        npcCallback.current(npc.id);
      } else {
        const facingTile = getTileType(currentMap, facing.x, facing.y);
        if (!player.isSurfing && facingTile === 'surfable' && surfCallback.current) {
          const canSurf = surfCallback.current();
          if (canSurf) {
            player.isSurfing = true;
            player.tileX = facing.x;
            player.tileY = facing.y;
            player.x = facing.x * SCALED_TILE;
            player.y = facing.y * SCALED_TILE;
            player.isMoving = false;
          }
        } else if (facingTile === 'cuttable_tree' && fieldMoveCallback.current?.('cut')) {
          // Remove the tree by changing tile to walkable
          currentMap.collision[facing.y][facing.x] = 'walkable';
        } else if (facingTile === 'boulder' && fieldMoveCallback.current?.('strength')) {
          // Push boulder one tile in the player's facing direction
          const beyond = getAdjacentTile(facing.x, facing.y, player.direction);
          const beyondTile = getTileType(currentMap, beyond.x, beyond.y);
          if (beyondTile === 'walkable') {
            currentMap.collision[facing.y][facing.x] = 'walkable';
            currentMap.collision[beyond.y][beyond.x] = 'boulder';
          }
        }
      }
    }

    // Update pixel position (smooth interpolation)
    if (player.isMoving) {
      const prevX = (player.tileX - (player.direction === 'right' ? 1 : player.direction === 'left' ? -1 : 0)) * SCALED_TILE;
      const prevY = (player.tileY - (player.direction === 'down' ? 1 : player.direction === 'up' ? -1 : 0)) * SCALED_TILE;
      player.x = prevX + (player.tileX * SCALED_TILE - prevX) * player.moveProgress;
      player.y = prevY + (player.tileY * SCALED_TILE - prevY) * player.moveProgress;
    }

    setCameraTarget(camera, player.x + SCALED_TILE / 2, player.y + SCALED_TILE / 2);
    return player;
  }, [checkConnection]);

  return {
    init,
    setMap,
    update,
    onEncounter,
    onWarp,
    onConnection,
    onNPCInteract,
    onStep,
    onSurfCheck,
    onFieldMoveCheck,
    toggleBike,
    useFishingRod,
    getState: () => stateRef.current,
  };
}
