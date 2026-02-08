// ============================================================================
// Pokemon RPG — Overworld Hook (player movement, encounters)
// ============================================================================

import { useRef, useCallback } from 'react';
import type { Player, Direction, GameMap } from '../engine/types';
import { SCALED_TILE, PLAYER_SPEED, ENCOUNTER_RATE } from '../engine/constants';
import { isTileWalkable, canCrossLedge, isTallGrass, isNPCAtTile, getAdjacentTile, checkWarp } from '../engine/collision';
import { setCameraTarget } from '../engine/camera';
import type { Camera } from '../engine/types';

export interface OverworldState {
  player: Player;
  currentMap: GameMap;
}

export function useOverworld() {
  const stateRef = useRef<OverworldState | null>(null);
  const encounterCallback = useRef<(() => void) | null>(null);
  const warpCallback = useRef<((mapId: string, x: number, y: number) => void) | null>(null);
  const npcCallback = useRef<((npcId: string) => void) | null>(null);

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

  const onEncounter = useCallback((cb: () => void) => {
    encounterCallback.current = cb;
  }, []);

  const onWarp = useCallback((cb: (mapId: string, x: number, y: number) => void) => {
    warpCallback.current = cb;
  }, []);

  const onNPCInteract = useCallback((cb: (npcId: string) => void) => {
    npcCallback.current = cb;
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
      player.spriteFrame++;

      if (player.moveProgress >= 1) {
        // Movement complete
        player.moveProgress = 0;
        player.isMoving = false;
        player.x = player.tileX * SCALED_TILE;
        player.y = player.tileY * SCALED_TILE;

        // Check for warp at destination
        const warp = checkWarp(currentMap, player.tileX, player.tileY);
        if (warp && warpCallback.current) {
          warpCallback.current(warp.targetMap, warp.targetX, warp.targetY);
          return player;
        }

        // Check for wild encounter in tall grass
        if (isTallGrass(currentMap, player.tileX, player.tileY)) {
          if (Math.random() < ENCOUNTER_RATE && encounterCallback.current) {
            encounterCallback.current();
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

    // A button: interact with NPC or sign in front
    if (aPressed && !player.isMoving) {
      const facing = getAdjacentTile(player.tileX, player.tileY, player.direction);
      const npc = isNPCAtTile(currentMap.npcs, facing.x, facing.y);
      if (npc && npcCallback.current) {
        npcCallback.current(npc.id);
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
  }, []);

  return {
    init,
    setMap,
    update,
    onEncounter,
    onWarp,
    onNPCInteract,
    getState: () => stateRef.current,
  };
}
