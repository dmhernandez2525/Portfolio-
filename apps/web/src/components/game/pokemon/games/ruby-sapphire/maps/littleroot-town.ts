// ============================================================================
// Littleroot Town - Starting town for Ruby/Sapphire
// ============================================================================

import type { GameMap } from '../../../engine/types';

const T = 5, G = 1, P = 2, B = 6, R = 7, D = 8, S = 16, FL = 14, FY = 15;

const ground: number[][] = [
  [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T],
  [T, G, G, G, G, G, G, P, P, G, G, G, G, G, G, T],
  [T, G, R, R, R, G, G, P, P, G, G, R, R, R, G, T],
  [T, G, B, B, B, G, G, P, P, G, G, B, B, B, G, T],
  [T, G, B, D, B, G, G, P, P, G, G, B, D, B, G, T],
  [T, G, G, P, G, FL, G, P, P, G, FY, G, P, G, G, T],
  [T, G, G, P, P, P, P, P, P, P, P, P, P, G, G, T],
  [T, G, G, G, G, G, P, S, G, G, G, G, G, G, G, T],
  [T, G, R, R, R, R, P, G, G, G, G, G, G, G, G, T],
  [T, G, B, B, B, B, P, G, G, G, G, G, G, G, G, T],
  [T, G, B, B, D, B, P, G, G, G, FL, G, G, G, G, T],
  [T, G, G, G, P, G, P, P, P, P, P, P, P, G, G, T],
  [T, G, G, G, P, P, P, G, G, G, G, G, P, G, G, T],
  [T, T, T, T, T, T, T, T, T, T, T, G, G, P, P, T],
  [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T],
];

const objects: number[][] = ground.map(() => new Array(16).fill(0));
const above: number[][] = ground.map(() => new Array(16).fill(0));

const collision = ground.map(row =>
  row.map(tile => {
    const map: Record<number, 'walkable' | 'blocked'> = {
      [T]: 'blocked', [G]: 'walkable', [P]: 'walkable',
      [B]: 'blocked', [R]: 'blocked', [D]: 'walkable',
      [S]: 'walkable', [FL]: 'walkable', [FY]: 'walkable',
    };
    return map[tile] ?? 'blocked';
  })
);

export const littlerootTown: GameMap = {
  id: 'littleroot_town',
  name: 'LITTLEROOT TOWN',
  width: 16,
  height: 15,
  tilesetId: 'overworld',
  layers: { ground, objects, above },
  collision,
  warps: [
    { x: 3, y: 4, targetMap: 'player_house_rs', targetX: 3, targetY: 7 },
    { x: 12, y: 4, targetMap: 'rival_house_rs', targetX: 3, targetY: 7 },
    { x: 4, y: 10, targetMap: 'birchs_lab', targetX: 5, targetY: 11 },
  ],
  connections: [
    { direction: 'up', targetMap: 'route_101', offset: 0 },
  ],
  encounters: [],
  npcs: [
    {
      id: 'littleroot_sign', x: 7, y: 7, spriteId: 'sign', direction: 'down',
      movement: 'static',
      dialog: ['LITTLEROOT TOWN', 'A town that can\u0027t be shown on a map.'],
      isTrainer: false,
    },
  ],
  music: 'littleroot_town',
};
