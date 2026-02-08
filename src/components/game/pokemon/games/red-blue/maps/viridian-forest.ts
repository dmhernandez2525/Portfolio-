// ============================================================================
// Viridian Forest — Bug-type dungeon between Route 2 and Pewter City
// ============================================================================

import type { GameMap } from '../../../engine/types';

const T = 5, G = 1, P = 2, TG = 3;

// 18 wide x 36 tall forest maze
const W = 18;
const H = 36;

function makeForestRow(pattern: string): number[] {
  const map: Record<string, number> = { T: T, G: G, P: P, g: TG };
  return pattern.split('').map(c => map[c] ?? T);
}

const ground: number[][] = [
  makeForestRow('TTTTTTGGGPPGGTTTTTT'),
  makeForestRow('TTTTGGGGGPPGGGgTTTT'),
  makeForestRow('TTTGGgggGPPGGggGTTT'),
  makeForestRow('TTGGgggGGPPGGgggGTT'),
  makeForestRow('TTGGggGGGPPGGGggGTT'),
  makeForestRow('TTGGGGGGGPPGGGGGgTT'),
  makeForestRow('TTTGGGGPPPPPGGGGTTTT'),
  makeForestRow('TTTTGGGPGGGGPGGgTTT'),
  makeForestRow('TTTGGGGPGGGGPGGgGTT'),
  makeForestRow('TTGGggGPGGGGPGGGGTT'),
  makeForestRow('TTGGggGPGGggPGGGGTT'),
  makeForestRow('TTGGGGGPGGggPGGGGTT'),
  makeForestRow('TTGGGGGPPPPPPGGgGTT'),
  makeForestRow('TTTGGGGGGGGGGGggGTT'),
  makeForestRow('TTTTGGGGGGGGGGgGTTT'),
  makeForestRow('TTTTTGGGgggGGGGTTTT'),
  makeForestRow('TTTTGGGGgggGGGGGTTT'),
  makeForestRow('TTTGGGGGGGGGGGGgGTT'),
  makeForestRow('TTGGgGPPPPPPGGggGTT'),
  makeForestRow('TTGGgGPGGGGPGGggGTT'),
  makeForestRow('TTGGGGPGGGGPGGGGGTT'),
  makeForestRow('TTTGGGPGggGPGGGGTTT'),
  makeForestRow('TTTGGGPGggGPGGGGTTT'),
  makeForestRow('TTTGGGPGGGGPGGgGTTT'),
  makeForestRow('TTGGGGPGGGGPGGggGTT'),
  makeForestRow('TTGGggPPPPPPGGggGTT'),
  makeForestRow('TTGGggGGGGGGGGGGGTT'),
  makeForestRow('TTTGGGGGGGGGGGGgTTT'),
  makeForestRow('TTTTGGGGgggGGGGTTTT'),
  makeForestRow('TTTGGGPPPPPPGGGgTTT'),
  makeForestRow('TTGGGGPGGGGPGGGgGTT'),
  makeForestRow('TTGGgGPGGGGPGGGgGTT'),
  makeForestRow('TTGGgGPGGGGPGGGGGTT'),
  makeForestRow('TTGGGGPPPPPPGGGGGTT'),
  makeForestRow('TTTGGGGGGPPGGGGgTTT'),
  makeForestRow('TTTTTTGGGGPPGGGTTTT'),
].slice(0, H);

const objects: number[][] = ground.map(() => new Array(W).fill(0));
const above: number[][] = ground.map(() => new Array(W).fill(0));

const collision = ground.map(row =>
  row.map(tile => {
    const map: Record<number, 'walkable' | 'blocked' | 'tall_grass'> = {
      [T]: 'blocked', [G]: 'walkable', [P]: 'walkable', [TG]: 'tall_grass',
    };
    return map[tile] ?? 'blocked';
  })
);

export const viridianForest: GameMap = {
  id: 'viridian_forest',
  name: 'VIRIDIAN FOREST',
  width: W,
  height: H,
  tilesetId: 'forest',
  layers: { ground, objects, above },
  collision,
  warps: [],
  connections: [
    { direction: 'up', targetMap: 'route_2', offset: 0 },
    { direction: 'down', targetMap: 'route_2', offset: 0 },
  ],
  encounters: [
    {
      type: 'grass',
      entries: [
        { speciesId: 10, minLevel: 3, maxLevel: 6, weight: 25 },
        { speciesId: 11, minLevel: 4, maxLevel: 6, weight: 10 },
        { speciesId: 13, minLevel: 3, maxLevel: 6, weight: 25 },
        { speciesId: 14, minLevel: 4, maxLevel: 6, weight: 10 },
        { speciesId: 25, minLevel: 3, maxLevel: 5, weight: 5 },
        { speciesId: 16, minLevel: 4, maxLevel: 6, weight: 25 },
      ],
    },
  ],
  npcs: [
    {
      id: 'forest_bug_catcher_1',
      x: 7, y: 10,
      spriteId: 'bug_catcher',
      direction: 'right',
      movement: 'static',
      dialog: ['Hey! You have POKeMON!', 'Come on, let\u0027s battle!'],
      isTrainer: true,
      trainerData: {
        id: 'bug_catcher_forest_1',
        party: [
          { speciesId: 10, level: 6 },
          { speciesId: 13, level: 6 },
        ],
      },
    },
    {
      id: 'forest_bug_catcher_2',
      x: 10, y: 22,
      spriteId: 'bug_catcher',
      direction: 'left',
      movement: 'static',
      dialog: ['Pokemon live in the tall grass!', 'Bugs are the best!'],
      isTrainer: true,
      trainerData: {
        id: 'bug_catcher_forest_2',
        party: [
          { speciesId: 13, level: 7 },
          { speciesId: 14, level: 7 },
        ],
      },
    },
    {
      id: 'forest_bug_catcher_3',
      x: 5, y: 31,
      spriteId: 'bug_catcher',
      direction: 'right',
      movement: 'static',
      dialog: ['I came here to catch bugs!'],
      isTrainer: true,
      trainerData: {
        id: 'bug_catcher_forest_3',
        party: [
          { speciesId: 10, level: 9 },
        ],
      },
    },
  ],
  music: 'viridian_forest',
};
