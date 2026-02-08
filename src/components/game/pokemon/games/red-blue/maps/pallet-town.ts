// ============================================================================
// Pallet Town — Starting map for Red/Blue
// ============================================================================
// 20x18 tiles. Layout:
//   Row 0-2:  Trees (border)
//   Row 3-5:  Oak's Lab area
//   Row 6-8:  Open grass area
//   Row 9-12: Player house + Rival house
//   Row 13-15: Path to Route 1 (north) area
//   Row 16-17: Trees (south border) with exit south

import type { GameMap } from '../../../engine/types';

// Tile IDs:
// 0=empty, 1=grass, 2=path, 3=tallGrass, 4=water, 5=tree,
// 6=building, 7=roof, 8=door, 9=wall, 10=sand, 11=rock,
// 12=fence, 13=ledge, 14=flowerRed, 15=flowerYellow, 16=sign

const T = 5;  // tree
const G = 1;  // grass
const P = 2;  // path
const W = 4;  // water
const B = 6;  // building
const R = 7;  // roof
const D = 8;  // door
const F = 12; // fence
const TG = 3; // tall grass
const FL = 14; // flower red
const FY = 15; // flower yellow
const S = 16; // sign

const ground: number[][] = [
  // Row 0 - north tree border
  [T, T, T, T, T, T, T, T, G, G, P, P, G, G, T, T, T, T, T, T],
  // Row 1 - trees + path north (Route 1 connection)
  [T, T, T, T, T, T, T, G, G, G, P, P, G, G, G, T, T, T, T, T],
  // Row 2 - transition
  [T, T, T, G, G, G, G, G, G, G, P, P, G, G, G, G, G, G, T, T],
  // Row 3 - open area with sign
  [T, G, G, G, G, G, G, G, G, G, P, P, G, G, G, G, G, G, G, T],
  // Row 4 - path + grass
  [T, G, G, FL, G, G, G, G, G, P, P, P, P, G, G, G, G, FY, G, T],
  // Row 5 - path splits to houses
  [T, G, G, G, G, G, P, P, P, P, P, P, P, P, P, P, G, G, G, T],
  // Row 6 - Player house area (roof)
  [T, G, G, R, R, R, P, G, G, G, S, G, G, G, P, R, R, R, G, T],
  // Row 7 - Player house body
  [T, G, G, B, B, B, P, G, G, G, G, G, G, G, P, B, B, B, G, T],
  // Row 8 - Player house door + rival house door
  [T, G, G, B, D, B, P, G, G, G, G, G, G, G, P, B, D, B, G, T],
  // Row 9 - Path between houses
  [T, G, G, G, P, G, P, P, P, P, P, P, P, P, P, G, P, G, G, T],
  // Row 10 - Grass area
  [T, G, G, G, P, G, G, G, G, G, P, G, G, G, G, G, P, G, G, T],
  // Row 11 - Grass with flowers
  [T, G, FL, G, P, G, G, FY, G, G, P, G, G, FL, G, G, P, G, G, T],
  // Row 12 - Path to Oak's lab
  [T, G, G, G, P, P, P, P, P, P, P, P, P, P, P, P, P, G, G, T],
  // Row 13 - Oak's Lab roof
  [T, G, G, G, G, G, G, R, R, R, R, R, R, R, G, G, G, G, G, T],
  // Row 14 - Oak's Lab body
  [T, G, G, G, G, G, G, B, B, B, B, B, B, B, G, G, G, G, G, T],
  // Row 15 - Oak's Lab door
  [T, G, G, G, G, G, G, B, B, B, D, B, B, B, G, G, G, G, G, T],
  // Row 16 - South area with water
  [T, G, G, G, G, G, G, G, G, P, P, P, G, G, G, G, G, G, G, T],
  // Row 17 - South border (water/trees)
  [T, T, T, T, W, W, W, W, W, W, W, W, W, W, W, W, T, T, T, T],
];

// Object layer (mostly empty, some decorative elements)
const objects: number[][] = ground.map(() => new Array(20).fill(0));

// Above layer (tree canopies that render over player)
const above: number[][] = ground.map(() => new Array(20).fill(0));

// Collision grid
const collision = ground.map(row =>
  row.map(tile => {
    switch (tile) {
      case T:  return 'blocked' as const;
      case G:  return 'walkable' as const;
      case P:  return 'walkable' as const;
      case TG: return 'tall_grass' as const;
      case W:  return 'surfable' as const;
      case B:  return 'blocked' as const;
      case R:  return 'blocked' as const;
      case D:  return 'walkable' as const;
      case F:  return 'blocked' as const;
      case FL: return 'walkable' as const;
      case FY: return 'walkable' as const;
      case S:  return 'walkable' as const;
      default: return 'blocked' as const;
    }
  })
);

export const palletTown: GameMap = {
  id: 'pallet_town',
  name: 'PALLET TOWN',
  width: 20,
  height: 18,
  tilesetId: 'overworld',
  layers: { ground, objects, above },
  collision,
  warps: [
    // Player house door
    { x: 4, y: 8, targetMap: 'player_house_1f', targetX: 3, targetY: 7 },
    // Rival house door
    { x: 16, y: 8, targetMap: 'rival_house', targetX: 3, targetY: 7 },
    // Oak's Lab door
    { x: 10, y: 15, targetMap: 'oaks_lab', targetX: 5, targetY: 11 },
  ],
  connections: [
    { direction: 'up', targetMap: 'route_1', offset: 0 },
  ],
  encounters: [], // No wild Pokemon in Pallet Town
  npcs: [
    {
      id: 'pallet_girl',
      x: 8,
      y: 4,
      spriteId: 'girl',
      direction: 'down',
      movement: 'wander',
      dialog: [
        'I raise POKeMON too!',
        'They are pokemon',
        'pretty cute.',
      ],
      isTrainer: false,
    },
    {
      id: 'pallet_boy',
      x: 14,
      y: 10,
      spriteId: 'boy',
      direction: 'left',
      movement: 'static',
      dialog: [
        'Technology is incredible!',
        'You can now store and',
        'recall items and POKeMON',
        'via PC!',
      ],
      isTrainer: false,
    },
    {
      id: 'pallet_sign_1',
      x: 10,
      y: 6,
      spriteId: 'sign',
      direction: 'down',
      movement: 'static',
      dialog: ['PALLET TOWN', 'Shades of your journey await!'],
      isTrainer: false,
    },
  ],
  music: 'pallet_town',
};
