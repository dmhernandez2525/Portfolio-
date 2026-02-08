// ============================================================================
// Johto Maps — Routes, Cities, Dungeons, and Interiors
// ============================================================================

import type { GameMap } from '../../../engine/types';

const T = 5, G = 1, P = 2, TG = 3, W = 4, B = 6, R = 7, D = 8;
const S = 16, FL = 14;

// --- Map generator helpers ---

function makeRoute(
  id: string, name: string, width: number, height: number,
  connections: GameMap['connections'],
  encounters: GameMap['encounters'],
  npcs: GameMap['npcs'] = [],
): GameMap {
  const ground = Array.from({ length: height }, (_, y) => {
    const row = new Array(width).fill(G);
    row[0] = T; row[width - 1] = T;
    if (y === 0 || y === height - 1) { row.fill(T); row[Math.floor(width / 2)] = P; row[Math.floor(width / 2) + 1] = P; }
    else { row[Math.floor(width / 2)] = P; row[Math.floor(width / 2) + 1] = P; }
    return row;
  });
  return {
    id, name, width, height, tilesetId: 'overworld',
    layers: { ground, objects: ground.map(() => new Array(width).fill(0)), above: ground.map(() => new Array(width).fill(0)) },
    collision: ground.map(row => row.map(tile => {
      const m: Record<number, string> = { [T]: 'blocked', [G]: 'walkable', [P]: 'walkable', [TG]: 'tall_grass', [W]: 'surfable' };
      return (m[tile] ?? 'blocked') as 'walkable' | 'blocked' | 'tall_grass' | 'surfable';
    })),
    warps: [], connections, encounters, npcs,
    music: name.toLowerCase().includes('route') ? 'route' : 'city',
  };
}

function makeCity(
  id: string, name: string, width: number, height: number,
  connections: GameMap['connections'],
  warps: GameMap['warps'],
  npcs: GameMap['npcs'] = [],
): GameMap {
  const map = makeRoute(id, name, width, height, connections, [], npcs);
  const g = map.layers.ground;
  const mx = Math.floor(width / 2);
  const my = Math.floor(height / 2);
  // Place buildings
  for (let dy = -2; dy <= 0; dy++) {
    for (let dx = -2; dx <= 0; dx++) {
      const y = my + dy, x = mx + dx + 4;
      if (y >= 0 && y < height && x >= 0 && x < width) g[y][x] = dy === -2 ? R : (dy === 0 && dx === -1 ? D : B);
    }
  }
  for (let dy = -2; dy <= 0; dy++) {
    for (let dx = -2; dx <= 0; dx++) {
      const y = my + dy, x = mx + dx - 2;
      if (y >= 0 && y < height && x >= 0 && x < width) g[y][x] = dy === -2 ? R : (dy === 0 && dx === -1 ? D : B);
    }
  }
  map.collision = g.map(row => row.map(tile => {
    const m: Record<number, string> = {
      [T]: 'blocked', [G]: 'walkable', [P]: 'walkable', [W]: 'surfable',
      [B]: 'blocked', [R]: 'blocked', [D]: 'walkable', [S]: 'walkable', [FL]: 'walkable',
    };
    return (m[tile] ?? 'blocked') as 'walkable' | 'blocked' | 'surfable';
  }));
  map.warps = warps;
  return map;
}

function makeInterior(
  id: string, name: string, width: number, height: number,
  exitTarget: string, exitX: number, exitY: number,
  npcs: GameMap['npcs'] = [],
): GameMap {
  const WL = 9;
  const ground = Array.from({ length: height }, (_, y) => {
    const row = new Array(width).fill(1);
    if (y === 0) row.fill(WL);
    row[0] = WL; row[width - 1] = WL;
    if (y === height - 1) { row.fill(WL); row[Math.floor(width / 2)] = D; }
    return row;
  });
  return {
    id, name, width, height, tilesetId: 'interior',
    layers: { ground, objects: ground.map(() => new Array(width).fill(0)), above: ground.map(() => new Array(width).fill(0)) },
    collision: ground.map(row => row.map(tile => (tile === WL || tile === B) ? 'blocked' as const : 'walkable' as const)),
    warps: [{ x: Math.floor(width / 2), y: height - 1, targetMap: exitTarget, targetX: exitX, targetY: exitY }],
    connections: [], encounters: [], npcs,
    music: name.toLowerCase().includes('gym') ? 'gym' : 'indoor',
  };
}

// --- Routes ---

export const route29 = makeRoute('route_29', 'ROUTE 29', 20, 12,
  [{ direction: 'left', targetMap: 'new_bark_town', offset: 0 }, { direction: 'right', targetMap: 'cherrygrove_city', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 16, minLevel: 2, maxLevel: 5, weight: 35 },
    { speciesId: 161, minLevel: 2, maxLevel: 5, weight: 35 },
    { speciesId: 187, minLevel: 3, maxLevel: 5, weight: 15 },
    { speciesId: 19, minLevel: 3, maxLevel: 4, weight: 15 },
  ]}],
);

export const route30 = makeRoute('route_30', 'ROUTE 30', 14, 20,
  [{ direction: 'down', targetMap: 'cherrygrove_city', offset: 0 }, { direction: 'up', targetMap: 'route_31', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 16, minLevel: 3, maxLevel: 5, weight: 30 },
    { speciesId: 10, minLevel: 3, maxLevel: 5, weight: 20 },
    { speciesId: 60, minLevel: 4, maxLevel: 5, weight: 15 },
    { speciesId: 187, minLevel: 3, maxLevel: 5, weight: 35 },
  ]}],
);

export const route31 = makeRoute('route_31', 'ROUTE 31', 20, 10,
  [{ direction: 'left', targetMap: 'route_30', offset: 0 }, { direction: 'right', targetMap: 'violet_city', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 16, minLevel: 4, maxLevel: 6, weight: 30 },
    { speciesId: 69, minLevel: 4, maxLevel: 6, weight: 25 },
    { speciesId: 187, minLevel: 5, maxLevel: 6, weight: 25 },
    { speciesId: 60, minLevel: 4, maxLevel: 6, weight: 20 },
  ]}],
);

export const route32 = makeRoute('route_32', 'ROUTE 32', 14, 24,
  [{ direction: 'up', targetMap: 'violet_city', offset: 0 }, { direction: 'down', targetMap: 'union_cave_entrance', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 19, minLevel: 6, maxLevel: 8, weight: 20 },
    { speciesId: 179, minLevel: 6, maxLevel: 8, weight: 25 },
    { speciesId: 69, minLevel: 6, maxLevel: 8, weight: 20 },
    { speciesId: 194, minLevel: 6, maxLevel: 8, weight: 20 },
    { speciesId: 187, minLevel: 6, maxLevel: 8, weight: 15 },
  ]}],
);

export const route33 = makeRoute('route_33', 'ROUTE 33', 16, 10,
  [{ direction: 'left', targetMap: 'union_cave_exit', offset: 0 }, { direction: 'right', targetMap: 'azalea_town', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 21, minLevel: 6, maxLevel: 8, weight: 30 },
    { speciesId: 19, minLevel: 6, maxLevel: 8, weight: 25 },
    { speciesId: 187, minLevel: 6, maxLevel: 8, weight: 20 },
    { speciesId: 23, minLevel: 6, maxLevel: 8, weight: 25 },
  ]}],
);

export const route34 = makeRoute('route_34', 'ROUTE 34', 14, 18,
  [{ direction: 'down', targetMap: 'azalea_town', offset: 0 }, { direction: 'up', targetMap: 'goldenrod_city', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 19, minLevel: 10, maxLevel: 12, weight: 20 },
    { speciesId: 63, minLevel: 10, maxLevel: 12, weight: 15 },
    { speciesId: 96, minLevel: 10, maxLevel: 12, weight: 20 },
    { speciesId: 183, minLevel: 10, maxLevel: 12, weight: 25 },
    { speciesId: 132, minLevel: 10, maxLevel: 10, weight: 10 },
    { speciesId: 16, minLevel: 10, maxLevel: 12, weight: 10 },
  ]}],
);

export const route35 = makeRoute('route_35', 'ROUTE 35', 14, 16,
  [{ direction: 'down', targetMap: 'goldenrod_city', offset: 0 }, { direction: 'up', targetMap: 'route_36', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 29, minLevel: 12, maxLevel: 14, weight: 20 },
    { speciesId: 32, minLevel: 12, maxLevel: 14, weight: 20 },
    { speciesId: 96, minLevel: 12, maxLevel: 14, weight: 20 },
    { speciesId: 16, minLevel: 12, maxLevel: 14, weight: 20 },
    { speciesId: 183, minLevel: 12, maxLevel: 14, weight: 20 },
  ]}],
);

export const route36 = makeRoute('route_36', 'ROUTE 36', 20, 10,
  [{ direction: 'left', targetMap: 'route_35', offset: 0 }, { direction: 'right', targetMap: 'ecruteak_city', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 29, minLevel: 13, maxLevel: 15, weight: 20 },
    { speciesId: 32, minLevel: 13, maxLevel: 15, weight: 20 },
    { speciesId: 37, minLevel: 13, maxLevel: 15, weight: 15 },
    { speciesId: 58, minLevel: 13, maxLevel: 15, weight: 15 },
    { speciesId: 185, minLevel: 20, maxLevel: 20, weight: 10 },
    { speciesId: 161, minLevel: 13, maxLevel: 15, weight: 20 },
  ]}],
);

export const route38 = makeRoute('route_38', 'ROUTE 38', 20, 10,
  [{ direction: 'right', targetMap: 'ecruteak_city', offset: 0 }, { direction: 'left', targetMap: 'route_39', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 19, minLevel: 16, maxLevel: 18, weight: 20 },
    { speciesId: 128, minLevel: 16, maxLevel: 18, weight: 15 },
    { speciesId: 241, minLevel: 16, maxLevel: 18, weight: 15 },
    { speciesId: 39, minLevel: 16, maxLevel: 18, weight: 15 },
    { speciesId: 52, minLevel: 16, maxLevel: 18, weight: 15 },
    { speciesId: 56, minLevel: 16, maxLevel: 18, weight: 20 },
  ]}],
);

export const route39 = makeRoute('route_39', 'ROUTE 39', 14, 16,
  [{ direction: 'up', targetMap: 'route_38', offset: 0 }, { direction: 'down', targetMap: 'olivine_city', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 19, minLevel: 16, maxLevel: 18, weight: 20 },
    { speciesId: 128, minLevel: 16, maxLevel: 18, weight: 15 },
    { speciesId: 241, minLevel: 16, maxLevel: 18, weight: 15 },
    { speciesId: 52, minLevel: 16, maxLevel: 18, weight: 25 },
    { speciesId: 56, minLevel: 16, maxLevel: 18, weight: 25 },
  ]}],
);

export const route42 = makeRoute('route_42', 'ROUTE 42', 20, 10,
  [{ direction: 'left', targetMap: 'mahogany_town', offset: 0 }, { direction: 'right', targetMap: 'ecruteak_city', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 56, minLevel: 23, maxLevel: 25, weight: 25 },
    { speciesId: 21, minLevel: 23, maxLevel: 25, weight: 25 },
    { speciesId: 41, minLevel: 23, maxLevel: 25, weight: 20 },
    { speciesId: 179, minLevel: 23, maxLevel: 25, weight: 30 },
  ]}],
);

export const route43 = makeRoute('route_43', 'ROUTE 43', 14, 20,
  [{ direction: 'down', targetMap: 'mahogany_town', offset: 0 }, { direction: 'up', targetMap: 'lake_of_rage', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 16, minLevel: 25, maxLevel: 27, weight: 20 },
    { speciesId: 17, minLevel: 25, maxLevel: 27, weight: 10 },
    { speciesId: 203, minLevel: 25, maxLevel: 27, weight: 15 },
    { speciesId: 178, minLevel: 25, maxLevel: 27, weight: 15 },
    { speciesId: 22, minLevel: 25, maxLevel: 27, weight: 10 },
    { speciesId: 180, minLevel: 25, maxLevel: 27, weight: 30 },
  ]}],
);

export const route44 = makeRoute('route_44', 'ROUTE 44', 20, 10,
  [{ direction: 'left', targetMap: 'mahogany_town', offset: 0 }, { direction: 'right', targetMap: 'ice_path_entrance', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 69, minLevel: 24, maxLevel: 26, weight: 25 },
    { speciesId: 70, minLevel: 24, maxLevel: 26, weight: 15 },
    { speciesId: 47, minLevel: 24, maxLevel: 26, weight: 20 },
    { speciesId: 114, minLevel: 24, maxLevel: 26, weight: 20 },
    { speciesId: 178, minLevel: 24, maxLevel: 26, weight: 20 },
  ]}],
);

export const route45 = makeRoute('route_45', 'ROUTE 45', 14, 24,
  [{ direction: 'up', targetMap: 'blackthorn_city', offset: 0 }, { direction: 'down', targetMap: 'route_46', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 74, minLevel: 24, maxLevel: 28, weight: 20 },
    { speciesId: 231, minLevel: 20, maxLevel: 23, weight: 15 },
    { speciesId: 84, minLevel: 24, maxLevel: 28, weight: 20 },
    { speciesId: 227, minLevel: 24, maxLevel: 28, weight: 15 },
    { speciesId: 207, minLevel: 24, maxLevel: 28, weight: 15 },
    { speciesId: 75, minLevel: 26, maxLevel: 28, weight: 15 },
  ]}],
);

export const route46 = makeRoute('route_46', 'ROUTE 46', 14, 16,
  [{ direction: 'up', targetMap: 'route_45', offset: 0 }, { direction: 'down', targetMap: 'route_29', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 74, minLevel: 2, maxLevel: 5, weight: 25 },
    { speciesId: 21, minLevel: 2, maxLevel: 5, weight: 25 },
    { speciesId: 19, minLevel: 2, maxLevel: 5, weight: 25 },
    { speciesId: 41, minLevel: 2, maxLevel: 5, weight: 25 },
  ]}],
);

// --- Cities ---

export const violetCity = makeCity('violet_city', 'VIOLET CITY', 20, 18,
  [{ direction: 'left', targetMap: 'route_31', offset: 0 }, { direction: 'down', targetMap: 'route_32', offset: 0 }],
  [
    { x: 12, y: 8, targetMap: 'violet_gym', targetX: 6, targetY: 11 },
    { x: 8, y: 8, targetMap: 'violet_pokecenter', targetX: 3, targetY: 7 },
  ],
  [{ id: 'violet_sign', x: 10, y: 10, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['VIOLET CITY', 'The City of Nostalgic Scents'], isTrainer: false }],
);

export const azaleaTown = makeCity('azalea_town', 'AZALEA TOWN', 18, 16,
  [{ direction: 'left', targetMap: 'route_33', offset: 0 }, { direction: 'up', targetMap: 'route_34', offset: 0 }],
  [
    { x: 11, y: 7, targetMap: 'azalea_gym', targetX: 6, targetY: 11 },
    { x: 7, y: 7, targetMap: 'azalea_pokecenter', targetX: 3, targetY: 7 },
  ],
  [{ id: 'azalea_sign', x: 9, y: 9, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['AZALEA TOWN', 'Living Pokemon Lore'], isTrainer: false }],
);

export const goldenrodCity = makeCity('goldenrod_city', 'GOLDENROD CITY', 24, 20,
  [{ direction: 'down', targetMap: 'route_34', offset: 0 }, { direction: 'up', targetMap: 'route_35', offset: 0 }],
  [
    { x: 14, y: 9, targetMap: 'goldenrod_gym', targetX: 6, targetY: 11 },
    { x: 10, y: 9, targetMap: 'goldenrod_pokecenter', targetX: 3, targetY: 7 },
  ],
  [{ id: 'goldenrod_sign', x: 12, y: 11, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['GOLDENROD CITY', 'A Happening Big City'], isTrainer: false }],
);

export const ecruteakCity = makeCity('ecruteak_city', 'ECRUTEAK CITY', 20, 18,
  [{ direction: 'left', targetMap: 'route_38', offset: 0 }, { direction: 'right', targetMap: 'route_42', offset: 0 },
   { direction: 'down', targetMap: 'route_36', offset: 0 }],
  [
    { x: 12, y: 8, targetMap: 'ecruteak_gym', targetX: 6, targetY: 11 },
    { x: 8, y: 8, targetMap: 'ecruteak_pokecenter', targetX: 3, targetY: 7 },
  ],
  [{ id: 'ecruteak_sign', x: 10, y: 10, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['ECRUTEAK CITY', 'A Historical City'], isTrainer: false }],
);

export const olivineCity = makeCity('olivine_city', 'OLIVINE CITY', 20, 18,
  [{ direction: 'up', targetMap: 'route_39', offset: 0 }],
  [
    { x: 12, y: 8, targetMap: 'olivine_gym', targetX: 6, targetY: 11 },
    { x: 8, y: 8, targetMap: 'olivine_pokecenter', targetX: 3, targetY: 7 },
  ],
  [{ id: 'olivine_sign', x: 10, y: 10, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['OLIVINE CITY', 'The Port with the Sea Breeze'], isTrainer: false }],
);

export const cianwoodCity = makeCity('cianwood_city', 'CIANWOOD CITY', 18, 16,
  [{ direction: 'right', targetMap: 'olivine_city', offset: 0 }],
  [
    { x: 11, y: 7, targetMap: 'cianwood_gym', targetX: 6, targetY: 11 },
    { x: 7, y: 7, targetMap: 'cianwood_pokecenter', targetX: 3, targetY: 7 },
  ],
  [{ id: 'cianwood_sign', x: 9, y: 9, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['CIANWOOD CITY', 'A City Between Cliffs'], isTrainer: false }],
);

export const mahoganyTown = makeCity('mahogany_town', 'MAHOGANY TOWN', 16, 14,
  [{ direction: 'left', targetMap: 'route_42', offset: 0 }, { direction: 'right', targetMap: 'route_44', offset: 0 },
   { direction: 'up', targetMap: 'route_43', offset: 0 }],
  [
    { x: 10, y: 6, targetMap: 'mahogany_gym', targetX: 6, targetY: 11 },
    { x: 6, y: 6, targetMap: 'mahogany_pokecenter', targetX: 3, targetY: 7 },
  ],
  [{ id: 'mahogany_sign', x: 8, y: 8, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['MAHOGANY TOWN', 'Home of the Ninja'], isTrainer: false }],
);

export const blackthornCity = makeCity('blackthorn_city', 'BLACKTHORN CITY', 20, 18,
  [{ direction: 'down', targetMap: 'route_45', offset: 0 }],
  [
    { x: 12, y: 8, targetMap: 'blackthorn_gym', targetX: 6, targetY: 11 },
    { x: 8, y: 8, targetMap: 'blackthorn_pokecenter', targetX: 3, targetY: 7 },
  ],
  [{ id: 'blackthorn_sign', x: 10, y: 10, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['BLACKTHORN CITY', 'A Quiet Mountain Retreat'], isTrainer: false }],
);

export const lakeDomain = makeRoute('lake_of_rage', 'LAKE OF RAGE', 18, 16,
  [{ direction: 'down', targetMap: 'route_43', offset: 0 }],
  [{ type: 'surf', entries: [
    { speciesId: 129, minLevel: 10, maxLevel: 20, weight: 70 },
    { speciesId: 130, minLevel: 30, maxLevel: 30, weight: 30 },
  ]}],
  [{ id: 'lake_sign', x: 9, y: 8, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['LAKE OF RAGE', 'Something strange is happening...'], isTrainer: false }],
);

// --- Dungeons ---

export const sproutTower = makeInterior('sprout_tower', 'SPROUT TOWER', 12, 14, 'violet_city', 10, 4, [
  { id: 'sage_1', x: 6, y: 3, spriteId: 'sage', direction: 'down', movement: 'static',
    dialog: ['The BELLSPROUT here train hard!'], isTrainer: true,
    trainerData: { id: 'sage_sprout_1', party: [{ speciesId: 69, level: 3 }, { speciesId: 69, level: 3 }, { speciesId: 69, level: 3 }] } },
]);

export const unionCave = makeRoute('union_cave', 'UNION CAVE', 16, 18, [],
  [{ type: 'cave', entries: [
    { speciesId: 41, minLevel: 6, maxLevel: 8, weight: 25 },
    { speciesId: 74, minLevel: 6, maxLevel: 8, weight: 25 },
    { speciesId: 95, minLevel: 6, maxLevel: 8, weight: 15 },
    { speciesId: 27, minLevel: 6, maxLevel: 8, weight: 20 },
    { speciesId: 19, minLevel: 6, maxLevel: 8, weight: 15 },
  ]}],
);
unionCave.tilesetId = 'cave';
unionCave.warps = [
  { x: 8, y: 1, targetMap: 'route_32', targetX: 7, targetY: 22 },
  { x: 8, y: 16, targetMap: 'route_33', targetX: 1, targetY: 5 },
];

export const ilexForest = makeRoute('ilex_forest', 'ILEX FOREST', 18, 20, [],
  [{ type: 'grass', entries: [
    { speciesId: 10, minLevel: 5, maxLevel: 7, weight: 20 },
    { speciesId: 13, minLevel: 5, maxLevel: 7, weight: 20 },
    { speciesId: 43, minLevel: 5, maxLevel: 7, weight: 15 },
    { speciesId: 46, minLevel: 5, maxLevel: 7, weight: 15 },
    { speciesId: 41, minLevel: 5, maxLevel: 7, weight: 15 },
    { speciesId: 11, minLevel: 5, maxLevel: 7, weight: 15 },
  ]}],
);
ilexForest.tilesetId = 'forest';
ilexForest.warps = [
  { x: 9, y: 1, targetMap: 'azalea_town', targetX: 9, targetY: 14 },
  { x: 9, y: 18, targetMap: 'route_34', targetX: 7, targetY: 16 },
];

export const icePath = makeRoute('ice_path', 'ICE PATH', 16, 18, [],
  [{ type: 'cave', entries: [
    { speciesId: 41, minLevel: 22, maxLevel: 24, weight: 20 },
    { speciesId: 42, minLevel: 22, maxLevel: 24, weight: 10 },
    { speciesId: 220, minLevel: 22, maxLevel: 24, weight: 25 },
    { speciesId: 215, minLevel: 22, maxLevel: 24, weight: 15 },
    { speciesId: 124, minLevel: 22, maxLevel: 24, weight: 15 },
    { speciesId: 238, minLevel: 22, maxLevel: 24, weight: 15 },
  ]}],
);
icePath.tilesetId = 'cave';
icePath.warps = [
  { x: 8, y: 1, targetMap: 'route_44', targetX: 18, targetY: 5 },
  { x: 8, y: 16, targetMap: 'blackthorn_city', targetX: 10, targetY: 16 },
];

export const mtSilver = makeRoute('mt_silver', 'MT. SILVER', 20, 24, [],
  [{ type: 'cave', entries: [
    { speciesId: 42, minLevel: 42, maxLevel: 48, weight: 15 },
    { speciesId: 75, minLevel: 42, maxLevel: 48, weight: 10 },
    { speciesId: 67, minLevel: 42, maxLevel: 48, weight: 10 },
    { speciesId: 95, minLevel: 42, maxLevel: 48, weight: 10 },
    { speciesId: 208, minLevel: 44, maxLevel: 48, weight: 10 },
    { speciesId: 217, minLevel: 44, maxLevel: 48, weight: 10 },
    { speciesId: 105, minLevel: 42, maxLevel: 48, weight: 10 },
    { speciesId: 215, minLevel: 42, maxLevel: 48, weight: 15 },
    { speciesId: 225, minLevel: 42, maxLevel: 48, weight: 10 },
  ]}],
);
mtSilver.tilesetId = 'cave';

// --- Interiors ---

function makePokecenter(id: string, exitMap: string, exitX: number, exitY: number): GameMap {
  return makeInterior(id, 'POKeMON CENTER', 10, 8, exitMap, exitX, exitY, [
    { id: `${id}_nurse`, x: 5, y: 1, spriteId: 'nurse', direction: 'down', movement: 'static',
      dialog: ['Welcome to our POKeMON CENTER!', 'We heal your POKeMON to full health!', '...Your POKeMON are fully healed!'],
      isTrainer: false },
  ]);
}

function makeGym(id: string, name: string, exitMap: string, exitX: number, exitY: number,
  leaderId: string, leaderDialog: string[]): GameMap {
  return makeInterior(id, name, 12, 12, exitMap, exitX, exitY, [
    { id: leaderId, x: 6, y: 2, spriteId: leaderId, direction: 'down', movement: 'static',
      dialog: leaderDialog, isTrainer: true, trainerData: { id: leaderId, party: [] } },
  ]);
}

export const johtoInteriors: Record<string, GameMap> = {
  player_house_gs: makeInterior('player_house_gs', "PLAYER'S HOUSE", 8, 8, 'new_bark_town', 3, 5, [
    { id: 'mom_gs', x: 3, y: 3, spriteId: 'mom', direction: 'down', movement: 'static',
      dialog: ['MOM: PROF. ELM was looking for you!', 'He said he wanted you to run an', 'errand for him.'], isTrainer: false },
  ]),
  neighbor_house_gs: makeInterior('neighbor_house_gs', "NEIGHBOR'S HOUSE", 8, 8, 'new_bark_town', 14, 5),
  elms_lab: makeInterior('elms_lab', "ELM'S LAB", 10, 12, 'new_bark_town', 4, 11, [
    { id: 'prof_elm', x: 5, y: 2, spriteId: 'elm', direction: 'down', movement: 'static',
      dialog: ['ELM: Ah, there you are!', 'I need you to visit MR. POKeMON.', 'But first, choose a POKeMON!'],
      isTrainer: false },
  ]),
  // Pokemon Centers
  violet_pokecenter: makePokecenter('violet_pokecenter', 'violet_city', 8, 9),
  azalea_pokecenter: makePokecenter('azalea_pokecenter', 'azalea_town', 7, 8),
  goldenrod_pokecenter: makePokecenter('goldenrod_pokecenter', 'goldenrod_city', 10, 10),
  ecruteak_pokecenter: makePokecenter('ecruteak_pokecenter', 'ecruteak_city', 8, 9),
  olivine_pokecenter: makePokecenter('olivine_pokecenter', 'olivine_city', 8, 9),
  cianwood_pokecenter: makePokecenter('cianwood_pokecenter', 'cianwood_city', 7, 8),
  mahogany_pokecenter: makePokecenter('mahogany_pokecenter', 'mahogany_town', 6, 7),
  blackthorn_pokecenter: makePokecenter('blackthorn_pokecenter', 'blackthorn_city', 8, 9),
  // Gyms
  violet_gym: makeGym('violet_gym', 'VIOLET GYM', 'violet_city', 12, 9, 'falkner',
    ['I\u0027m FALKNER, the VIOLET CITY', 'GYM LEADER!', 'People say you can\u0027t win against', 'FLYING type Pokemon with just', 'normal POKeMON. I\u0027ll show them!']),
  azalea_gym: makeGym('azalea_gym', 'AZALEA GYM', 'azalea_town', 11, 8, 'bugsy',
    ['I\u0027m BUGSY!', 'I never lose when it comes to', 'BUG POKeMON!']),
  goldenrod_gym: makeGym('goldenrod_gym', 'GOLDENROD GYM', 'goldenrod_city', 14, 10, 'whitney',
    ['Hi! I\u0027m WHITNEY!', 'Everyone was nice to me!', 'But you look ready to battle!']),
  ecruteak_gym: makeGym('ecruteak_gym', 'ECRUTEAK GYM', 'ecruteak_city', 12, 9, 'morty',
    ['I see everything with my', 'mind\u0027s eye.', 'I can see the future too.', 'And in it, I see me winning!']),
  olivine_gym: makeGym('olivine_gym', 'OLIVINE GYM', 'olivine_city', 12, 9, 'jasmine',
    ['Um... I\u0027m JASMINE...', 'I use the STEEL type...', '...Let\u0027s battle.']),
  cianwood_gym: makeGym('cianwood_gym', 'CIANWOOD GYM', 'cianwood_city', 11, 8, 'chuck',
    ['WAHAHAHA!', 'I\u0027m CHUCK, the GYM LEADER!', 'My POKeMON will crush rocks!', 'Come at me!']),
  mahogany_gym: makeGym('mahogany_gym', 'MAHOGANY GYM', 'mahogany_town', 10, 7, 'pryce',
    ['I\u0027ve been training POKeMON', 'since before you were born.', 'Show me what young trainers', 'are made of!']),
  blackthorn_gym: makeGym('blackthorn_gym', 'BLACKTHORN GYM', 'blackthorn_city', 12, 9, 'clair',
    ['I am CLAIR.', 'The world\u0027s best DRAGON master.', 'I can\u0027t be defeated!']),
};
