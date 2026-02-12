// ============================================================================
// Johto Maps - Routes, Cities, Dungeons, and Interiors
// ============================================================================

import type { GameMap, Direction, NPCDef } from '../../../engine/types';

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
    { speciesId: 163, minLevel: 2, maxLevel: 5, weight: 30, timeOfDay: 'night' },
    { speciesId: 167, minLevel: 2, maxLevel: 5, weight: 20, timeOfDay: 'night' },
  ]}],
);

export const route30 = makeRoute('route_30', 'ROUTE 30', 14, 20,
  [{ direction: 'down', targetMap: 'cherrygrove_city', offset: 0 }, { direction: 'up', targetMap: 'route_31', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 16, minLevel: 3, maxLevel: 5, weight: 30 },
    { speciesId: 10, minLevel: 3, maxLevel: 5, weight: 20 },
    { speciesId: 60, minLevel: 4, maxLevel: 5, weight: 15 },
    { speciesId: 187, minLevel: 3, maxLevel: 5, weight: 35 },
    { speciesId: 163, minLevel: 3, maxLevel: 5, weight: 25, timeOfDay: 'night' },
    { speciesId: 165, minLevel: 3, maxLevel: 5, weight: 25, timeOfDay: 'morning' },
  ]}],
);

export const route31 = makeRoute('route_31', 'ROUTE 31', 20, 10,
  [{ direction: 'left', targetMap: 'route_30', offset: 0 }, { direction: 'right', targetMap: 'violet_city', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 16, minLevel: 4, maxLevel: 6, weight: 30 },
    { speciesId: 69, minLevel: 4, maxLevel: 6, weight: 25 },
    { speciesId: 187, minLevel: 5, maxLevel: 6, weight: 25 },
    { speciesId: 60, minLevel: 4, maxLevel: 6, weight: 20 },
    { speciesId: 163, minLevel: 4, maxLevel: 6, weight: 25, timeOfDay: 'night' },
    { speciesId: 165, minLevel: 4, maxLevel: 6, weight: 25, timeOfDay: 'morning' },
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
    { speciesId: 163, minLevel: 10, maxLevel: 12, weight: 20, timeOfDay: 'night' },
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
  [{ direction: 'left', targetMap: 'route_35', offset: 0 }, { direction: 'right', targetMap: 'route_37', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 29, minLevel: 13, maxLevel: 15, weight: 25 },
    { speciesId: 32, minLevel: 13, maxLevel: 15, weight: 25 },
    { speciesId: 37, minLevel: 13, maxLevel: 15, weight: 15 },
    { speciesId: 58, minLevel: 13, maxLevel: 15, weight: 15 },
    { speciesId: 161, minLevel: 13, maxLevel: 15, weight: 20 },
  ]}],
);

export const route37 = makeRoute('route_37', 'ROUTE 37', 14, 14,
  [{ direction: 'down', targetMap: 'route_36', offset: 0 }, { direction: 'up', targetMap: 'ecruteak_city', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 37, minLevel: 14, maxLevel: 16, weight: 20 },
    { speciesId: 58, minLevel: 14, maxLevel: 16, weight: 20 },
    { speciesId: 167, minLevel: 14, maxLevel: 16, weight: 20, timeOfDay: 'night' },
    { speciesId: 165, minLevel: 14, maxLevel: 16, weight: 20, timeOfDay: 'morning' },
    { speciesId: 21, minLevel: 14, maxLevel: 16, weight: 20 },
    { speciesId: 163, minLevel: 14, maxLevel: 16, weight: 20, timeOfDay: 'night' },
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

export const route40 = makeRoute('route_40', 'ROUTE 40', 14, 16,
  [{ direction: 'up', targetMap: 'olivine_city', offset: 0 }, { direction: 'down', targetMap: 'route_41', offset: 0 }],
  [{ type: 'surf', entries: [
    { speciesId: 72, minLevel: 20, maxLevel: 24, weight: 40 },
    { speciesId: 73, minLevel: 22, maxLevel: 24, weight: 15 },
    { speciesId: 170, minLevel: 20, maxLevel: 24, weight: 25 },
    { speciesId: 129, minLevel: 20, maxLevel: 24, weight: 20 },
  ]}],
);

export const route41 = makeRoute('route_41', 'ROUTE 41', 18, 18,
  [{ direction: 'up', targetMap: 'route_40', offset: 0 }, { direction: 'down', targetMap: 'cianwood_city', offset: 0 }],
  [{ type: 'surf', entries: [
    { speciesId: 72, minLevel: 20, maxLevel: 24, weight: 35 },
    { speciesId: 73, minLevel: 22, maxLevel: 24, weight: 15 },
    { speciesId: 170, minLevel: 20, maxLevel: 24, weight: 20 },
    { speciesId: 226, minLevel: 20, maxLevel: 24, weight: 15 },
    { speciesId: 129, minLevel: 20, maxLevel: 24, weight: 15 },
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
   { direction: 'down', targetMap: 'route_37', offset: 0 }],
  [
    { x: 12, y: 8, targetMap: 'ecruteak_gym', targetX: 6, targetY: 11 },
    { x: 8, y: 8, targetMap: 'ecruteak_pokecenter', targetX: 3, targetY: 7 },
  ],
  [{ id: 'ecruteak_sign', x: 10, y: 10, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['ECRUTEAK CITY', 'A Historical City'], isTrainer: false }],
);

export const olivineCity = makeCity('olivine_city', 'OLIVINE CITY', 20, 18,
  [{ direction: 'up', targetMap: 'route_39', offset: 0 }, { direction: 'down', targetMap: 'route_40', offset: 0 }],
  [
    { x: 12, y: 8, targetMap: 'olivine_gym', targetX: 6, targetY: 11 },
    { x: 8, y: 8, targetMap: 'olivine_pokecenter', targetX: 3, targetY: 7 },
  ],
  [{ id: 'olivine_sign', x: 10, y: 10, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['OLIVINE CITY', 'The Port with the Sea Breeze'], isTrainer: false }],
);

export const cianwoodCity = makeCity('cianwood_city', 'CIANWOOD CITY', 18, 16,
  [{ direction: 'up', targetMap: 'route_41', offset: 0 }],
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

export const cherrygroveCity = makeCity('cherrygrove_city', 'CHERRYGROVE CITY', 18, 14,
  [{ direction: 'left', targetMap: 'route_29', offset: 0 }, { direction: 'up', targetMap: 'route_30', offset: 0 }],
  [
    { x: 11, y: 6, targetMap: 'cherrygrove_pokecenter', targetX: 3, targetY: 7 },
  ],
  [{ id: 'cherrygrove_sign', x: 9, y: 8, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['CHERRYGROVE CITY', 'The City of Fragrant Flowers'], isTrainer: false },
   { id: 'cherrygrove_guide', x: 6, y: 6, spriteId: 'old_man', direction: 'down', movement: 'static',
     dialog: ['This is CHERRYGROVE CITY.', 'The sea is right here.', 'Want me to show you around?'], isTrainer: false }],
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
mtSilver.warps = [
  { x: 10, y: 1, targetMap: 'mt_silver_summit', targetX: 5, targetY: 9 },
  { x: 10, y: 22, targetMap: 'route_28', targetX: 7, targetY: 1 },
];

// Route 28: Connects Indigo Plateau area to Mt. Silver
export const route28 = makeRoute('route_28', 'ROUTE 28', 16, 14,
  [{ direction: 'down', targetMap: 'route_27', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 101, minLevel: 39, maxLevel: 42, weight: 15 }, // Electrode
    { speciesId: 42, minLevel: 39, maxLevel: 42, weight: 15 },  // Golbat
    { speciesId: 178, minLevel: 39, maxLevel: 42, weight: 15 }, // Xatu
    { speciesId: 47, minLevel: 39, maxLevel: 42, weight: 15 },  // Parasect
    { speciesId: 64, minLevel: 39, maxLevel: 42, weight: 15 },  // Kadabra
    { speciesId: 195, minLevel: 39, maxLevel: 42, weight: 15 }, // Quagsire
    { speciesId: 225, minLevel: 39, maxLevel: 42, weight: 10 }, // Delibird
  ]}],
);
route28.warps = [
  { x: 7, y: 0, targetMap: 'mt_silver', targetX: 10, targetY: 23 },
];

// --- Transitional maps ---

export const unionCaveEntrance = makeInterior('union_cave_entrance', 'UNION CAVE ENTRANCE', 10, 8, 'route_32', 7, 22);
unionCaveEntrance.warps = [
  { x: Math.floor(10 / 2), y: 7, targetMap: 'route_32', targetX: 7, targetY: 22 },
  { x: Math.floor(10 / 2), y: 0, targetMap: 'union_cave', targetX: 8, targetY: 1 },
];

export const unionCaveExit = makeInterior('union_cave_exit', 'UNION CAVE EXIT', 10, 8, 'route_33', 1, 5);
unionCaveExit.warps = [
  { x: Math.floor(10 / 2), y: 7, targetMap: 'route_33', targetX: 1, targetY: 5 },
  { x: Math.floor(10 / 2), y: 0, targetMap: 'union_cave', targetX: 8, targetY: 16 },
];

export const icePathEntrance = makeInterior('ice_path_entrance', 'ICE PATH ENTRANCE', 10, 8, 'route_44', 18, 5);
icePathEntrance.warps = [
  { x: Math.floor(10 / 2), y: 7, targetMap: 'route_44', targetX: 18, targetY: 5 },
  { x: Math.floor(10 / 2), y: 0, targetMap: 'ice_path', targetX: 8, targetY: 1 },
];

export const mtSilverSummit = makeInterior('mt_silver_summit', 'MT. SILVER SUMMIT', 12, 10, 'mt_silver', 10, 1, [
  { id: 'red', x: 6, y: 2, spriteId: 'red', direction: 'down', movement: 'static',
    dialog: ['...'], isTrainer: true,
    trainerData: { id: 'red', party: [] } },
]);

// --- Interiors ---

function makePokecenter(id: string, exitMap: string, exitX: number, exitY: number): GameMap {
  return makeInterior(id, 'POKeMON CENTER', 10, 8, exitMap, exitX, exitY, [
    { id: `${id}_nurse`, x: 5, y: 1, spriteId: 'nurse', direction: 'down', movement: 'static',
      dialog: ['Welcome to our POKeMON CENTER!', 'We heal your POKeMON to full health!', '...Your POKeMON are fully healed!'],
      isTrainer: false, heals: true },
    { id: `${id}_pc`, x: 1, y: 1, spriteId: 'pc', direction: 'down', movement: 'static',
      dialog: ['Accessed the PC!'], isTrainer: false, isPC: true },
  ]);
}

function makeMart(id: string, exitMap: string, exitX: number, exitY: number, shopItems: string[]): GameMap {
  return makeInterior(id, 'POKeMON MART', 8, 8, exitMap, exitX, exitY, [
    { id: `${id}_clerk`, x: 1, y: 2, spriteId: 'clerk', direction: 'right', movement: 'static',
      dialog: ['Welcome! How may I help you?'], isTrainer: false, shopItems },
  ]);
}

function makeGym(id: string, name: string, exitMap: string, exitX: number, exitY: number,
  leaderId: string, leaderDialog: string[]): GameMap {
  return makeInterior(id, name, 12, 12, exitMap, exitX, exitY, [
    { id: leaderId, x: 6, y: 2, spriteId: leaderId, direction: 'down', movement: 'static',
      dialog: leaderDialog, isTrainer: true, trainerData: { id: leaderId, party: [] } },
  ]);
}

function makeE4Chamber(id: string, name: string, trainerId: string, dialog: string[],
  exitMap: string, exitX: number, exitY: number): GameMap {
  return makeInterior(id, name, 10, 10, exitMap, exitX, exitY, [
    { id: trainerId, x: 5, y: 3, spriteId: trainerId, direction: 'down',
      movement: 'static', dialog, isTrainer: true,
      trainerData: { id: trainerId, party: [] }, lineOfSight: 4 },
  ]);
}

function makeE4Chambers(region: string,
  e4: { id: string; dialog: string[] }[],
  champ: { id: string; dialog: string[] },
): Record<string, GameMap> {
  const maps: Record<string, GameMap> = {};
  const prefix = region;
  for (let i = 0; i < e4.length; i++) {
    const prevMap = i === 0 ? `indigo_plateau_${prefix}` : `e4_room_${i}_${prefix}`;
    const mapId = `e4_room_${i + 1}_${prefix}`;
    const nextMap = i < e4.length - 1 ? `e4_room_${i + 2}_${prefix}` : `champion_room_${prefix}`;
    const m = makeE4Chamber(mapId, e4[i].id.toUpperCase(), e4[i].id, e4[i].dialog, prevMap, 5, 1);
    m.warps.push({ x: 5, y: 0, targetMap: nextMap, targetX: 5, targetY: 9 });
    maps[mapId] = m;
  }
  const champMap = makeE4Chamber(`champion_room_${prefix}`, 'CHAMPION', champ.id, champ.dialog,
    `e4_room_${e4.length}_${prefix}`, 5, 1);
  maps[`champion_room_${prefix}`] = champMap;
  return maps;
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
  cherrygrove_pokecenter: makePokecenter('cherrygrove_pokecenter', 'cherrygrove_city', 11, 7),
  violet_pokecenter: makePokecenter('violet_pokecenter', 'violet_city', 8, 9),
  azalea_pokecenter: makePokecenter('azalea_pokecenter', 'azalea_town', 7, 8),
  goldenrod_pokecenter: makePokecenter('goldenrod_pokecenter', 'goldenrod_city', 10, 10),
  ecruteak_pokecenter: makePokecenter('ecruteak_pokecenter', 'ecruteak_city', 8, 9),
  olivine_pokecenter: makePokecenter('olivine_pokecenter', 'olivine_city', 8, 9),
  cianwood_pokecenter: makePokecenter('cianwood_pokecenter', 'cianwood_city', 7, 8),
  mahogany_pokecenter: makePokecenter('mahogany_pokecenter', 'mahogany_town', 6, 7),
  blackthorn_pokecenter: makePokecenter('blackthorn_pokecenter', 'blackthorn_city', 8, 9),
  // PokeMarts
  cherrygrove_mart: makeMart('cherrygrove_mart', 'cherrygrove_city', 15, 7,
    ['poke-ball', 'potion', 'antidote', 'parlyz-heal']),
  violet_mart: makeMart('violet_mart', 'violet_city', 14, 9,
    ['poke-ball', 'potion', 'antidote', 'parlyz-heal', 'awakening', 'escape-rope']),
  azalea_mart: makeMart('azalea_mart', 'azalea_town', 13, 8,
    ['poke-ball', 'potion', 'antidote', 'parlyz-heal', 'repel', 'escape-rope']),
  goldenrod_mart: makeMart('goldenrod_mart', 'goldenrod_city', 16, 10,
    ['poke-ball', 'great-ball', 'potion', 'super-potion', 'antidote', 'parlyz-heal', 'awakening', 'repel', 'escape-rope', 'revive']),
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
  // Pokemon League entrance
  indigo_plateau_johto: (() => {
    const m = makeInterior('indigo_plateau_johto', 'INDIGO PLATEAU', 12, 10, 'route_26', 6, 8, [
      { id: 'indigo_guard_gs', x: 6, y: 3, spriteId: 'guard', direction: 'down', movement: 'static',
        dialog: ['Welcome to the POKeMON LEAGUE!', 'The ELITE FOUR await!'], isTrainer: false },
    ]);
    m.warps.push({ x: 6, y: 0, targetMap: 'e4_room_1_johto', targetX: 5, targetY: 9 });
    return m;
  })(),
  // Elite Four Chambers
  ...makeE4Chambers('johto',
    [
      { id: 'will', dialog: ['I am WILL of the ELITE FOUR!', 'I have trained all over the world!', 'Let me demonstrate my power!'] },
      { id: 'koga_e4', dialog: ['I am KOGA of the ELITE FOUR!', 'My toxic techniques will', 'leave you speechless!'] },
      { id: 'bruno_e4', dialog: ['I am BRUNO of the ELITE FOUR!', 'We will grind you down', 'with our superior power!'] },
      { id: 'karen', dialog: ['I am KAREN of the ELITE FOUR!', 'Strong or weak POKeMON...', 'it is the trainer that matters!'] },
    ],
    { id: 'lance_champion', dialog: ['I am LANCE, the CHAMPION!', 'I have been waiting for a truly', 'powerful challenger!'] },
  ),
};

// --- Gym Trainers ---
function gymTrainer(id: string, x: number, y: number, dir: Direction, dialog: string[], los: number): NPCDef {
  return {
    id, x, y, spriteId: id, direction: dir,
    movement: 'static', dialog,
    isTrainer: true, trainerData: { id, party: [] },
    lineOfSight: los,
  };
}

// Violet Gym: 1 trainer
johtoInteriors.violet_gym.npcs.push(
  gymTrainer('violet_gym_1', 4, 6, 'right', ['My FLYING POKeMON will', 'blow you away!'], 3),
);

// Azalea Gym: 2 trainers
johtoInteriors.azalea_gym.npcs.push(
  gymTrainer('azalea_gym_1', 3, 7, 'right', ['BUG POKeMON are', 'underestimated!'], 3),
  gymTrainer('azalea_gym_2', 9, 5, 'left', ['You should study BUG POKeMON!'], 3),
);

// Goldenrod Gym: 2 trainers
johtoInteriors.goldenrod_gym.npcs.push(
  gymTrainer('goldenrod_gym_1', 4, 7, 'right', ['WHITNEY is super strong!', 'Her MILTANK is scary!'], 3),
  gymTrainer('goldenrod_gym_2', 8, 5, 'left', ['Normal types are tougher', 'than you think!'], 3),
);

// Ecruteak Gym: 2 trainers
johtoInteriors.ecruteak_gym.npcs.push(
  gymTrainer('ecruteak_gym_1', 3, 7, 'right', ['GHOST POKeMON cannot be', 'hit by NORMAL moves!'], 3),
  gymTrainer('ecruteak_gym_2', 9, 5, 'left', ['MORTY can see the unseen!'], 3),
);

// Olivine Gym: 1 trainer
johtoInteriors.olivine_gym.npcs.push(
  gymTrainer('olivine_gym_1', 4, 6, 'right', ['JASMINE is very shy...', 'but strong!'], 3),
);

// Cianwood Gym: 2 trainers
johtoInteriors.cianwood_gym.npcs.push(
  gymTrainer('cianwood_gym_1', 3, 7, 'right', ['CHUCK trains under waterfalls!', 'His FIGHTING POKeMON are tough!'], 3),
  gymTrainer('cianwood_gym_2', 9, 5, 'left', ['Can you handle the power?'], 3),
);

// Mahogany Gym: 2 trainers
johtoInteriors.mahogany_gym.npcs.push(
  gymTrainer('mahogany_gym_1', 4, 7, 'right', ['The ice is slippery here!', 'Be careful!'], 3),
  gymTrainer('mahogany_gym_2', 8, 4, 'down', ['PRYCE has decades of', 'experience!'], 2),
);

// Blackthorn Gym: 3 trainers
johtoInteriors.blackthorn_gym.npcs.push(
  gymTrainer('blackthorn_gym_1', 3, 8, 'right', ['DRAGON POKeMON are the', 'strongest type!'], 3),
  gymTrainer('blackthorn_gym_2', 9, 6, 'left', ['CLAIR is the strongest', 'GYM LEADER in JOHTO!'], 3),
  gymTrainer('blackthorn_gym_3', 6, 4, 'down', ['Can you tame DRAGONS?'], 2),
);
