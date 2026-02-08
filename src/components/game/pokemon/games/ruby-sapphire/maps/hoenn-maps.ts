// ============================================================================
// Hoenn Maps — Routes, Cities, Dungeons, and Interiors
// ============================================================================

import type { GameMap } from '../../../engine/types';

const T = 5, G = 1, P = 2, TG = 3, W = 4, B = 6, R = 7, D = 8;
const S = 16, FL = 14;

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
  const mx = Math.floor(width / 2), my = Math.floor(height / 2);
  for (let dy = -2; dy <= 0; dy++) for (let dx = -2; dx <= 0; dx++) {
    const y = my + dy, x = mx + dx + 4;
    if (y >= 0 && y < height && x >= 0 && x < width) g[y][x] = dy === -2 ? R : (dy === 0 && dx === -1 ? D : B);
  }
  for (let dy = -2; dy <= 0; dy++) for (let dx = -2; dx <= 0; dx++) {
    const y = my + dy, x = mx + dx - 2;
    if (y >= 0 && y < height && x >= 0 && x < width) g[y][x] = dy === -2 ? R : (dy === 0 && dx === -1 ? D : B);
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

export const route101 = makeRoute('route_101', 'ROUTE 101', 14, 16,
  [{ direction: 'down', targetMap: 'littleroot_town', offset: 0 }, { direction: 'up', targetMap: 'oldale_town', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 263, minLevel: 2, maxLevel: 3, weight: 45 },
    { speciesId: 261, minLevel: 2, maxLevel: 3, weight: 45 },
    { speciesId: 265, minLevel: 2, maxLevel: 3, weight: 10 },
  ]}],
);

export const route102 = makeRoute('route_102', 'ROUTE 102', 20, 10,
  [{ direction: 'right', targetMap: 'oldale_town', offset: 0 }, { direction: 'left', targetMap: 'petalburg_city', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 263, minLevel: 3, maxLevel: 4, weight: 25 },
    { speciesId: 280, minLevel: 4, maxLevel: 4, weight: 10 },
    { speciesId: 270, minLevel: 3, maxLevel: 4, weight: 20 },
    { speciesId: 273, minLevel: 3, maxLevel: 4, weight: 15 },
    { speciesId: 265, minLevel: 3, maxLevel: 4, weight: 15 },
    { speciesId: 261, minLevel: 3, maxLevel: 4, weight: 15 },
  ]}],
);

export const route103 = makeRoute('route_103', 'ROUTE 103', 16, 10,
  [{ direction: 'left', targetMap: 'oldale_town', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 263, minLevel: 2, maxLevel: 4, weight: 35 },
    { speciesId: 261, minLevel: 2, maxLevel: 4, weight: 35 },
    { speciesId: 278, minLevel: 2, maxLevel: 4, weight: 30 },
  ]}],
);

export const route104 = makeRoute('route_104', 'ROUTE 104', 14, 24,
  [{ direction: 'down', targetMap: 'petalburg_city', offset: 0 }, { direction: 'up', targetMap: 'rustboro_city', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 263, minLevel: 4, maxLevel: 7, weight: 25 },
    { speciesId: 276, minLevel: 4, maxLevel: 7, weight: 25 },
    { speciesId: 278, minLevel: 4, maxLevel: 7, weight: 20 },
    { speciesId: 183, minLevel: 4, maxLevel: 7, weight: 15 },
    { speciesId: 265, minLevel: 4, maxLevel: 5, weight: 15 },
  ]}],
);

export const route106 = makeRoute('route_106', 'ROUTE 106', 16, 10,
  [{ direction: 'left', targetMap: 'dewford_town', offset: 0 }],
  [{ type: 'surf', entries: [
    { speciesId: 72, minLevel: 5, maxLevel: 35, weight: 50 },
    { speciesId: 278, minLevel: 10, maxLevel: 30, weight: 50 },
  ]}],
);

export const route110 = makeRoute('route_110', 'ROUTE 110', 16, 24,
  [{ direction: 'down', targetMap: 'slateport_city', offset: 0 }, { direction: 'up', targetMap: 'mauville_city', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 261, minLevel: 12, maxLevel: 14, weight: 20 },
    { speciesId: 309, minLevel: 12, maxLevel: 14, weight: 25 },
    { speciesId: 311, minLevel: 12, maxLevel: 14, weight: 10 },
    { speciesId: 312, minLevel: 12, maxLevel: 14, weight: 10 },
    { speciesId: 43, minLevel: 12, maxLevel: 14, weight: 20 },
    { speciesId: 263, minLevel: 12, maxLevel: 14, weight: 15 },
  ]}],
);

export const route111 = makeRoute('route_111', 'ROUTE 111', 14, 24,
  [{ direction: 'down', targetMap: 'mauville_city', offset: 0 }, { direction: 'up', targetMap: 'route_113', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 27, minLevel: 20, maxLevel: 22, weight: 20 },
    { speciesId: 322, minLevel: 20, maxLevel: 22, weight: 20 },
    { speciesId: 328, minLevel: 20, maxLevel: 22, weight: 20 },
    { speciesId: 332, minLevel: 20, maxLevel: 22, weight: 15 },
    { speciesId: 343, minLevel: 20, maxLevel: 22, weight: 15 },
    { speciesId: 74, minLevel: 20, maxLevel: 22, weight: 10 },
  ]}],
);

export const route113 = makeRoute('route_113', 'ROUTE 113', 24, 10,
  [{ direction: 'left', targetMap: 'route_111', offset: 0 }, { direction: 'right', targetMap: 'fallarbor_town', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 327, minLevel: 14, maxLevel: 16, weight: 25 },
    { speciesId: 218, minLevel: 14, maxLevel: 16, weight: 25 },
    { speciesId: 227, minLevel: 14, maxLevel: 16, weight: 25 },
    { speciesId: 322, minLevel: 14, maxLevel: 16, weight: 25 },
  ]}],
);

export const route119 = makeRoute('route_119', 'ROUTE 119', 14, 30,
  [{ direction: 'down', targetMap: 'mauville_city', offset: 0 }, { direction: 'up', targetMap: 'fortree_city', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 352, minLevel: 25, maxLevel: 27, weight: 15 },
    { speciesId: 357, minLevel: 25, maxLevel: 27, weight: 15 },
    { speciesId: 264, minLevel: 25, maxLevel: 27, weight: 20 },
    { speciesId: 43, minLevel: 25, maxLevel: 27, weight: 15 },
    { speciesId: 262, minLevel: 25, maxLevel: 27, weight: 20 },
    { speciesId: 44, minLevel: 25, maxLevel: 27, weight: 15 },
  ]}],
);

export const route120 = makeRoute('route_120', 'ROUTE 120', 20, 16,
  [{ direction: 'left', targetMap: 'fortree_city', offset: 0 }, { direction: 'right', targetMap: 'route_121', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 352, minLevel: 25, maxLevel: 27, weight: 15 },
    { speciesId: 359, minLevel: 25, maxLevel: 27, weight: 10 },
    { speciesId: 264, minLevel: 25, maxLevel: 27, weight: 20 },
    { speciesId: 262, minLevel: 25, maxLevel: 27, weight: 20 },
    { speciesId: 183, minLevel: 25, maxLevel: 27, weight: 15 },
    { speciesId: 43, minLevel: 25, maxLevel: 27, weight: 20 },
  ]}],
);

export const route121 = makeRoute('route_121', 'ROUTE 121', 20, 10,
  [{ direction: 'left', targetMap: 'route_120', offset: 0 }, { direction: 'right', targetMap: 'lilycove_city', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 264, minLevel: 26, maxLevel: 28, weight: 25 },
    { speciesId: 262, minLevel: 26, maxLevel: 28, weight: 25 },
    { speciesId: 278, minLevel: 26, maxLevel: 28, weight: 25 },
    { speciesId: 279, minLevel: 26, maxLevel: 28, weight: 25 },
  ]}],
);

export const route123 = makeRoute('route_123', 'ROUTE 123', 24, 10,
  [{ direction: 'left', targetMap: 'route_122', offset: 0 }, { direction: 'right', targetMap: 'mauville_city', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 264, minLevel: 26, maxLevel: 28, weight: 20 },
    { speciesId: 262, minLevel: 26, maxLevel: 28, weight: 20 },
    { speciesId: 43, minLevel: 26, maxLevel: 28, weight: 15 },
    { speciesId: 44, minLevel: 26, maxLevel: 28, weight: 10 },
    { speciesId: 352, minLevel: 26, maxLevel: 28, weight: 15 },
    { speciesId: 357, minLevel: 26, maxLevel: 28, weight: 20 },
  ]}],
);

// --- Cities ---

export const oldaleTown = makeCity('oldale_town', 'OLDALE TOWN', 16, 14,
  [{ direction: 'down', targetMap: 'route_101', offset: 0 }, { direction: 'left', targetMap: 'route_102', offset: 0 },
   { direction: 'right', targetMap: 'route_103', offset: 0 }],
  [{ x: 10, y: 6, targetMap: 'oldale_pokecenter', targetX: 3, targetY: 7 }],
  [{ id: 'oldale_sign', x: 8, y: 8, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['OLDALE TOWN', 'Where Things Start Off Pokemon'], isTrainer: false }],
);

export const petalburgCity = makeCity('petalburg_city', 'PETALBURG CITY', 20, 16,
  [{ direction: 'right', targetMap: 'route_102', offset: 0 }, { direction: 'up', targetMap: 'route_104', offset: 0 }],
  [
    { x: 12, y: 7, targetMap: 'petalburg_gym', targetX: 6, targetY: 11 },
    { x: 8, y: 7, targetMap: 'petalburg_pokecenter', targetX: 3, targetY: 7 },
  ],
  [{ id: 'petalburg_sign', x: 10, y: 9, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['PETALBURG CITY', 'Where People Mingle with Nature'], isTrainer: false }],
);

export const rustboroCity = makeCity('rustboro_city', 'RUSTBORO CITY', 22, 18,
  [{ direction: 'down', targetMap: 'route_104', offset: 0 }],
  [
    { x: 13, y: 8, targetMap: 'rustboro_gym', targetX: 6, targetY: 11 },
    { x: 9, y: 8, targetMap: 'rustboro_pokecenter', targetX: 3, targetY: 7 },
  ],
  [{ id: 'rustboro_sign', x: 11, y: 10, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['RUSTBORO CITY', 'The City Probing the Integration of Nature and Science'], isTrainer: false }],
);

export const dewfordTown = makeCity('dewford_town', 'DEWFORD TOWN', 16, 14,
  [{ direction: 'right', targetMap: 'route_106', offset: 0 }],
  [
    { x: 10, y: 6, targetMap: 'dewford_gym', targetX: 6, targetY: 11 },
    { x: 6, y: 6, targetMap: 'dewford_pokecenter', targetX: 3, targetY: 7 },
  ],
  [{ id: 'dewford_sign', x: 8, y: 8, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['DEWFORD TOWN', 'A Tiny Island in the Blue Sea'], isTrainer: false }],
);

export const slateportCity = makeCity('slateport_city', 'SLATEPORT CITY', 22, 18,
  [{ direction: 'up', targetMap: 'route_110', offset: 0 }],
  [{ x: 9, y: 8, targetMap: 'slateport_pokecenter', targetX: 3, targetY: 7 }],
  [{ id: 'slateport_sign', x: 11, y: 10, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['SLATEPORT CITY', 'The Port Where People and Pokemon Interchange'], isTrainer: false }],
);

export const mauvilleCity = makeCity('mauville_city', 'MAUVILLE CITY', 22, 16,
  [{ direction: 'down', targetMap: 'route_110', offset: 0 }, { direction: 'up', targetMap: 'route_111', offset: 0 },
   { direction: 'right', targetMap: 'route_119', offset: 0 }],
  [
    { x: 13, y: 7, targetMap: 'mauville_gym', targetX: 6, targetY: 11 },
    { x: 9, y: 7, targetMap: 'mauville_pokecenter', targetX: 3, targetY: 7 },
  ],
  [{ id: 'mauville_sign', x: 11, y: 9, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['MAUVILLE CITY', 'The Bright and Shiny City of Fun!'], isTrainer: false }],
);

export const fallarborTown = makeCity('fallarbor_town', 'FALLARBOR TOWN', 16, 14,
  [{ direction: 'left', targetMap: 'route_113', offset: 0 }],
  [{ x: 8, y: 6, targetMap: 'fallarbor_pokecenter', targetX: 3, targetY: 7 }],
  [{ id: 'fallarbor_sign', x: 8, y: 8, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['FALLARBOR TOWN', 'A Pokemon Pokemon and Nature'], isTrainer: false }],
);

export const lavaridgeTown = makeCity('lavaridge_town', 'LAVARIDGE TOWN', 16, 14,
  [],
  [
    { x: 10, y: 6, targetMap: 'lavaridge_gym', targetX: 6, targetY: 11 },
    { x: 6, y: 6, targetMap: 'lavaridge_pokecenter', targetX: 3, targetY: 7 },
  ],
  [{ id: 'lavaridge_sign', x: 8, y: 8, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['LAVARIDGE TOWN', 'An excellent Pokemon destination'], isTrainer: false }],
);

export const fortreeCity = makeCity('fortree_city', 'FORTREE CITY', 20, 16,
  [{ direction: 'down', targetMap: 'route_119', offset: 0 }, { direction: 'right', targetMap: 'route_120', offset: 0 }],
  [
    { x: 12, y: 7, targetMap: 'fortree_gym', targetX: 6, targetY: 11 },
    { x: 8, y: 7, targetMap: 'fortree_pokecenter', targetX: 3, targetY: 7 },
  ],
  [{ id: 'fortree_sign', x: 10, y: 9, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['FORTREE CITY', 'The Treetop City'], isTrainer: false }],
);

export const lilycoveCity = makeCity('lilycove_city', 'LILYCOVE CITY', 24, 18,
  [{ direction: 'left', targetMap: 'route_121', offset: 0 }],
  [{ x: 10, y: 8, targetMap: 'lilycove_pokecenter', targetX: 3, targetY: 7 }],
  [{ id: 'lilycove_sign', x: 12, y: 10, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['LILYCOVE CITY', 'Where the Land Ends and the Sea Begins'], isTrainer: false }],
);

export const mossdeepCity = makeCity('mossdeep_city', 'MOSSDEEP CITY', 20, 16,
  [],
  [
    { x: 12, y: 7, targetMap: 'mossdeep_gym', targetX: 6, targetY: 11 },
    { x: 8, y: 7, targetMap: 'mossdeep_pokecenter', targetX: 3, targetY: 7 },
  ],
  [{ id: 'mossdeep_sign', x: 10, y: 9, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['MOSSDEEP CITY', 'Our Pokemon Pokemon Space Center'], isTrainer: false }],
);

export const sootopolisCity = makeCity('sootopolis_city', 'SOOTOPOLIS CITY', 20, 18,
  [],
  [
    { x: 12, y: 8, targetMap: 'sootopolis_gym', targetX: 6, targetY: 11 },
    { x: 8, y: 8, targetMap: 'sootopolis_pokecenter', targetX: 3, targetY: 7 },
  ],
  [{ id: 'sootopolis_sign', x: 10, y: 10, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['SOOTOPOLIS CITY', 'The Pokemon Mystical City'], isTrainer: false }],
);

export const everGrandeCity = makeCity('ever_grande_city', 'EVER GRANDE CITY', 18, 14,
  [],
  [{ x: 9, y: 6, targetMap: 'ever_grande_pokecenter', targetX: 3, targetY: 7 }],
  [{ id: 'ever_grande_sign', x: 9, y: 8, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['EVER GRANDE CITY', 'The Pokemon Paradise of Flowers'], isTrainer: false }],
);

// --- Dungeons ---

export const petalburgWoods = makeRoute('petalburg_woods', 'PETALBURG WOODS', 18, 24,
  [], [{ type: 'grass', entries: [
    { speciesId: 263, minLevel: 5, maxLevel: 6, weight: 20 },
    { speciesId: 265, minLevel: 5, maxLevel: 6, weight: 20 },
    { speciesId: 285, minLevel: 5, maxLevel: 6, weight: 15 },
    { speciesId: 276, minLevel: 5, maxLevel: 6, weight: 15 },
    { speciesId: 283, minLevel: 5, maxLevel: 6, weight: 10 },
    { speciesId: 266, minLevel: 5, maxLevel: 6, weight: 10 },
    { speciesId: 268, minLevel: 5, maxLevel: 6, weight: 10 },
  ]}],
);
petalburgWoods.tilesetId = 'forest';
petalburgWoods.warps = [
  { x: 9, y: 1, targetMap: 'route_104', targetX: 7, targetY: 12 },
  { x: 9, y: 22, targetMap: 'route_104', targetX: 7, targetY: 12 },
];

export const meteorFalls = makeRoute('meteor_falls', 'METEOR FALLS', 18, 18,
  [], [{ type: 'cave', entries: [
    { speciesId: 41, minLevel: 14, maxLevel: 18, weight: 35 },
    { speciesId: 337, minLevel: 25, maxLevel: 30, weight: 15 },
    { speciesId: 338, minLevel: 25, maxLevel: 30, weight: 15 },
    { speciesId: 74, minLevel: 14, maxLevel: 18, weight: 20 },
    { speciesId: 371, minLevel: 25, maxLevel: 35, weight: 15 },
  ]}],
);
meteorFalls.tilesetId = 'cave';

export const victoryRoadHoenn = makeRoute('victory_road_hoenn', 'VICTORY ROAD', 20, 24,
  [], [{ type: 'cave', entries: [
    { speciesId: 42, minLevel: 38, maxLevel: 42, weight: 15 },
    { speciesId: 297, minLevel: 38, maxLevel: 42, weight: 15 },
    { speciesId: 304, minLevel: 38, maxLevel: 42, weight: 15 },
    { speciesId: 302, minLevel: 38, maxLevel: 42, weight: 10 },
    { speciesId: 303, minLevel: 38, maxLevel: 42, weight: 10 },
    { speciesId: 75, minLevel: 38, maxLevel: 42, weight: 10 },
    { speciesId: 264, minLevel: 38, maxLevel: 42, weight: 15 },
    { speciesId: 67, minLevel: 38, maxLevel: 42, weight: 10 },
  ]}],
);
victoryRoadHoenn.tilesetId = 'cave';

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

export const hoennInteriors: Record<string, GameMap> = {
  player_house_rs: makeInterior('player_house_rs', "PLAYER'S HOUSE", 8, 8, 'littleroot_town', 3, 5, [
    { id: 'mom_rs', x: 3, y: 3, spriteId: 'mom', direction: 'down', movement: 'static',
      dialog: ['MOM: We just arrived in LITTLEROOT!', 'PROF. BIRCH lives next door!'], isTrainer: false },
  ]),
  rival_house_rs: makeInterior('rival_house_rs', "RIVAL'S HOUSE", 8, 8, 'littleroot_town', 12, 5),
  birchs_lab: makeInterior('birchs_lab', "BIRCH'S LAB", 10, 12, 'littleroot_town', 4, 11, [
    { id: 'prof_birch', x: 5, y: 2, spriteId: 'birch', direction: 'down', movement: 'static',
      dialog: ['BIRCH: I study POKeMON in the wild!', 'Thanks for saving me earlier!'],
      isTrainer: false },
  ]),
  // Pokemon Centers
  oldale_pokecenter: makePokecenter('oldale_pokecenter', 'oldale_town', 10, 7),
  petalburg_pokecenter: makePokecenter('petalburg_pokecenter', 'petalburg_city', 8, 8),
  rustboro_pokecenter: makePokecenter('rustboro_pokecenter', 'rustboro_city', 9, 9),
  dewford_pokecenter: makePokecenter('dewford_pokecenter', 'dewford_town', 6, 7),
  slateport_pokecenter: makePokecenter('slateport_pokecenter', 'slateport_city', 9, 9),
  mauville_pokecenter: makePokecenter('mauville_pokecenter', 'mauville_city', 9, 8),
  fallarbor_pokecenter: makePokecenter('fallarbor_pokecenter', 'fallarbor_town', 8, 7),
  lavaridge_pokecenter: makePokecenter('lavaridge_pokecenter', 'lavaridge_town', 6, 7),
  fortree_pokecenter: makePokecenter('fortree_pokecenter', 'fortree_city', 8, 8),
  lilycove_pokecenter: makePokecenter('lilycove_pokecenter', 'lilycove_city', 10, 9),
  mossdeep_pokecenter: makePokecenter('mossdeep_pokecenter', 'mossdeep_city', 8, 8),
  sootopolis_pokecenter: makePokecenter('sootopolis_pokecenter', 'sootopolis_city', 8, 9),
  ever_grande_pokecenter: makePokecenter('ever_grande_pokecenter', 'ever_grande_city', 9, 7),
  // Gyms
  rustboro_gym: makeGym('rustboro_gym', 'RUSTBORO GYM', 'rustboro_city', 13, 9, 'roxanne',
    ['I\u0027m ROXANNE, the RUSTBORO GYM LEADER!', 'I became a GYM LEADER so that', 'I could apply what I learned.', 'Let me demonstrate!']),
  dewford_gym: makeGym('dewford_gym', 'DEWFORD GYM', 'dewford_town', 10, 7, 'brawly',
    ['I\u0027m BRAWLY!', 'DEWFORD\u0027s GYM LEADER!', 'I\u0027ve been training under crashing waves!', 'Let\u0027s see what you\u0027ve got!']),
  mauville_gym: makeGym('mauville_gym', 'MAUVILLE GYM', 'mauville_city', 13, 8, 'wattson',
    ['Wahahahah!', 'I\u0027ve given up trying to figure out', 'what is Pokemon with young people!', 'Let\u0027s just battle!']),
  lavaridge_gym: makeGym('lavaridge_gym', 'LAVARIDGE GYM', 'lavaridge_town', 10, 7, 'flannery',
    ['Welcome to the LAVARIDGE GYM!', 'No, wait... I\u0027m the GYM LEADER!', 'I\u0027m FLANNERY!', 'I just recently became GYM LEADER!']),
  petalburg_gym: makeGym('petalburg_gym', 'PETALBURG GYM', 'petalburg_city', 12, 8, 'norman',
    ['...So, you\u0027ve come.', 'I\u0027m NORMAN, the PETALBURG GYM LEADER.', 'I\u0027m glad to see you\u0027ve grown strong.', 'Let\u0027s battle, child!']),
  fortree_gym: makeGym('fortree_gym', 'FORTREE GYM', 'fortree_city', 12, 8, 'winona',
    ['I am WINONA.', 'I am the leader of the FORTREE', 'POKeMON GYM.', 'Prepare for battle!']),
  mossdeep_gym: makeGym('mossdeep_gym', 'MOSSDEEP GYM', 'mossdeep_city', 12, 8, 'tate_liza',
    ['We are TATE AND LIZA!', 'We are the GYM LEADERS of', 'MOSSDEEP GYM!', 'We do Pokemon double battles!']),
  sootopolis_gym: makeGym('sootopolis_gym', 'SOOTOPOLIS GYM', 'sootopolis_city', 12, 9, 'juan',
    ['Welcome, young trainer!', 'I am JUAN, the GYM LEADER.', 'Let me see your power!']),
};
