// ============================================================================
// Cerulean City - Misty's Gym, Nugget Bridge access
// ============================================================================

import type { GameMap } from '../../../engine/types';

const T = 5, G = 1, P = 2, W = 4, B = 6, R = 7, D = 8, S = 16, FL = 14;

const ground: number[][] = [
  [T, T, T, T, T, T, T, T, G, G, P, P, G, G, T, T, T, T, T, T],
  [T, T, T, G, G, G, G, G, G, G, P, P, G, G, G, G, G, G, T, T],
  // Bike Shop + houses
  [T, G, R, R, R, G, G, G, G, G, P, P, G, G, G, R, R, R, G, T],
  [T, G, B, B, B, G, G, G, G, G, P, P, G, G, G, B, B, B, G, T],
  [T, G, B, D, B, G, G, G, P, P, P, P, P, P, G, B, D, B, G, T],
  [T, G, G, P, G, G, G, G, P, G, G, G, G, P, G, G, P, G, G, T],
  // Gym area
  [T, G, G, P, P, P, P, P, P, G, G, G, G, P, P, P, P, G, G, T],
  [T, G, G, G, G, G, G, G, P, G, R, R, R, P, G, G, G, G, G, T],
  [T, G, G, G, G, G, G, G, P, G, B, B, B, P, G, G, G, G, G, T],
  [T, G, G, G, FL, G, G, G, P, G, B, D, B, P, G, G, FL, G, G, T],
  // Pokemon Center + Mart
  [T, G, R, R, R, G, G, P, P, P, P, P, P, P, G, R, R, R, G, T],
  [T, G, B, B, B, G, G, P, G, G, S, G, G, G, G, B, B, B, G, T],
  [T, G, B, D, B, G, G, P, G, G, G, G, G, G, G, B, D, B, G, T],
  // South path + water
  [T, G, G, P, G, G, P, P, G, G, G, G, G, G, G, G, P, G, G, T],
  [T, G, G, P, P, P, P, G, G, W, W, W, W, G, G, G, P, G, G, T],
  [T, G, G, G, G, G, P, G, W, W, W, W, W, W, G, P, P, G, G, T],
  [T, T, G, G, G, G, P, P, G, W, W, W, W, G, P, P, G, G, T, T],
  [T, T, T, G, G, G, G, P, P, G, G, G, G, P, P, G, G, G, T, T],
  [T, T, T, T, G, G, G, G, P, P, P, P, P, P, G, G, G, T, T, T],
  [T, T, T, T, T, T, T, G, G, P, P, G, G, G, G, T, T, T, T, T],
];

const objects: number[][] = ground.map(() => new Array(20).fill(0));
const above: number[][] = ground.map(() => new Array(20).fill(0));

const collision = ground.map(row =>
  row.map(tile => {
    const map: Record<number, 'walkable' | 'blocked' | 'surfable'> = {
      [T]: 'blocked', [G]: 'walkable', [P]: 'walkable', [W]: 'surfable',
      [B]: 'blocked', [R]: 'blocked', [D]: 'walkable',
      [S]: 'walkable', [FL]: 'walkable',
    };
    return map[tile] ?? 'blocked';
  })
);

export const ceruleanCity: GameMap = {
  id: 'cerulean_city',
  name: 'CERULEAN CITY',
  width: 20,
  height: 20,
  tilesetId: 'overworld',
  layers: { ground, objects, above },
  collision,
  warps: [
    { x: 3, y: 4, targetMap: 'cerulean_bike_shop', targetX: 3, targetY: 7 },
    { x: 16, y: 4, targetMap: 'cerulean_house', targetX: 3, targetY: 7 },
    { x: 11, y: 9, targetMap: 'cerulean_gym', targetX: 5, targetY: 11 },
    { x: 3, y: 12, targetMap: 'cerulean_pokecenter', targetX: 3, targetY: 7 },
    { x: 16, y: 12, targetMap: 'cerulean_mart', targetX: 3, targetY: 7 },
  ],
  connections: [
    { direction: 'up', targetMap: 'route_24', offset: 0 },
    { direction: 'down', targetMap: 'route_5', offset: 0 },
    { direction: 'left', targetMap: 'route_4', offset: 0 },
  ],
  encounters: [],
  npcs: [
    {
      id: 'cerulean_sign',
      x: 10, y: 11,
      spriteId: 'sign',
      direction: 'down',
      movement: 'static',
      dialog: ['CERULEAN CITY', 'A Mysterious, Blue Aura Surrounds It'],
      isTrainer: false,
    },
    {
      id: 'cerulean_girl',
      x: 6, y: 6,
      spriteId: 'girl',
      direction: 'down',
      movement: 'wander',
      dialog: [
        'A robber broke into my house!',
        'He broke through the wall!',
        'It was TEAM ROCKET!',
      ],
      isTrainer: false,
    },
  ],
  music: 'cerulean_city',
};
