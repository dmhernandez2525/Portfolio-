// ============================================================================
// Pewter City - Home of Brock's Gym and Museum
// ============================================================================

import type { GameMap } from '../../../engine/types';

const T = 5, G = 1, P = 2, B = 6, R = 7, D = 8, S = 16, FL = 14;
const RK = 11; // rock

const ground: number[][] = [
  [T, T, T, T, T, T, G, G, P, P, G, G, G, T, T, T, T, T, T, T],
  [T, T, T, G, G, G, G, G, P, P, G, G, G, G, G, T, T, T, T, T],
  // Museum area (top)
  [T, G, R, R, R, R, R, G, P, P, G, G, G, G, G, G, G, G, G, T],
  [T, G, B, B, B, B, B, G, P, P, G, G, G, G, G, G, G, G, G, T],
  [T, G, B, B, D, B, B, G, P, P, P, P, P, P, P, G, G, G, G, T],
  [T, G, G, G, P, G, G, G, P, G, G, G, G, G, P, G, G, G, G, T],
  // Gym area
  [T, G, G, G, P, P, P, P, P, G, G, R, R, R, P, G, G, G, G, T],
  [T, G, G, G, G, G, G, G, P, G, G, B, B, B, P, G, G, G, G, T],
  [T, G, G, G, G, RK, G, G, P, G, G, B, D, B, P, G, G, G, G, T],
  [T, G, G, G, G, G, G, G, P, G, G, G, P, G, P, G, G, G, G, T],
  // Pokemon Center + Mart
  [T, G, R, R, R, G, G, P, P, P, P, P, P, P, P, R, R, R, G, T],
  [T, G, B, B, B, G, G, P, P, G, G, G, G, G, G, B, B, B, G, T],
  [T, G, B, D, B, G, G, P, P, G, S, G, G, G, G, B, D, B, G, T],
  // South exit
  [T, G, G, P, G, G, P, P, G, G, G, G, G, G, G, G, P, G, G, T],
  [T, G, G, P, P, P, P, P, G, G, FL, G, G, G, G, G, P, G, G, T],
  [T, G, G, G, G, G, P, P, G, G, G, G, G, G, G, P, P, G, G, T],
  [T, T, G, G, G, G, P, P, G, G, G, G, G, G, P, P, G, G, T, T],
  [T, T, T, T, T, G, G, P, P, G, G, G, G, P, P, G, G, T, T, T],
  [T, T, T, T, T, T, G, G, P, P, G, G, P, P, G, G, T, T, T, T],
  [T, T, T, T, T, T, T, G, G, P, P, P, P, G, G, T, T, T, T, T],
];

const objects: number[][] = ground.map(() => new Array(20).fill(0));
const above: number[][] = ground.map(() => new Array(20).fill(0));

const collision = ground.map(row =>
  row.map(tile => {
    const map: Record<number, 'walkable' | 'blocked'> = {
      [T]: 'blocked', [G]: 'walkable', [P]: 'walkable',
      [B]: 'blocked', [R]: 'blocked', [D]: 'walkable',
      [S]: 'walkable', [FL]: 'walkable', [RK]: 'blocked',
    };
    return map[tile] ?? 'blocked';
  })
);

export const pewterCity: GameMap = {
  id: 'pewter_city',
  name: 'PEWTER CITY',
  width: 20,
  height: 20,
  tilesetId: 'overworld',
  layers: { ground, objects, above },
  collision,
  warps: [
    { x: 4, y: 4, targetMap: 'pewter_museum', targetX: 5, targetY: 9 },
    { x: 12, y: 8, targetMap: 'pewter_gym', targetX: 5, targetY: 11 },
    { x: 3, y: 12, targetMap: 'pewter_pokecenter', targetX: 3, targetY: 7 },
    { x: 16, y: 12, targetMap: 'pewter_mart', targetX: 3, targetY: 7 },
  ],
  connections: [
    { direction: 'down', targetMap: 'route_2', offset: 0 },
    { direction: 'up', targetMap: 'route_3', offset: 0 },
  ],
  encounters: [],
  npcs: [
    {
      id: 'pewter_guide',
      x: 6, y: 8,
      spriteId: 'boy',
      direction: 'right',
      movement: 'static',
      dialog: [
        'You should challenge BROCK!',
        'He\u0027s the GYM LEADER here.',
        'His POKeMON are all ROCK type.',
        'WATER and GRASS moves work great!',
      ],
      isTrainer: false,
    },
    {
      id: 'pewter_sign',
      x: 10, y: 12,
      spriteId: 'sign',
      direction: 'down',
      movement: 'static',
      dialog: ['PEWTER CITY', 'A Stone Gray City'],
      isTrainer: false,
    },
  ],
  music: 'pewter_city',
};
