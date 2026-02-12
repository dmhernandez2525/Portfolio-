// ============================================================================
// Route 1 - Connects Pallet Town (south) to Viridian City (north)
// ============================================================================

import type { GameMap } from '../../../engine/types';

const T = 5;  // tree
const G = 1;  // grass
const P = 2;  // path
const TG = 3; // tall grass
const F = 12; // fence
const S = 16; // sign

const ground: number[][] = [
  [T, T, T, T, T, T, G, G, P, P, G, G, T, T, T, T],
  [T, T, T, T, G, G, G, G, P, P, G, G, G, G, T, T],
  [T, T, G, G, G, TG, TG, G, P, P, G, G, G, G, T, T],
  [T, G, G, TG, TG, TG, TG, G, P, P, G, G, G, G, G, T],
  [T, G, G, TG, TG, TG, G, G, P, P, G, G, TG, TG, G, T],
  [T, G, G, G, G, G, G, G, P, P, G, G, TG, TG, G, T],
  [T, T, G, G, G, G, G, P, P, P, G, G, G, G, T, T],
  [T, T, T, G, G, G, G, P, P, G, G, G, G, T, T, T],
  [T, T, G, G, G, G, P, P, G, G, G, G, G, G, T, T],
  [T, G, G, G, G, P, P, G, G, S, G, G, G, G, G, T],
  [T, G, G, TG, TG, P, P, G, G, G, G, TG, TG, G, G, T],
  [T, G, G, TG, TG, P, P, G, G, G, G, TG, TG, G, G, T],
  [T, G, G, TG, TG, P, P, G, G, G, G, TG, TG, G, G, T],
  [T, G, G, G, G, P, P, P, G, G, G, G, G, G, G, T],
  [T, T, G, G, G, G, P, P, G, G, G, G, G, G, T, T],
  [T, T, G, G, G, G, P, P, G, G, G, G, G, G, T, T],
  [T, T, T, G, G, G, P, P, G, G, G, G, G, T, T, T],
  [T, T, T, T, G, G, P, P, G, G, G, G, T, T, T, T],
  [T, T, T, T, T, G, P, P, G, G, T, T, T, T, T, T],
  [T, T, T, T, T, G, G, P, P, G, G, T, T, T, T, T],
  [T, T, T, T, G, G, G, P, P, G, G, G, T, T, T, T],
  [T, T, T, G, G, G, G, P, P, G, G, G, G, T, T, T],
  [T, T, G, G, G, G, G, P, P, G, G, G, G, G, T, T],
  [T, T, G, G, TG, TG, G, P, P, G, TG, TG, G, G, T, T],
  [T, G, G, G, TG, TG, G, P, P, G, TG, TG, G, G, G, T],
  [T, G, G, G, G, G, G, P, P, G, G, G, G, G, G, T],
  [T, T, T, T, T, T, G, G, P, P, G, G, T, T, T, T],
  [T, T, T, T, T, T, G, G, P, P, G, G, T, T, T, T],
];

const objects: number[][] = ground.map(() => new Array(16).fill(0));
const above: number[][] = ground.map(() => new Array(16).fill(0));

const collision = ground.map(row =>
  row.map(tile => {
    const collisionMap: Record<number, 'walkable' | 'blocked' | 'tall_grass'> = {
      [T]: 'blocked', [G]: 'walkable', [P]: 'walkable',
      [TG]: 'tall_grass', [F]: 'blocked', [S]: 'walkable',
    };
    return collisionMap[tile] ?? 'blocked';
  })
);

export const route1: GameMap = {
  id: 'route_1',
  name: 'ROUTE 1',
  width: 16,
  height: 28,
  tilesetId: 'overworld',
  layers: { ground, objects, above },
  collision,
  warps: [],
  connections: [
    { direction: 'up', targetMap: 'viridian_city', offset: 0 },
    { direction: 'down', targetMap: 'pallet_town', offset: 0 },
  ],
  encounters: [
    {
      type: 'grass',
      entries: [
        { speciesId: 16, minLevel: 2, maxLevel: 5, weight: 50 },
        { speciesId: 19, minLevel: 2, maxLevel: 4, weight: 50 },
      ],
    },
  ],
  npcs: [
    {
      id: 'route1_boy',
      x: 9, y: 9,
      spriteId: 'boy',
      direction: 'down',
      movement: 'static',
      dialog: [
        'If your POKeMON is hurt,',
        'go back to PALLET TOWN.',
        'Your MOM will heal them!',
      ],
      isTrainer: false,
    },
  ],
  music: 'route_1',
};
