// ============================================================================
// Route 4 — Mt. Moon exit to Cerulean City
// ============================================================================

import type { GameMap } from '../../../engine/types';

const T = 5, G = 1, P = 2, TG = 3, RK = 11;
const LD = 13; // ledge

const ground: number[][] = [
  [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T],
  [T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T],
  [T, G, G, TG, TG, G, G, G, G, G, G, G, G, G, G, G, G, G, TG, TG, G, G, G, T],
  [T, G, G, TG, TG, G, G, RK, G, G, G, G, G, G, G, G, RK, G, TG, TG, G, G, G, T],
  [T, G, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, G, T],
  [T, G, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, G, T],
  [T, G, G, G, G, G, LD, LD, LD, LD, LD, LD, LD, LD, LD, LD, LD, LD, G, G, G, G, G, T],
  [T, G, G, TG, TG, G, G, G, G, G, G, G, G, G, G, G, G, G, TG, TG, G, G, G, T],
  [T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T],
  [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T],
];

const objects: number[][] = ground.map(() => new Array(24).fill(0));
const above: number[][] = ground.map(() => new Array(24).fill(0));

const collision = ground.map(row =>
  row.map(tile => {
    const map: Record<number, 'walkable' | 'blocked' | 'tall_grass' | 'ledge_down'> = {
      [T]: 'blocked', [G]: 'walkable', [P]: 'walkable',
      [TG]: 'tall_grass', [RK]: 'blocked', [LD]: 'ledge_down',
    };
    return map[tile] ?? 'blocked';
  })
);

export const route4: GameMap = {
  id: 'route_4',
  name: 'ROUTE 4',
  width: 24,
  height: 10,
  tilesetId: 'overworld',
  layers: { ground, objects, above },
  collision,
  warps: [],
  connections: [
    { direction: 'left', targetMap: 'mt_moon', offset: 0 },
    { direction: 'right', targetMap: 'cerulean_city', offset: 0 },
  ],
  encounters: [
    {
      type: 'grass',
      entries: [
        { speciesId: 19, minLevel: 8, maxLevel: 12, weight: 30 },
        { speciesId: 21, minLevel: 8, maxLevel: 12, weight: 30 },
        { speciesId: 23, minLevel: 8, maxLevel: 12, weight: 20 },
        { speciesId: 56, minLevel: 10, maxLevel: 12, weight: 20 },
      ],
    },
  ],
  npcs: [],
  music: 'route_4',
};
