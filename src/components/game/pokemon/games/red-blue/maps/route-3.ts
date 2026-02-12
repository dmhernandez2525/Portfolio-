// ============================================================================
// Route 3 - Pewter City to Mt. Moon entrance
// ============================================================================

import type { GameMap } from '../../../engine/types';

const T = 5, G = 1, P = 2, TG = 3, RK = 11, S = 16;

const ground: number[][] = [
  [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T],
  [T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T],
  [T, G, G, TG, TG, G, G, G, G, G, G, G, G, TG, TG, G, G, G, G, G, G, G, G, TG, TG, G, G, G, G, T],
  [T, G, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, G, T],
  [T, G, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, G, T],
  [T, G, G, TG, TG, G, G, RK, G, G, G, G, G, TG, TG, G, G, G, RK, G, G, G, G, TG, TG, G, G, G, G, T],
  [T, G, G, TG, TG, G, G, G, G, G, G, G, G, TG, TG, G, G, G, G, G, G, G, G, TG, TG, G, G, G, G, T],
  [T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T],
  [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T],
];

const objects: number[][] = ground.map(() => new Array(30).fill(0));
const above: number[][] = ground.map(() => new Array(30).fill(0));

const collision = ground.map(row =>
  row.map(tile => {
    const map: Record<number, 'walkable' | 'blocked' | 'tall_grass'> = {
      [T]: 'blocked', [G]: 'walkable', [P]: 'walkable',
      [TG]: 'tall_grass', [RK]: 'blocked', [S]: 'walkable',
    };
    return map[tile] ?? 'blocked';
  })
);

export const route3: GameMap = {
  id: 'route_3',
  name: 'ROUTE 3',
  width: 30,
  height: 9,
  tilesetId: 'overworld',
  layers: { ground, objects, above },
  collision,
  warps: [],
  connections: [
    { direction: 'left', targetMap: 'pewter_city', offset: 0 },
    { direction: 'right', targetMap: 'mt_moon', offset: 0 },
  ],
  encounters: [
    {
      type: 'grass',
      entries: [
        { speciesId: 21, minLevel: 6, maxLevel: 8, weight: 30 },
        { speciesId: 16, minLevel: 6, maxLevel: 8, weight: 20 },
        { speciesId: 39, minLevel: 5, maxLevel: 8, weight: 15 },
        { speciesId: 27, minLevel: 6, maxLevel: 8, weight: 20 },
        { speciesId: 32, minLevel: 6, maxLevel: 8, weight: 15 },
      ],
    },
  ],
  npcs: [
    {
      id: 'route3_lass',
      x: 10, y: 3,
      spriteId: 'lass',
      direction: 'down',
      movement: 'static',
      dialog: ['Hi! I like shorts!', 'They\u0027re comfy and easy to wear!'],
      isTrainer: true,
      trainerData: {
        id: 'lass_route3_1',
        party: [
          { speciesId: 16, level: 9 },
          { speciesId: 16, level: 9 },
        ],
      },
    },
    {
      id: 'route3_bug_catcher',
      x: 20, y: 5,
      spriteId: 'bug_catcher',
      direction: 'up',
      movement: 'static',
      dialog: ['Go, my bug POKeMON!'],
      isTrainer: true,
      trainerData: {
        id: 'bug_catcher_route3_1',
        party: [
          { speciesId: 13, level: 6 },
          { speciesId: 10, level: 6 },
        ],
      },
    },
  ],
  music: 'route_3',
};
