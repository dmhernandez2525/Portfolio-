// ============================================================================
// Viridian City — First city with PokeMart and late-game Gym
// ============================================================================

import type { GameMap } from '../../../engine/types';

const T = 5, G = 1, P = 2, TG = 3, W = 4, B = 6, R = 7, D = 8;
const F = 12, S = 16, FL = 14;

const ground: number[][] = [
  // Row 0 - North border (exit to Route 2)
  [T, T, T, T, T, G, G, P, P, G, G, T, T, T, T, T, T, T, T, T],
  [T, T, T, G, G, G, G, P, P, G, G, G, G, G, T, T, T, T, T, T],
  // Row 2-3 - Viridian Gym area (top left)
  [T, G, R, R, R, G, G, P, P, G, G, G, G, G, G, G, G, G, G, T],
  [T, G, B, B, B, G, G, P, P, G, G, FL, G, G, G, G, G, G, G, T],
  [T, G, B, D, B, G, G, P, P, P, P, P, P, P, P, P, G, G, G, T],
  // Row 5 - Path + open area
  [T, G, G, P, G, G, G, P, P, G, G, G, G, G, G, P, G, G, G, T],
  [T, G, G, P, P, P, P, P, P, G, G, G, G, G, G, P, G, G, G, T],
  // Row 7-9 - Center area with PokeMart
  [T, G, G, G, G, G, P, P, G, G, S, G, G, R, R, R, G, G, G, T],
  [T, G, G, G, G, G, P, P, G, G, G, G, G, B, B, B, G, G, G, T],
  [T, G, G, G, G, G, P, P, P, P, P, P, P, B, D, B, G, G, G, T],
  // Row 10-11 - Path + Pokemon Center
  [T, G, R, R, R, G, P, P, G, G, G, G, G, G, P, G, G, G, G, T],
  [T, G, B, B, B, G, P, P, G, G, G, G, G, G, P, G, G, G, G, T],
  [T, G, B, D, B, G, P, P, G, G, G, FL, G, G, P, P, P, G, G, T],
  // Row 13 - South path
  [T, G, G, P, G, G, P, P, G, G, G, G, G, G, G, G, P, G, G, T],
  [T, G, G, P, P, P, P, P, G, G, G, G, G, G, G, G, P, G, G, T],
  // Row 15-16 - Pond area
  [T, G, G, G, G, G, P, P, G, G, W, W, W, G, G, G, P, G, G, T],
  [T, G, G, G, G, G, P, P, G, W, W, W, W, W, G, G, P, G, G, T],
  // Row 17-18 - South exit to Route 1
  [T, T, G, G, G, G, P, P, G, G, W, W, W, G, G, P, P, G, T, T],
  [T, T, T, G, G, G, G, P, P, G, G, G, G, G, P, P, G, G, T, T],
  [T, T, T, T, T, T, G, G, P, P, G, G, T, T, T, T, T, T, T, T],
];

const objects: number[][] = ground.map(() => new Array(20).fill(0));
const above: number[][] = ground.map(() => new Array(20).fill(0));

const collision = ground.map(row =>
  row.map(tile => {
    const map: Record<number, 'walkable' | 'blocked' | 'tall_grass' | 'surfable'> = {
      [T]: 'blocked', [G]: 'walkable', [P]: 'walkable', [TG]: 'tall_grass',
      [W]: 'surfable', [B]: 'blocked', [R]: 'blocked', [D]: 'walkable',
      [F]: 'blocked', [S]: 'walkable', [FL]: 'walkable',
    };
    return map[tile] ?? 'blocked';
  })
);

export const viridianCity: GameMap = {
  id: 'viridian_city',
  name: 'VIRIDIAN CITY',
  width: 20,
  height: 20,
  tilesetId: 'overworld',
  layers: { ground, objects, above },
  collision,
  warps: [
    { x: 3, y: 4, targetMap: 'viridian_gym', targetX: 5, targetY: 11 },
    { x: 14, y: 9, targetMap: 'viridian_mart', targetX: 3, targetY: 7 },
    { x: 3, y: 12, targetMap: 'viridian_pokecenter', targetX: 3, targetY: 7 },
  ],
  connections: [
    { direction: 'up', targetMap: 'route_2', offset: 0 },
    { direction: 'down', targetMap: 'route_1', offset: 0 },
  ],
  encounters: [],
  npcs: [
    {
      id: 'viridian_old_man',
      x: 8, y: 5,
      spriteId: 'old_man',
      direction: 'down',
      movement: 'static',
      dialog: [
        'I just had my coffee and',
        'I feel great!',
        'Sure, I\u0027ll show you how',
        'to catch POKeMON!',
      ],
      isTrainer: false,
    },
    {
      id: 'viridian_sign',
      x: 10, y: 7,
      spriteId: 'sign',
      direction: 'down',
      movement: 'static',
      dialog: ['VIRIDIAN CITY', 'The Eternally Green Paradise'],
      isTrainer: false,
    },
  ],
  music: 'viridian_city',
};
