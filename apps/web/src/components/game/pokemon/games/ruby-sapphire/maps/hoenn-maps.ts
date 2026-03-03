// ============================================================================
// Hoenn Maps - Routes, Cities, Dungeons, and Interiors
// ============================================================================

import type { GameMap, Direction, NPCDef } from '../../../engine/types';

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
  [{ direction: 'down', targetMap: 'mauville_city', offset: 0 }, { direction: 'up', targetMap: 'route_113', offset: 0 },
   { direction: 'left', targetMap: 'route_112', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 27, minLevel: 20, maxLevel: 22, weight: 20 },
    { speciesId: 322, minLevel: 20, maxLevel: 22, weight: 20 },
    { speciesId: 328, minLevel: 20, maxLevel: 22, weight: 20 },
    { speciesId: 331, minLevel: 20, maxLevel: 22, weight: 15 },
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

// Route 112: Connects Route 111 (east) to Lavaridge Town (west) via Jagged Pass
export const route112 = makeRoute('route_112', 'ROUTE 112', 18, 14,
  [{ direction: 'right', targetMap: 'route_111', offset: 0 }, { direction: 'left', targetMap: 'lavaridge_town', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 322, minLevel: 20, maxLevel: 22, weight: 30 }, // Numel
    { speciesId: 218, minLevel: 20, maxLevel: 22, weight: 25 }, // Slugma
    { speciesId: 325, minLevel: 20, maxLevel: 22, weight: 25 }, // Spoink
    { speciesId: 66, minLevel: 20, maxLevel: 22, weight: 20 },  // Machop
  ]}],
);

// Route 124: Sea route from Lilycove to Mossdeep
export const route124 = makeRoute('route_124', 'ROUTE 124', 20, 14,
  [{ direction: 'left', targetMap: 'lilycove_city', offset: 0 }, { direction: 'right', targetMap: 'mossdeep_city', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 72, minLevel: 30, maxLevel: 32, weight: 30 },  // Tentacool
    { speciesId: 278, minLevel: 30, maxLevel: 32, weight: 25 }, // Wingull
    { speciesId: 320, minLevel: 30, maxLevel: 32, weight: 20 }, // Wailmer
    { speciesId: 370, minLevel: 30, maxLevel: 32, weight: 25 }, // Luvdisc
  ]}],
);

// Route 126: Sea route from Mossdeep to Sootopolis
export const route126 = makeRoute('route_126', 'ROUTE 126', 18, 14,
  [{ direction: 'left', targetMap: 'mossdeep_city', offset: 0 }, { direction: 'right', targetMap: 'sootopolis_city', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 72, minLevel: 30, maxLevel: 34, weight: 25 },  // Tentacool
    { speciesId: 320, minLevel: 30, maxLevel: 34, weight: 25 }, // Wailmer
    { speciesId: 366, minLevel: 30, maxLevel: 34, weight: 20 }, // Clamperl
    { speciesId: 369, minLevel: 30, maxLevel: 34, weight: 15 }, // Relicanth
    { speciesId: 170, minLevel: 30, maxLevel: 34, weight: 15 }, // Chinchou
  ]}],
);

// Route 128: Sea route to Ever Grande City
export const route128 = makeRoute('route_128', 'ROUTE 128', 20, 14,
  [{ direction: 'left', targetMap: 'sootopolis_city', offset: 0 }, { direction: 'right', targetMap: 'ever_grande_city', offset: 0 }],
  [{ type: 'grass', entries: [
    { speciesId: 72, minLevel: 32, maxLevel: 36, weight: 25 },  // Tentacool
    { speciesId: 320, minLevel: 32, maxLevel: 36, weight: 25 }, // Wailmer
    { speciesId: 319, minLevel: 32, maxLevel: 36, weight: 15 }, // Sharpedo
    { speciesId: 73, minLevel: 32, maxLevel: 36, weight: 15 },  // Tentacruel
    { speciesId: 279, minLevel: 32, maxLevel: 36, weight: 20 }, // Pelipper
  ]}],
);

// --- Cities ---

export const oldaleTown = makeCity('oldale_town', 'OLDALE TOWN', 16, 14,
  [{ direction: 'down', targetMap: 'route_101', offset: 0 }, { direction: 'left', targetMap: 'route_102', offset: 0 },
   { direction: 'right', targetMap: 'route_103', offset: 0 }],
  [{ x: 10, y: 6, targetMap: 'oldale_pokecenter', targetX: 3, targetY: 7 }],
  [{ id: 'oldale_sign', x: 8, y: 8, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['OLDALE TOWN', 'Where Things Start Off Pokily.'], isTrainer: false }],
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
     dialog: ['FALLARBOR TOWN', 'A Pokemon town of professors and nature.'], isTrainer: false }],
);

export const lavaridgeTown = makeCity('lavaridge_town', 'LAVARIDGE TOWN', 16, 14,
  [{ direction: 'right', targetMap: 'route_112', offset: 0 }],
  [
    { x: 10, y: 6, targetMap: 'lavaridge_gym', targetX: 6, targetY: 11 },
    { x: 6, y: 6, targetMap: 'lavaridge_pokecenter', targetX: 3, targetY: 7 },
  ],
  [{ id: 'lavaridge_sign', x: 8, y: 8, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['LAVARIDGE TOWN', 'An excellent Pokemon hot spring destination!'], isTrainer: false }],
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
  [{ direction: 'left', targetMap: 'route_121', offset: 0 }, { direction: 'right', targetMap: 'route_124', offset: 0 }],
  [{ x: 10, y: 8, targetMap: 'lilycove_pokecenter', targetX: 3, targetY: 7 }],
  [{ id: 'lilycove_sign', x: 12, y: 10, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['LILYCOVE CITY', 'Where the Land Ends and the Sea Begins'], isTrainer: false }],
);

export const mossdeepCity = makeCity('mossdeep_city', 'MOSSDEEP CITY', 20, 16,
  [{ direction: 'left', targetMap: 'route_124', offset: 0 }, { direction: 'right', targetMap: 'route_126', offset: 0 }],
  [
    { x: 12, y: 7, targetMap: 'mossdeep_gym', targetX: 6, targetY: 11 },
    { x: 8, y: 7, targetMap: 'mossdeep_pokecenter', targetX: 3, targetY: 7 },
  ],
  [{ id: 'mossdeep_sign', x: 10, y: 9, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['MOSSDEEP CITY', 'Our Pride Is the Space Center!'], isTrainer: false }],
);

export const sootopolisCity = makeCity('sootopolis_city', 'SOOTOPOLIS CITY', 20, 18,
  [{ direction: 'left', targetMap: 'route_126', offset: 0 }, { direction: 'right', targetMap: 'route_128', offset: 0 }],
  [
    { x: 12, y: 8, targetMap: 'sootopolis_gym', targetX: 6, targetY: 11 },
    { x: 8, y: 8, targetMap: 'sootopolis_pokecenter', targetX: 3, targetY: 7 },
    { x: 10, y: 12, targetMap: 'cave_of_origin', targetX: 6, targetY: 10 },
  ],
  [{ id: 'sootopolis_sign', x: 10, y: 10, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['SOOTOPOLIS CITY', 'The Mystical City Rising from the Sea!'], isTrainer: false }],
);

export const everGrandeCity = makeCity('ever_grande_city', 'EVER GRANDE CITY', 18, 14,
  [{ direction: 'left', targetMap: 'route_128', offset: 0 }],
  [
    { x: 9, y: 6, targetMap: 'ever_grande_pokecenter', targetX: 3, targetY: 7 },
    { x: 9, y: 2, targetMap: 'victory_road_hoenn', targetX: 8, targetY: 19 },
  ],
  [{ id: 'ever_grande_sign', x: 9, y: 8, spriteId: 'sign', direction: 'down', movement: 'static',
     dialog: ['EVER GRANDE CITY', 'The Paradise of Flowers, Water, and Pokemon!'], isTrainer: false }],
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
victoryRoadHoenn.warps.push(
  { x: 8, y: 23, targetMap: 'ever_grande_city', targetX: 9, targetY: 3 },
  { x: 10, y: 0, targetMap: 'ever_grande_interior_hoenn', targetX: 6, targetY: 8 },
);

// --- Cave of Origin ---

function makeCave(
  id: string, name: string, width: number, height: number,
  warps: GameMap['warps'],
  encounters: GameMap['encounters'],
  npcs: GameMap['npcs'] = [],
): GameMap {
  const CV = 10;
  const ground = Array.from({ length: height }, (_, y) => {
    const row = new Array(width).fill(CV);
    if (y > 1 && y < height - 2) {
      for (let x = 2; x < width - 2; x++) row[x] = G;
    }
    if (y === 1 || y === height - 2) {
      for (let x = 3; x < width - 3; x++) row[x] = G;
    }
    return row;
  });
  // Central chamber (clear a larger area in the middle)
  const cx = Math.floor(width / 2), cy = Math.floor(height / 2);
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      const ny = cy + dy, nx = cx + dx;
      if (ny >= 0 && ny < height && nx >= 0 && nx < width) ground[ny][nx] = G;
    }
  }
  return {
    id, name, width, height, tilesetId: 'cave',
    layers: { ground, objects: ground.map(() => new Array(width).fill(0)), above: ground.map(() => new Array(width).fill(0)) },
    collision: ground.map(row => row.map(tile =>
      tile === CV ? 'blocked' as const : 'walkable' as const
    )),
    warps, connections: [], encounters, npcs,
    music: 'cave',
  };
}

export const caveOfOrigin = makeCave('cave_of_origin', 'CAVE OF ORIGIN', 12, 12,
  [{ x: 6, y: 10, targetMap: 'sootopolis_city', targetX: 10, targetY: 12 }],
  [],
  [{
    id: 'wallace_cave', x: 6, y: 4, spriteId: 'wallace', direction: 'down',
    movement: 'static',
    dialog: [
      'WALLACE: This is the CAVE OF ORIGIN...',
      'The legendary POKeMON sleeps within.',
      'Please be careful. Its power is immense!',
    ],
    isTrainer: false,
  }],
);

// --- Route 122 ---

export const route122 = makeRoute('route_122', 'ROUTE 122', 20, 10,
  [{ direction: 'left', targetMap: 'lilycove_city', offset: 0 }, { direction: 'right', targetMap: 'route_123', offset: 0 }],
  [{ type: 'surf', entries: [
    { speciesId: 72, minLevel: 25, maxLevel: 30, weight: 40 },  // Tentacool
    { speciesId: 278, minLevel: 25, maxLevel: 30, weight: 30 }, // Wingull
    { speciesId: 279, minLevel: 25, maxLevel: 30, weight: 30 }, // Pelipper
  ]}],
);
// Route 122 is mostly water
route122.layers.ground = route122.layers.ground.map(row => row.map(tile => {
  if (tile === G || tile === TG) return W;
  return tile;
}));
// Keep a few land patches on the edges
route122.layers.ground[4][0] = G;
route122.layers.ground[4][1] = G;
route122.layers.ground[5][0] = G;
route122.layers.ground[5][1] = G;
route122.layers.ground[4][18] = G;
route122.layers.ground[4][19] = G;
route122.layers.ground[5][18] = G;
route122.layers.ground[5][19] = G;
// Update collision to reflect water tiles
route122.collision = route122.layers.ground.map(row => row.map(tile => {
  const m: Record<number, string> = { [T]: 'blocked', [G]: 'walkable', [P]: 'walkable', [W]: 'surfable' };
  return (m[tile] ?? 'blocked') as 'walkable' | 'blocked' | 'surfable';
}));

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
  for (let i = 0; i < e4.length; i++) {
    const prevMap = i === 0 ? `ever_grande_interior_${region}` : `e4_room_${i}_${region}`;
    const mapId = `e4_room_${i + 1}_${region}`;
    const nextMap = i < e4.length - 1 ? `e4_room_${i + 2}_${region}` : `champion_room_${region}`;
    const m = makeE4Chamber(mapId, e4[i].id.toUpperCase(), e4[i].id, e4[i].dialog, prevMap, 5, 1);
    m.warps.push({ x: 5, y: 0, targetMap: nextMap, targetX: 5, targetY: 9 });
    maps[mapId] = m;
  }
  const champMap = makeE4Chamber(`champion_room_${region}`, 'CHAMPION', champ.id, champ.dialog,
    `e4_room_${e4.length}_${region}`, 5, 1);
  maps[`champion_room_${region}`] = champMap;
  return maps;
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
  // PokeMarts
  oldale_mart: makeMart('oldale_mart', 'oldale_town', 14, 7,
    ['poke-ball', 'potion', 'antidote', 'parlyz-heal']),
  rustboro_mart: makeMart('rustboro_mart', 'rustboro_city', 15, 9,
    ['poke-ball', 'potion', 'antidote', 'parlyz-heal', 'awakening', 'escape-rope', 'repel']),
  slateport_mart: makeMart('slateport_mart', 'slateport_city', 15, 9,
    ['poke-ball', 'great-ball', 'potion', 'super-potion', 'antidote', 'parlyz-heal', 'repel', 'escape-rope']),
  mauville_mart: makeMart('mauville_mart', 'mauville_city', 15, 8,
    ['great-ball', 'super-potion', 'antidote', 'parlyz-heal', 'awakening', 'revive', 'repel', 'escape-rope']),
  lilycove_mart: makeMart('lilycove_mart', 'lilycove_city', 16, 9,
    ['ultra-ball', 'great-ball', 'hyper-potion', 'super-potion', 'full-heal', 'revive', 'max-repel', 'escape-rope']),
  // Gyms
  rustboro_gym: makeGym('rustboro_gym', 'RUSTBORO GYM', 'rustboro_city', 13, 9, 'roxanne',
    ['I\u0027m ROXANNE, the RUSTBORO GYM LEADER!', 'I became a GYM LEADER so that', 'I could apply what I learned.', 'Let me demonstrate!']),
  dewford_gym: makeGym('dewford_gym', 'DEWFORD GYM', 'dewford_town', 10, 7, 'brawly',
    ['I\u0027m BRAWLY!', 'DEWFORD\u0027s GYM LEADER!', 'I\u0027ve been training under crashing waves!', 'Let\u0027s see what you\u0027ve got!']),
  mauville_gym: makeGym('mauville_gym', 'MAUVILLE GYM', 'mauville_city', 13, 8, 'wattson',
    ['Wahahahah!', 'I\u0027ve given up trying to figure out', 'what\u0027s popular with young people!', 'Let\u0027s just battle!']),
  lavaridge_gym: makeGym('lavaridge_gym', 'LAVARIDGE GYM', 'lavaridge_town', 10, 7, 'flannery',
    ['Welcome to the LAVARIDGE GYM!', 'No, wait... I\u0027m the GYM LEADER!', 'I\u0027m FLANNERY!', 'I just recently became GYM LEADER!']),
  petalburg_gym: makeGym('petalburg_gym', 'PETALBURG GYM', 'petalburg_city', 12, 8, 'norman',
    ['...So, you\u0027ve come.', 'I\u0027m NORMAN, the PETALBURG GYM LEADER.', 'I\u0027m glad to see you\u0027ve grown strong.', 'Let\u0027s battle, child!']),
  fortree_gym: makeGym('fortree_gym', 'FORTREE GYM', 'fortree_city', 12, 8, 'winona',
    ['I am WINONA.', 'I am the leader of the FORTREE', 'POKeMON GYM.', 'Prepare for battle!']),
  mossdeep_gym: makeGym('mossdeep_gym', 'MOSSDEEP GYM', 'mossdeep_city', 12, 8, 'tate_liza',
    ['We are TATE AND LIZA!', 'We are the GYM LEADERS of', 'MOSSDEEP GYM!', 'We battle together in double battles!']),
  sootopolis_gym: makeGym('sootopolis_gym', 'SOOTOPOLIS GYM', 'sootopolis_city', 12, 9, 'wallace',
    ['Welcome, young trainer!', 'I am WALLACE, the GYM LEADER.', 'There is nothing more elegant than water!', 'Let me see your elegance in battle!']),
  // Pokemon League entrance
  ever_grande_interior_hoenn: (() => {
    const m = makeInterior('ever_grande_interior_hoenn', 'EVER GRANDE CITY', 12, 10, 'ever_grande_city', 6, 8, [
      { id: 'eg_guard', x: 6, y: 3, spriteId: 'guard', direction: 'down', movement: 'static',
        dialog: ['Welcome to the HOENN POKeMON LEAGUE!', 'The ELITE FOUR await!'], isTrainer: false },
    ]);
    m.warps.push({ x: 6, y: 0, targetMap: 'e4_room_1_hoenn', targetX: 5, targetY: 9 });
    return m;
  })(),
  // Elite Four Chambers
  ...makeE4Chambers('hoenn',
    [
      { id: 'sidney', dialog: ['Welcome, challenger!', 'I am SIDNEY of the ELITE FOUR!', 'I like that look you have!'] },
      { id: 'phoebe', dialog: ['I am PHOEBE of the ELITE FOUR!', 'My grandma taught me to commune', 'with GHOST POKeMON!'] },
      { id: 'glacia', dialog: ['I am GLACIA of the ELITE FOUR!', 'You and your POKeMON...', 'How hot your spirits burn!'] },
      { id: 'drake_e4', dialog: ['I am DRAKE of the ELITE FOUR!', 'I dedicated myself to DRAGON POKeMON!', 'Show me your best!'] },
    ],
    { id: 'steven', dialog: ['I am STEVEN, the CHAMPION!', 'As the HOENN region CHAMPION,', 'I accept your challenge!'] },
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

// Rustboro Gym: 2 trainers
hoennInteriors.rustboro_gym.npcs.push(
  gymTrainer('rustboro_gym_1', 3, 7, 'right', ['ROCK types are solid!', 'Can you crack them?'], 3),
  gymTrainer('rustboro_gym_2', 9, 5, 'left', ['ROXANNE studies POKeMON', 'as well as battles!'], 3),
);

// Dewford Gym: 1 trainer
hoennInteriors.dewford_gym.npcs.push(
  gymTrainer('dewford_gym_1', 4, 6, 'right', ['It\u0027s pitch dark in here!', 'BRAWLY likes to train in', 'total darkness!'], 3),
);

// Mauville Gym: 2 trainers
hoennInteriors.mauville_gym.npcs.push(
  gymTrainer('mauville_gym_1', 3, 7, 'right', ['WATTSON\u0027s ELECTRIC shocks', 'will zap you silly!'], 3),
  gymTrainer('mauville_gym_2', 9, 5, 'left', ['Wahahahaha!', 'You\u0027ll get a real charge!'], 3),
);

// Lavaridge Gym: 2 trainers
hoennInteriors.lavaridge_gym.npcs.push(
  gymTrainer('lavaridge_gym_1', 3, 7, 'right', ['The hot springs here power', 'FLANNERY\u0027s FIRE POKeMON!'], 3),
  gymTrainer('lavaridge_gym_2', 9, 4, 'down', ['FLANNERY inherited this GYM', 'from her grandfather!'], 2),
);

// Petalburg Gym: 2 trainers
hoennInteriors.petalburg_gym.npcs.push(
  gymTrainer('petalburg_gym_1', 4, 7, 'right', ['Each room in this GYM', 'has a different theme!'], 3),
  gymTrainer('petalburg_gym_2', 8, 5, 'left', ['NORMAN is your father!', 'Don\u0027t expect him to go easy!'], 3),
);

// Fortree Gym: 2 trainers
hoennInteriors.fortree_gym.npcs.push(
  gymTrainer('fortree_gym_1', 3, 7, 'right', ['WINONA\u0027s FLYING POKeMON', 'soar above the treetops!'], 3),
  gymTrainer('fortree_gym_2', 9, 5, 'left', ['The rotating doors will', 'confuse you!'], 3),
);

// Mossdeep Gym: 3 trainers
hoennInteriors.mossdeep_gym.npcs.push(
  gymTrainer('mossdeep_gym_1', 3, 8, 'right', ['TATE and LIZA fight as a duo!', 'This is a double battle GYM!'], 3),
  gymTrainer('mossdeep_gym_2', 9, 6, 'left', ['PSYCHIC types see through', 'all your tricks!'], 3),
  gymTrainer('mossdeep_gym_3', 6, 4, 'down', ['Two GYM LEADERS at once!', 'Are you prepared?'], 2),
);

// Sootopolis Gym: 3 trainers
hoennInteriors.sootopolis_gym.npcs.push(
  gymTrainer('sootopolis_gym_1', 3, 8, 'right', ['WALLACE is the most elegant', 'trainer in HOENN!'], 3),
  gymTrainer('sootopolis_gym_2', 9, 6, 'left', ['WATER types flow around', 'all obstacles!'], 3),
  gymTrainer('sootopolis_gym_3', 6, 4, 'down', ['The path through this GYM', 'requires cracking the ice!'], 2),
);
