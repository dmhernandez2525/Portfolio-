// ============================================================================
// Pokemon RPG Engine - Collision Detection
// ============================================================================

import type { TileType, Direction, GameMap, NPCDef } from './types';

/** Check if a tile position is walkable on the given map. */
export function isTileWalkable(
  map: GameMap,
  tileX: number,
  tileY: number,
  isSurfing: boolean
): boolean {
  // Out of bounds
  if (tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height) {
    return false;
  }

  const tile = map.collision[tileY]?.[tileX];
  if (!tile) return false;

  if (isSurfing) {
    return tile === 'surfable' || tile === 'walkable';
  }

  return tile === 'walkable' || tile === 'tall_grass';
}

/** Check if moving in a direction from a tile crosses a ledge. */
export function canCrossLedge(
  map: GameMap,
  fromX: number,
  fromY: number,
  direction: Direction
): boolean {
  const targetX = fromX + (direction === 'right' ? 1 : direction === 'left' ? -1 : 0);
  const targetY = fromY + (direction === 'down' ? 1 : direction === 'up' ? -1 : 0);

  if (targetX < 0 || targetY < 0 || targetX >= map.width || targetY >= map.height) {
    return false;
  }

  const tile = map.collision[targetY]?.[targetX];
  const ledgeDirections: Record<string, Direction> = {
    'ledge_down': 'down',
    'ledge_left': 'left',
    'ledge_right': 'right',
  };

  if (tile && tile in ledgeDirections) {
    return direction === ledgeDirections[tile];
  }

  return false;
}

/** Check if stepping onto a tile triggers a wild encounter. */
export function isTallGrass(map: GameMap, tileX: number, tileY: number): boolean {
  if (tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height) {
    return false;
  }
  return map.collision[tileY]?.[tileX] === 'tall_grass';
}

/** Get the tile type at a position. */
export function getTileType(map: GameMap, tileX: number, tileY: number): TileType | null {
  if (tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height) {
    return null;
  }
  return map.collision[tileY]?.[tileX] ?? null;
}

/** Check if an NPC occupies a tile. */
export function isNPCAtTile(npcs: NPCDef[], tileX: number, tileY: number): NPCDef | null {
  return npcs.find(npc => npc.x === tileX && npc.y === tileY) ?? null;
}

/** Get the destination tile for a direction. */
export function getAdjacentTile(
  tileX: number,
  tileY: number,
  direction: Direction
): { x: number; y: number } {
  const offsets: Record<Direction, { x: number; y: number }> = {
    up:    { x: 0,  y: -1 },
    down:  { x: 0,  y: 1 },
    left:  { x: -1, y: 0 },
    right: { x: 1,  y: 0 },
  };
  const off = offsets[direction];
  return { x: tileX + off.x, y: tileY + off.y };
}

/** Check a warp point at the given tile. */
export function checkWarp(map: GameMap, tileX: number, tileY: number) {
  return map.warps.find(w => w.x === tileX && w.y === tileY) ?? null;
}

/** Check if a trainer NPC can see the player (line of sight). */
export function checkTrainerLOS(
  npc: NPCDef,
  playerTileX: number,
  playerTileY: number,
  map: GameMap
): boolean {
  if (!npc.isTrainer || !npc.lineOfSight) return false;

  const los = npc.lineOfSight;
  const dx = npc.direction === 'right' ? 1 : npc.direction === 'left' ? -1 : 0;
  const dy = npc.direction === 'down' ? 1 : npc.direction === 'up' ? -1 : 0;

  for (let i = 1; i <= los; i++) {
    const checkX = npc.x + dx * i;
    const checkY = npc.y + dy * i;

    // Blocked by wall/object
    if (!isTileWalkable(map, checkX, checkY, false) && !isTallGrass(map, checkX, checkY)) {
      return false;
    }

    if (checkX === playerTileX && checkY === playerTileY) {
      return true;
    }
  }

  return false;
}
