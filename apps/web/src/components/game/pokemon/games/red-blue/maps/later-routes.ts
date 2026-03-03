// ============================================================================
// Later Kanto Routes & Cities (Routes 5-25 + remaining cities)
// ============================================================================

import type { GameMap } from '../../../engine/types';
import { kantoLegendaries } from '../../../engine/postgame';

const T = 5, G = 1, P = 2, TG = 3, W = 4, B = 6, R = 7, D = 8;
const RK = 11, S = 16, FL = 14, LD = 13;

// --- Helper for simple outdoor maps ---
function makeRoute(
  id: string, name: string, width: number, height: number,
  connections: GameMap['connections'],
  encounters: GameMap['encounters'],
  npcs: GameMap['npcs'] = [],
  groundOverride?: number[][],
): GameMap {
  const ground = groundOverride ?? Array.from({ length: height }, (_, y) => {
    const row = new Array(width).fill(G);
    row[0] = T; row[width - 1] = T;
    if (y === 0 || y === height - 1) { row.fill(T); row[Math.floor(width / 2)] = P; row[Math.floor(width / 2) + 1] = P; }
    else {
      row[Math.floor(width / 2)] = P; row[Math.floor(width / 2) + 1] = P;
      // Add tall_grass patches on both sides of the path for wild encounters
      const midX = Math.floor(width / 2);
      // Left patch: rows 2-4
      if (y >= 2 && y <= 4) {
        for (let x = 2; x < midX - 1; x++) row[x] = TG;
      }
      // Right patch: rows height-5 to height-3
      if (y >= height - 5 && y <= height - 3) {
        for (let x = midX + 2; x < width - 1; x++) row[x] = TG;
      }
      // Additional patches for larger maps
      if (height > 12) {
        // Left patch lower: rows 7-9
        if (y >= 7 && y <= 9) {
          for (let x = midX + 2; x < width - 1; x++) row[x] = TG;
        }
        // Right patch upper: rows height-9 to height-7
        if (y >= height - 9 && y <= height - 7) {
          for (let x = 2; x < midX - 1; x++) row[x] = TG;
        }
      }
    }
    return row;
  });

  return {
    id, name, width, height,
    tilesetId: 'overworld',
    layers: {
      ground,
      objects: ground.map(() => new Array(width).fill(0)),
      above: ground.map(() => new Array(width).fill(0)),
    },
    collision: ground.map(row =>
      row.map(tile => {
        const map: Record<number, string> = {
          [T]: 'blocked', [G]: 'walkable', [P]: 'walkable', [TG]: 'tall_grass',
          [W]: 'surfable', [B]: 'blocked', [R]: 'blocked', [D]: 'walkable',
          [RK]: 'blocked', [S]: 'walkable', [FL]: 'walkable', [LD]: 'ledge_down',
        };
        return (map[tile] ?? 'blocked') as 'walkable' | 'blocked' | 'tall_grass' | 'surfable' | 'ledge_down';
      })
    ),
    warps: [],
    connections,
    encounters,
    npcs,
    music: name.toLowerCase().includes('route') ? 'route' : 'city',
  };
}

function makeCity(
  id: string, name: string, width: number, height: number,
  connections: GameMap['connections'],
  warps: GameMap['warps'],
  npcs: GameMap['npcs'] = [],
): GameMap {
  const route = makeRoute(id, name, width, height, connections, [], npcs);
  // Add buildings to city center
  const ground = route.layers.ground;
  // Place some buildings in the middle
  const midX = Math.floor(width / 2);
  const midY = Math.floor(height / 2);
  for (let dy = -2; dy <= 0; dy++) {
    for (let dx = -2; dx <= 0; dx++) {
      const y = midY + dy; const x = midX + dx + 4;
      if (y >= 0 && y < height && x >= 0 && x < width) {
        ground[y][x] = dy === -2 ? R : (dy === 0 && dx === -1 ? D : B);
      }
    }
  }
  for (let dy = -2; dy <= 0; dy++) {
    for (let dx = -2; dx <= 0; dx++) {
      const y = midY + dy; const x = midX + dx - 2;
      if (y >= 0 && y < height && x >= 0 && x < width) {
        ground[y][x] = dy === -2 ? R : (dy === 0 && dx === -1 ? D : B);
      }
    }
  }
  // Recalculate collision
  route.collision = ground.map(row =>
    row.map(tile => {
      const map: Record<number, string> = {
        [T]: 'blocked', [G]: 'walkable', [P]: 'walkable', [W]: 'surfable',
        [B]: 'blocked', [R]: 'blocked', [D]: 'walkable', [S]: 'walkable', [FL]: 'walkable',
      };
      return (map[tile] ?? 'blocked') as 'walkable' | 'blocked' | 'surfable';
    })
  );
  route.warps = warps;
  return route;
}

// --- Routes ---

export const route5: GameMap = makeRoute(
  'route_5', 'ROUTE 5', 14, 16,
  [
    { direction: 'up', targetMap: 'cerulean_city', offset: 0 },
    { direction: 'down', targetMap: 'saffron_city', offset: 0 },
  ],
  [{ type: 'grass', entries: [
    { speciesId: 16, minLevel: 13, maxLevel: 16, weight: 30 },
    { speciesId: 43, minLevel: 13, maxLevel: 16, weight: 30 },
    { speciesId: 52, minLevel: 13, maxLevel: 16, weight: 20 },
    { speciesId: 56, minLevel: 13, maxLevel: 16, weight: 20 },
  ]}],
);

export const route6: GameMap = makeRoute(
  'route_6', 'ROUTE 6', 14, 16,
  [
    { direction: 'up', targetMap: 'saffron_city', offset: 0 },
    { direction: 'down', targetMap: 'vermilion_city', offset: 0 },
  ],
  [{ type: 'grass', entries: [
    { speciesId: 16, minLevel: 13, maxLevel: 17, weight: 25 },
    { speciesId: 43, minLevel: 13, maxLevel: 17, weight: 25 },
    { speciesId: 56, minLevel: 13, maxLevel: 17, weight: 25 },
    { speciesId: 52, minLevel: 13, maxLevel: 17, weight: 25 },
  ]}],
);

export const route7: GameMap = makeRoute(
  'route_7', 'ROUTE 7', 16, 10,
  [
    { direction: 'right', targetMap: 'saffron_city', offset: 0 },
    { direction: 'left', targetMap: 'celadon_city', offset: 0 },
  ],
  [{ type: 'grass', entries: [
    { speciesId: 37, minLevel: 19, maxLevel: 22, weight: 25 },
    { speciesId: 58, minLevel: 19, maxLevel: 22, weight: 25 },
    { speciesId: 52, minLevel: 19, maxLevel: 22, weight: 25 },
    { speciesId: 16, minLevel: 19, maxLevel: 22, weight: 25 },
  ]}],
);

export const route8: GameMap = makeRoute(
  'route_8', 'ROUTE 8', 20, 10,
  [
    { direction: 'left', targetMap: 'saffron_city', offset: 0 },
    { direction: 'right', targetMap: 'lavender_town', offset: 0 },
  ],
  [{ type: 'grass', entries: [
    { speciesId: 37, minLevel: 18, maxLevel: 22, weight: 20 },
    { speciesId: 58, minLevel: 18, maxLevel: 22, weight: 20 },
    { speciesId: 52, minLevel: 18, maxLevel: 22, weight: 20 },
    { speciesId: 77, minLevel: 18, maxLevel: 22, weight: 20 },
    { speciesId: 96, minLevel: 20, maxLevel: 22, weight: 20 },
  ]}],
);

export const route9: GameMap = makeRoute(
  'route_9', 'ROUTE 9', 20, 10,
  [
    { direction: 'left', targetMap: 'cerulean_city', offset: 0 },
    { direction: 'right', targetMap: 'rock_tunnel_entrance', offset: 0 },
  ],
  [{ type: 'grass', entries: [
    { speciesId: 19, minLevel: 15, maxLevel: 18, weight: 25 },
    { speciesId: 21, minLevel: 15, maxLevel: 18, weight: 25 },
    { speciesId: 23, minLevel: 15, maxLevel: 18, weight: 25 },
    { speciesId: 100, minLevel: 14, maxLevel: 17, weight: 25 },
  ]}],
);

export const route10: GameMap = makeRoute(
  'route_10', 'ROUTE 10', 14, 16,
  [
    { direction: 'up', targetMap: 'rock_tunnel_entrance', offset: 0 },
    { direction: 'down', targetMap: 'lavender_town', offset: 0 },
  ],
  [{ type: 'grass', entries: [
    { speciesId: 100, minLevel: 16, maxLevel: 20, weight: 25 },
    { speciesId: 21, minLevel: 16, maxLevel: 20, weight: 25 },
    { speciesId: 23, minLevel: 16, maxLevel: 20, weight: 25 },
    { speciesId: 81, minLevel: 16, maxLevel: 20, weight: 25 },
  ]}],
);

export const route11: GameMap = makeRoute(
  'route_11', 'ROUTE 11', 24, 10,
  [
    { direction: 'left', targetMap: 'vermilion_city', offset: 0 },
    { direction: 'right', targetMap: 'route_12', offset: 0 },
  ],
  [{ type: 'grass', entries: [
    { speciesId: 23, minLevel: 13, maxLevel: 17, weight: 25 },
    { speciesId: 96, minLevel: 13, maxLevel: 17, weight: 25 },
    { speciesId: 21, minLevel: 13, maxLevel: 15, weight: 25 },
    { speciesId: 19, minLevel: 13, maxLevel: 15, weight: 25 },
  ]}],
);

export const route12: GameMap = makeRoute(
  'route_12', 'ROUTE 12', 14, 24,
  [
    { direction: 'up', targetMap: 'lavender_town', offset: 0 },
    { direction: 'down', targetMap: 'route_13', offset: 0 },
  ],
  [{ type: 'grass', entries: [
    { speciesId: 16, minLevel: 25, maxLevel: 29, weight: 25 },
    { speciesId: 43, minLevel: 25, maxLevel: 29, weight: 25 },
    { speciesId: 48, minLevel: 25, maxLevel: 29, weight: 25 },
    { speciesId: 69, minLevel: 25, maxLevel: 29, weight: 25 },
  ]}],
);

export const route13: GameMap = makeRoute(
  'route_13', 'ROUTE 13', 24, 10,
  [
    { direction: 'left', targetMap: 'route_14', offset: 0 },
    { direction: 'right', targetMap: 'route_12', offset: 0 },
  ],
  [{ type: 'grass', entries: [
    { speciesId: 16, minLevel: 25, maxLevel: 29, weight: 25 },
    { speciesId: 43, minLevel: 25, maxLevel: 29, weight: 25 },
    { speciesId: 48, minLevel: 25, maxLevel: 29, weight: 25 },
    { speciesId: 69, minLevel: 25, maxLevel: 29, weight: 25 },
  ]}],
);

export const route14: GameMap = makeRoute(
  'route_14', 'ROUTE 14', 14, 20,
  [
    { direction: 'up', targetMap: 'route_13', offset: 0 },
    { direction: 'down', targetMap: 'route_15', offset: 0 },
  ],
  [{ type: 'grass', entries: [
    { speciesId: 43, minLevel: 26, maxLevel: 30, weight: 25 },
    { speciesId: 48, minLevel: 26, maxLevel: 30, weight: 25 },
    { speciesId: 132, minLevel: 23, maxLevel: 30, weight: 25 },
    { speciesId: 69, minLevel: 26, maxLevel: 30, weight: 25 },
  ]}],
);

export const route15: GameMap = makeRoute(
  'route_15', 'ROUTE 15', 24, 10,
  [
    { direction: 'left', targetMap: 'fuchsia_city', offset: 0 },
    { direction: 'right', targetMap: 'route_14', offset: 0 },
  ],
  [{ type: 'grass', entries: [
    { speciesId: 43, minLevel: 26, maxLevel: 30, weight: 25 },
    { speciesId: 48, minLevel: 26, maxLevel: 30, weight: 25 },
    { speciesId: 16, minLevel: 26, maxLevel: 30, weight: 25 },
    { speciesId: 69, minLevel: 26, maxLevel: 30, weight: 25 },
  ]}],
);

export const route16: GameMap = makeRoute(
  'route_16', 'ROUTE 16', 16, 10,
  [
    { direction: 'right', targetMap: 'celadon_city', offset: 0 },
    { direction: 'left', targetMap: 'route_17', offset: 0 },
  ],
  [{ type: 'grass', entries: [
    { speciesId: 19, minLevel: 20, maxLevel: 25, weight: 30 },
    { speciesId: 21, minLevel: 20, maxLevel: 25, weight: 30 },
    { speciesId: 84, minLevel: 20, maxLevel: 25, weight: 20 },
    { speciesId: 143, minLevel: 30, maxLevel: 30, weight: 20 },
  ]}],
);

export const route17: GameMap = makeRoute(
  'route_17', 'ROUTE 17', 14, 30,
  [
    { direction: 'up', targetMap: 'route_16', offset: 0 },
    { direction: 'down', targetMap: 'route_18', offset: 0 },
  ],
  [{ type: 'grass', entries: [
    { speciesId: 21, minLevel: 24, maxLevel: 28, weight: 25 },
    { speciesId: 84, minLevel: 26, maxLevel: 28, weight: 25 },
    { speciesId: 19, minLevel: 24, maxLevel: 28, weight: 25 },
    { speciesId: 20, minLevel: 26, maxLevel: 28, weight: 25 },
  ]}],
);

export const route18: GameMap = makeRoute(
  'route_18', 'ROUTE 18', 16, 10,
  [
    { direction: 'left', targetMap: 'fuchsia_city', offset: 0 },
    { direction: 'right', targetMap: 'route_17', offset: 0 },
  ],
  [{ type: 'grass', entries: [
    { speciesId: 21, minLevel: 25, maxLevel: 29, weight: 25 },
    { speciesId: 84, minLevel: 26, maxLevel: 29, weight: 25 },
    { speciesId: 20, minLevel: 26, maxLevel: 29, weight: 25 },
    { speciesId: 85, minLevel: 29, maxLevel: 29, weight: 25 },
  ]}],
);

export const route19: GameMap = makeRoute(
  'route_19', 'ROUTE 19', 14, 20,
  [
    { direction: 'up', targetMap: 'fuchsia_city', offset: 0 },
    { direction: 'down', targetMap: 'route_20', offset: 0 },
  ],
  [{ type: 'surf', entries: [
    { speciesId: 72, minLevel: 5, maxLevel: 40, weight: 50 },
    { speciesId: 73, minLevel: 30, maxLevel: 40, weight: 50 },
  ]}],
);

export const route20: GameMap = makeRoute(
  'route_20', 'ROUTE 20', 30, 10,
  [
    { direction: 'left', targetMap: 'cinnabar_island', offset: 0 },
    { direction: 'right', targetMap: 'route_19', offset: 0 },
  ],
  [{ type: 'surf', entries: [
    { speciesId: 72, minLevel: 5, maxLevel: 40, weight: 50 },
    { speciesId: 73, minLevel: 30, maxLevel: 40, weight: 50 },
  ]}],
);

export const route21: GameMap = makeRoute(
  'route_21', 'ROUTE 21', 14, 24,
  [
    { direction: 'up', targetMap: 'pallet_town', offset: 0 },
    { direction: 'down', targetMap: 'cinnabar_island', offset: 0 },
  ],
  [{ type: 'surf', entries: [
    { speciesId: 72, minLevel: 5, maxLevel: 40, weight: 50 },
    { speciesId: 73, minLevel: 30, maxLevel: 40, weight: 50 },
  ]}],
);

export const route22: GameMap = makeRoute(
  'route_22', 'ROUTE 22', 20, 10,
  [
    { direction: 'right', targetMap: 'viridian_city', offset: 0 },
    { direction: 'left', targetMap: 'route_23', offset: 0 },
  ],
  [{ type: 'grass', entries: [
    { speciesId: 56, minLevel: 3, maxLevel: 5, weight: 25 },
    { speciesId: 19, minLevel: 2, maxLevel: 5, weight: 25 },
    { speciesId: 29, minLevel: 3, maxLevel: 5, weight: 25 },
    { speciesId: 32, minLevel: 3, maxLevel: 5, weight: 25 },
  ]}],
);

export const route23: GameMap = makeRoute(
  'route_23', 'ROUTE 23', 14, 30,
  [
    { direction: 'up', targetMap: 'victory_road_entrance', offset: 0 },
    { direction: 'down', targetMap: 'route_22', offset: 0 },
  ],
  [{ type: 'grass', entries: [
    { speciesId: 21, minLevel: 33, maxLevel: 35, weight: 20 },
    { speciesId: 22, minLevel: 33, maxLevel: 35, weight: 20 },
    { speciesId: 27, minLevel: 33, maxLevel: 35, weight: 20 },
    { speciesId: 28, minLevel: 33, maxLevel: 35, weight: 20 },
    { speciesId: 132, minLevel: 33, maxLevel: 35, weight: 20 },
  ]}],
);

export const route24: GameMap = makeRoute(
  'route_24', 'ROUTE 24', 14, 20,
  [
    { direction: 'down', targetMap: 'cerulean_city', offset: 0 },
    { direction: 'up', targetMap: 'route_25', offset: 0 },
  ],
  [{ type: 'grass', entries: [
    { speciesId: 10, minLevel: 7, maxLevel: 12, weight: 15 },
    { speciesId: 13, minLevel: 7, maxLevel: 12, weight: 15 },
    { speciesId: 16, minLevel: 8, maxLevel: 13, weight: 20 },
    { speciesId: 43, minLevel: 12, maxLevel: 14, weight: 25 },
    { speciesId: 63, minLevel: 7, maxLevel: 11, weight: 25 },
  ]}],
);

export const route25: GameMap = makeRoute(
  'route_25', 'ROUTE 25', 20, 10,
  [
    { direction: 'down', targetMap: 'route_24', offset: 0 },
  ],
  [{ type: 'grass', entries: [
    { speciesId: 10, minLevel: 8, maxLevel: 12, weight: 15 },
    { speciesId: 13, minLevel: 8, maxLevel: 12, weight: 15 },
    { speciesId: 16, minLevel: 9, maxLevel: 14, weight: 20 },
    { speciesId: 43, minLevel: 12, maxLevel: 14, weight: 25 },
    { speciesId: 63, minLevel: 8, maxLevel: 12, weight: 25 },
  ]}],
);

// --- Cities ---

export const vermilionCity: GameMap = makeCity(
  'vermilion_city', 'VERMILION CITY', 20, 18,
  [
    { direction: 'up', targetMap: 'route_6', offset: 0 },
    { direction: 'right', targetMap: 'route_11', offset: 0 },
  ],
  [
    { x: 12, y: 8, targetMap: 'vermilion_gym', targetX: 6, targetY: 11 },
    { x: 8, y: 8, targetMap: 'vermilion_pokecenter', targetX: 3, targetY: 7 },
  ],
  [
    {
      id: 'vermilion_sign', x: 10, y: 10, spriteId: 'sign', direction: 'down',
      movement: 'static', dialog: ['VERMILION CITY', 'The Port of Exquisite Sunsets'], isTrainer: false,
    },
  ],
);

export const lavenderTown: GameMap = makeCity(
  'lavender_town', 'LAVENDER TOWN', 16, 16,
  [
    { direction: 'left', targetMap: 'route_8', offset: 0 },
    { direction: 'down', targetMap: 'route_12', offset: 0 },
    { direction: 'up', targetMap: 'route_10', offset: 0 },
  ],
  [
    { x: 8, y: 7, targetMap: 'lavender_pokecenter', targetX: 3, targetY: 7 },
  ],
  [
    {
      id: 'lavender_sign', x: 8, y: 9, spriteId: 'sign', direction: 'down',
      movement: 'static', dialog: ['LAVENDER TOWN', 'The Noble Purple Town'], isTrainer: false,
    },
  ],
);

export const celadonCity: GameMap = makeCity(
  'celadon_city', 'CELADON CITY', 24, 18,
  [
    { direction: 'right', targetMap: 'route_7', offset: 0 },
    { direction: 'left', targetMap: 'route_16', offset: 0 },
  ],
  [
    { x: 12, y: 8, targetMap: 'celadon_gym', targetX: 6, targetY: 11 },
    { x: 8, y: 8, targetMap: 'celadon_pokecenter', targetX: 3, targetY: 7 },
  ],
  [
    {
      id: 'celadon_sign', x: 12, y: 10, spriteId: 'sign', direction: 'down',
      movement: 'static', dialog: ['CELADON CITY', 'The City of Rainbow Dreams'], isTrainer: false,
    },
  ],
);

export const fuchsiaCity: GameMap = makeCity(
  'fuchsia_city', 'FUCHSIA CITY', 20, 18,
  [
    { direction: 'right', targetMap: 'route_15', offset: 0 },
    { direction: 'left', targetMap: 'route_18', offset: 0 },
    { direction: 'down', targetMap: 'route_19', offset: 0 },
  ],
  [
    { x: 12, y: 8, targetMap: 'fuchsia_gym', targetX: 6, targetY: 11 },
    { x: 8, y: 8, targetMap: 'fuchsia_pokecenter', targetX: 3, targetY: 7 },
  ],
  [
    {
      id: 'fuchsia_sign', x: 10, y: 10, spriteId: 'sign', direction: 'down',
      movement: 'static', dialog: ['FUCHSIA CITY', 'Behold! It\u0027s Passion Pink!'], isTrainer: false,
    },
  ],
);

export const saffronCity: GameMap = makeCity(
  'saffron_city', 'SAFFRON CITY', 22, 20,
  [
    { direction: 'up', targetMap: 'route_5', offset: 0 },
    { direction: 'down', targetMap: 'route_6', offset: 0 },
    { direction: 'left', targetMap: 'route_7', offset: 0 },
    { direction: 'right', targetMap: 'route_8', offset: 0 },
  ],
  [
    { x: 11, y: 9, targetMap: 'saffron_gym', targetX: 6, targetY: 11 },
    { x: 7, y: 9, targetMap: 'saffron_pokecenter', targetX: 3, targetY: 7 },
  ],
  [
    {
      id: 'saffron_sign', x: 11, y: 11, spriteId: 'sign', direction: 'down',
      movement: 'static', dialog: ['SAFFRON CITY', 'Shining, Golden Land of Commerce'], isTrainer: false,
    },
  ],
);

export const cinnabarIsland: GameMap = makeCity(
  'cinnabar_island', 'CINNABAR ISLAND', 18, 16,
  [
    { direction: 'right', targetMap: 'route_20', offset: 0 },
    { direction: 'up', targetMap: 'route_21', offset: 0 },
  ],
  [
    { x: 9, y: 7, targetMap: 'cinnabar_gym', targetX: 6, targetY: 11 },
    { x: 5, y: 7, targetMap: 'cinnabar_pokecenter', targetX: 3, targetY: 7 },
  ],
  [
    {
      id: 'cinnabar_sign', x: 9, y: 9, spriteId: 'sign', direction: 'down',
      movement: 'static', dialog: ['CINNABAR ISLAND', 'The Fiery Town of Burning Desire'], isTrainer: false,
    },
  ],
);

// --- Dungeons ---

export const rockTunnel: GameMap = makeRoute(
  'rock_tunnel', 'ROCK TUNNEL', 20, 20,
  [],
  [{ type: 'cave', entries: [
    { speciesId: 41, minLevel: 15, maxLevel: 18, weight: 30 },
    { speciesId: 74, minLevel: 15, maxLevel: 17, weight: 25 },
    { speciesId: 66, minLevel: 15, maxLevel: 18, weight: 25 },
    { speciesId: 95, minLevel: 13, maxLevel: 17, weight: 20 },
  ]}],
);
// Override rock tunnel to look like a cave
rockTunnel.tilesetId = 'cave';
rockTunnel.warps = [
  { x: 1, y: 1, targetMap: 'route_9', targetX: 18, targetY: 5 },
  { x: 18, y: 18, targetMap: 'route_10', targetX: 7, targetY: 1 },
];

export const victoryRoad: GameMap = makeRoute(
  'victory_road', 'VICTORY ROAD', 20, 24,
  [],
  [{ type: 'cave', entries: [
    { speciesId: 66, minLevel: 36, maxLevel: 42, weight: 15 },
    { speciesId: 67, minLevel: 38, maxLevel: 42, weight: 10 },
    { speciesId: 74, minLevel: 36, maxLevel: 42, weight: 15 },
    { speciesId: 75, minLevel: 40, maxLevel: 44, weight: 10 },
    { speciesId: 41, minLevel: 36, maxLevel: 42, weight: 20 },
    { speciesId: 42, minLevel: 40, maxLevel: 44, weight: 10 },
    { speciesId: 95, minLevel: 36, maxLevel: 42, weight: 10 },
    { speciesId: 105, minLevel: 40, maxLevel: 44, weight: 10 },
  ]}],
);
victoryRoad.tilesetId = 'cave';
victoryRoad.warps = [
  { x: 1, y: 22, targetMap: 'route_23', targetX: 7, targetY: 1 },
  { x: 18, y: 1, targetMap: 'indigo_plateau', targetX: 6, targetY: 9 },
];

// Postgame: Moltres static encounter (requires defeated_champion flag via story event)
const moltresEncounter = kantoLegendaries.find(l => l.id === 'moltres');
if (moltresEncounter) victoryRoad.npcs.push(moltresEncounter.npc);

// Seafoam Islands B4F: Articuno encounter location
export const seafoamIslandsB4F: GameMap = makeRoute(
  'seafoam_islands_b4f', 'SEAFOAM ISLANDS B4F', 16, 16,
  [],
  [{ type: 'cave', entries: [
    { speciesId: 86, minLevel: 30, maxLevel: 34, weight: 25 },
    { speciesId: 87, minLevel: 32, maxLevel: 36, weight: 10 },
    { speciesId: 90, minLevel: 30, maxLevel: 34, weight: 20 },
    { speciesId: 91, minLevel: 34, maxLevel: 38, weight: 10 },
    { speciesId: 116, minLevel: 30, maxLevel: 34, weight: 20 },
    { speciesId: 117, minLevel: 32, maxLevel: 36, weight: 10 },
    { speciesId: 41, minLevel: 30, maxLevel: 34, weight: 5 },
  ]}],
);
seafoamIslandsB4F.tilesetId = 'cave';
seafoamIslandsB4F.warps = [
  { x: 1, y: 1, targetMap: 'route_20', targetX: 5, targetY: 5 },
];
const articunoEncounter = kantoLegendaries.find(l => l.id === 'articuno');
if (articunoEncounter) seafoamIslandsB4F.npcs.push(articunoEncounter.npc);

// Power Plant: Zapdos encounter location
export const powerPlant: GameMap = makeRoute(
  'power_plant', 'POWER PLANT', 20, 16,
  [],
  [{ type: 'cave', entries: [
    { speciesId: 81, minLevel: 30, maxLevel: 35, weight: 25 },
    { speciesId: 82, minLevel: 33, maxLevel: 37, weight: 10 },
    { speciesId: 100, minLevel: 30, maxLevel: 35, weight: 25 },
    { speciesId: 101, minLevel: 33, maxLevel: 37, weight: 10 },
    { speciesId: 25, minLevel: 30, maxLevel: 35, weight: 15 },
    { speciesId: 26, minLevel: 33, maxLevel: 37, weight: 5 },
    { speciesId: 125, minLevel: 33, maxLevel: 37, weight: 10 },
  ]}],
);
powerPlant.tilesetId = 'cave';
powerPlant.warps = [
  { x: 1, y: 14, targetMap: 'route_10', targetX: 10, targetY: 5 },
];
const zapdosEncounter = kantoLegendaries.find(l => l.id === 'zapdos');
if (zapdosEncounter) powerPlant.npcs.push(zapdosEncounter.npc);

export const ceruleanCave: GameMap = makeRoute(
  'cerulean_cave', 'CERULEAN CAVE', 20, 20,
  [],
  [{ type: 'cave', entries: [
    { speciesId: 42, minLevel: 46, maxLevel: 55, weight: 15 },
    { speciesId: 64, minLevel: 46, maxLevel: 55, weight: 10 },
    { speciesId: 82, minLevel: 46, maxLevel: 55, weight: 10 },
    { speciesId: 101, minLevel: 46, maxLevel: 55, weight: 10 },
    { speciesId: 132, minLevel: 46, maxLevel: 55, weight: 15 },
    { speciesId: 47, minLevel: 49, maxLevel: 55, weight: 10 },
    { speciesId: 57, minLevel: 49, maxLevel: 55, weight: 10 },
    { speciesId: 112, minLevel: 49, maxLevel: 55, weight: 10 },
    { speciesId: 97, minLevel: 49, maxLevel: 55, weight: 10 },
  ]}],
);
ceruleanCave.tilesetId = 'cave';
ceruleanCave.warps = [
  { x: 1, y: 18, targetMap: 'cerulean_city', targetX: 14, targetY: 4 },
];

// Postgame: Mewtwo static encounter (requires defeated_champion flag via story event)
const mewtwoEncounter = kantoLegendaries.find(l => l.id === 'mewtwo');
if (mewtwoEncounter) ceruleanCave.npcs.push(mewtwoEncounter.npc);

export const safariZone: GameMap = makeRoute(
  'safari_zone', 'SAFARI ZONE', 20, 20,
  [],
  [{ type: 'grass', entries: [
    { speciesId: 29, minLevel: 22, maxLevel: 30, weight: 15 },
    { speciesId: 30, minLevel: 26, maxLevel: 33, weight: 10 },
    { speciesId: 111, minLevel: 25, maxLevel: 29, weight: 15 },
    { speciesId: 113, minLevel: 26, maxLevel: 28, weight: 5 },
    { speciesId: 115, minLevel: 25, maxLevel: 28, weight: 10 },
    { speciesId: 123, minLevel: 25, maxLevel: 28, weight: 10 },
    { speciesId: 127, minLevel: 25, maxLevel: 28, weight: 10 },
    { speciesId: 128, minLevel: 25, maxLevel: 28, weight: 10 },
    { speciesId: 102, minLevel: 24, maxLevel: 27, weight: 15 },
  ]}],
);
