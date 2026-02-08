// ============================================================================
// Mt. Moon — Cave dungeon between Route 3 and Route 4
// ============================================================================

import type { GameMap } from '../../../engine/types';

const G = 1, P = 2, RK = 11, W = 4;
// Reuse rock (11) for cave walls
const CV = RK; // cave wall

const ground: number[][] = [
  [CV,CV,CV,CV,CV,CV,CV,CV,CV,CV,CV,CV,CV,CV,CV,CV,CV,CV,CV,CV],
  [CV, G, G, G,CV,CV,CV, G, G, G, G, G,CV,CV,CV, G, G, G, G,CV],
  [CV, G, G, G, G,CV, G, G, G,CV,CV, G, G,CV, G, G, G, G, G,CV],
  [CV, G, G, G, G, G, G, G, G,CV,CV, G, G, G, G, G,CV, G, G,CV],
  [CV,CV, G, G, G, G, G,CV, G, G, G, G, G, G, G, G,CV, G, G,CV],
  [CV,CV,CV, G, G, G, G,CV,CV, G, G, G, G,CV,CV, G, G, G,CV,CV],
  [CV, G, G, G, G,CV, G, G, G, G, G, G, G, G, G, G, G, G, G,CV],
  [CV, G, G, G, G,CV, G, G, G, G,CV,CV, G, G, G, G, G,CV, G,CV],
  [CV, G, G,CV, G, G, G, G,CV, G,CV,CV,CV, G, G, G, G,CV, G,CV],
  [CV, G, G,CV,CV, G, G, G,CV, G, G, G, G, G, G,CV, G, G, G,CV],
  [CV, G, G, G,CV,CV, G, G, G, G, G, G, G, G, G,CV, G, G, G,CV],
  [CV, G, G, G, G,CV, G, G, G,CV, G, G, G,CV, G, G, G, G,CV,CV],
  [CV, G, G, G, G, G, G, G, G,CV,CV, G, G,CV,CV, G, G, G,CV,CV],
  [CV, G, G,CV,CV, G, G, G, G, G,CV, G, G, G, G, G, G, G, G,CV],
  [CV, G, G,CV, G, G, G,CV, G, G, G, G, G, G, G, G, G, G, G,CV],
  [CV, G, G, G, G, G, G,CV,CV, G, G, G,CV, G, G,CV, G, G, G,CV],
  [CV, G, G, G, G, G, G, G, G, G, G, G,CV,CV, G,CV, G, G, G,CV],
  [CV,CV, G, G, G,CV, G, G, G, G, G, G, G,CV, G, G, G, G,CV,CV],
  [CV,CV,CV, G, G,CV,CV, G, G, G, G, G, G, G, G, G, G, G,CV,CV],
  [CV,CV,CV,CV,CV,CV,CV,CV,CV,CV,CV,CV,CV,CV,CV,CV,CV,CV,CV,CV],
];

const objects: number[][] = ground.map(() => new Array(20).fill(0));
const above: number[][] = ground.map(() => new Array(20).fill(0));

const collision = ground.map(row =>
  row.map(tile => {
    const map: Record<number, 'walkable' | 'blocked' | 'surfable'> = {
      [CV]: 'blocked', [G]: 'walkable', [P]: 'walkable', [W]: 'surfable',
    };
    return map[tile] ?? 'blocked';
  })
);

export const mtMoon: GameMap = {
  id: 'mt_moon',
  name: 'MT. MOON',
  width: 20,
  height: 20,
  tilesetId: 'cave',
  layers: { ground, objects, above },
  collision,
  warps: [
    { x: 1, y: 1, targetMap: 'route_3', targetX: 28, targetY: 4 },
    { x: 18, y: 18, targetMap: 'route_4', targetX: 1, targetY: 4 },
  ],
  connections: [],
  encounters: [
    {
      type: 'cave',
      entries: [
        { speciesId: 41, minLevel: 7, maxLevel: 10, weight: 40 },
        { speciesId: 35, minLevel: 8, maxLevel: 11, weight: 10 },
        { speciesId: 46, minLevel: 8, maxLevel: 10, weight: 20 },
        { speciesId: 74, minLevel: 7, maxLevel: 10, weight: 30 },
      ],
    },
  ],
  npcs: [
    {
      id: 'mt_moon_rocket_1',
      x: 10, y: 6,
      spriteId: 'rocket',
      direction: 'down',
      movement: 'static',
      dialog: ['Stop right there!', 'TEAM ROCKET will never let', 'you take the fossils!'],
      isTrainer: true,
      trainerData: {
        id: 'rocket_mt_moon_1',
        party: [
          { speciesId: 19, level: 11 },
          { speciesId: 41, level: 11 },
        ],
      },
    },
    {
      id: 'mt_moon_scientist',
      x: 5, y: 14,
      spriteId: 'scientist',
      direction: 'right',
      movement: 'static',
      dialog: [
        'I found these fossils!',
        'You can have one.',
        'Choose the HELIX FOSSIL',
        'or the DOME FOSSIL.',
      ],
      isTrainer: false,
    },
  ],
  music: 'mt_moon',
};
