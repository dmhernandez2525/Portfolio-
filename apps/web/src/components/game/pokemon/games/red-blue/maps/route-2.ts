// ============================================================================
// Route 2 - Connects Viridian City to Viridian Forest / Pewter City
// ============================================================================

import type { GameMap } from '../../../engine/types';

const T = 5, G = 1, P = 2, TG = 3, B = 6, R = 7, D = 8, S = 16;

const ground: number[][] = [
  [T, T, T, T, G, G, P, P, G, G, T, T, T, T],
  [T, T, T, G, G, G, P, P, G, G, G, T, T, T],
  [T, T, G, G, TG, G, P, P, G, TG, G, G, T, T],
  [T, G, G, TG, TG, G, P, P, G, TG, TG, G, G, T],
  [T, G, G, TG, TG, G, P, P, G, G, TG, G, G, T],
  [T, G, G, G, G, G, P, P, G, G, G, G, G, T],
  [T, T, G, G, G, P, P, P, G, G, G, G, T, T],
  [T, T, G, G, G, P, P, G, G, G, G, G, T, T],
  [T, T, G, G, P, P, G, G, G, G, G, G, T, T],
  // Gate building to Viridian Forest
  [T, T, G, R, R, R, R, R, G, G, G, G, T, T],
  [T, T, G, B, B, D, B, B, G, G, G, G, T, T],
  [T, T, G, G, G, P, G, G, G, G, G, G, T, T],
  [T, T, G, G, G, P, P, G, G, G, G, G, T, T],
  [T, G, G, TG, G, P, P, G, TG, G, G, G, G, T],
  [T, G, G, TG, TG, P, P, G, TG, TG, G, G, G, T],
  [T, G, G, G, G, P, P, G, G, G, G, G, G, T],
  [T, T, G, G, G, G, P, P, G, G, G, G, T, T],
  [T, T, T, G, G, G, P, P, G, G, G, T, T, T],
  [T, T, T, T, G, G, P, P, G, G, T, T, T, T],
  [T, T, T, T, T, G, P, P, G, T, T, T, T, T],
];

const objects: number[][] = ground.map(() => new Array(14).fill(0));
const above: number[][] = ground.map(() => new Array(14).fill(0));

const collision = ground.map(row =>
  row.map(tile => {
    const map: Record<number, 'walkable' | 'blocked' | 'tall_grass'> = {
      [T]: 'blocked', [G]: 'walkable', [P]: 'walkable', [TG]: 'tall_grass',
      [B]: 'blocked', [R]: 'blocked', [D]: 'walkable', [S]: 'walkable',
    };
    return map[tile] ?? 'blocked';
  })
);

export const route2: GameMap = {
  id: 'route_2',
  name: 'ROUTE 2',
  width: 14,
  height: 20,
  tilesetId: 'overworld',
  layers: { ground, objects, above },
  collision,
  warps: [
    { x: 5, y: 10, targetMap: 'viridian_forest', targetX: 9, targetY: 33 },
  ],
  connections: [
    { direction: 'up', targetMap: 'pewter_city', offset: 0 },
    { direction: 'down', targetMap: 'viridian_city', offset: 0 },
  ],
  encounters: [
    {
      type: 'grass',
      entries: [
        { speciesId: 16, minLevel: 3, maxLevel: 5, weight: 40 },
        { speciesId: 19, minLevel: 3, maxLevel: 5, weight: 30 },
        { speciesId: 10, minLevel: 3, maxLevel: 5, weight: 15 },
        { speciesId: 13, minLevel: 3, maxLevel: 5, weight: 15 },
      ],
    },
  ],
  npcs: [],
  music: 'route_2',
};
