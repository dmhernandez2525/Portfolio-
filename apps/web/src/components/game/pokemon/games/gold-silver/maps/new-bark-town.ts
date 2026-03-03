// ============================================================================
// New Bark Town - Starting town for Gold/Silver
// ============================================================================

import type { GameMap } from '../../../engine/types';

const T = 5, G = 1, P = 2, W = 4, B = 6, R = 7, D = 8, S = 16, FL = 14;

const ground: number[][] = [
  [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T],
  [T, G, G, G, G, G, G, G, P, P, G, G, G, G, G, G, G, T],
  [T, G, R, R, R, G, G, G, P, P, G, G, G, R, R, R, G, T],
  [T, G, B, B, B, G, G, G, P, P, G, G, G, B, B, B, G, T],
  [T, G, B, D, B, G, G, G, P, P, G, G, G, B, D, B, G, T],
  [T, G, G, P, G, G, FL, G, P, P, G, FL, G, G, P, G, G, T],
  [T, G, G, P, P, P, P, P, P, P, P, P, P, P, P, G, G, T],
  [T, G, G, G, G, G, P, P, G, G, S, G, G, G, G, G, G, T],
  [T, G, R, R, R, R, P, G, G, G, G, G, G, G, G, G, G, T],
  [T, G, B, B, B, B, P, G, G, G, G, G, G, G, G, G, G, T],
  [T, G, B, B, D, B, P, G, G, G, G, G, G, G, G, G, G, T],
  [T, G, G, G, P, G, P, P, P, P, P, P, P, P, P, G, G, T],
  [T, G, G, G, P, P, P, G, G, G, G, G, G, G, P, G, G, T],
  [T, W, W, W, W, W, W, W, W, W, W, W, W, W, P, G, G, T],
  [T, W, W, W, W, W, W, W, W, W, W, W, W, W, P, P, G, T],
  [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T],
];

const objects: number[][] = ground.map(() => new Array(18).fill(0));
const above: number[][] = ground.map(() => new Array(18).fill(0));

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

export const newBarkTown: GameMap = {
  id: 'new_bark_town',
  name: 'NEW BARK TOWN',
  width: 18,
  height: 16,
  tilesetId: 'overworld',
  layers: { ground, objects, above },
  collision,
  warps: [
    { x: 3, y: 4, targetMap: 'player_house_gs', targetX: 3, targetY: 7 },
    { x: 14, y: 4, targetMap: 'neighbor_house_gs', targetX: 3, targetY: 7 },
    { x: 4, y: 10, targetMap: 'elms_lab', targetX: 5, targetY: 11 },
  ],
  connections: [
    { direction: 'right', targetMap: 'route_29', offset: 0 },
  ],
  encounters: [],
  npcs: [
    {
      id: 'new_bark_sign', x: 10, y: 7, spriteId: 'sign', direction: 'down',
      movement: 'static',
      dialog: ['NEW BARK TOWN', 'Winds of a New Beginning'],
      isTrainer: false,
    },
    {
      id: 'new_bark_girl', x: 7, y: 5, spriteId: 'girl', direction: 'down',
      movement: 'wander',
      dialog: ['PROF. ELM\u0027s LAB is right there!', 'He researches POKeMON evolution.'],
      isTrainer: false,
    },
  ],
  music: 'new_bark_town',
};
