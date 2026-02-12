// ============================================================================
// Ruby/Sapphire - Wild Encounter Tables
// ============================================================================

import type { WildEncounterZone } from '../../engine/types';

export const hoennEncounters: Record<string, WildEncounterZone[]> = {
  route_101: [{
    type: 'grass',
    entries: [
      { speciesId: 263, minLevel: 2, maxLevel: 3, weight: 45 }, // Zigzagoon
      { speciesId: 261, minLevel: 2, maxLevel: 3, weight: 45 }, // Poochyena
      { speciesId: 265, minLevel: 2, maxLevel: 3, weight: 10 }, // Wurmple
    ],
  }],

  route_102: [{
    type: 'grass',
    entries: [
      { speciesId: 263, minLevel: 3, maxLevel: 4, weight: 25 }, // Zigzagoon
      { speciesId: 261, minLevel: 3, maxLevel: 4, weight: 25 }, // Poochyena
      { speciesId: 265, minLevel: 3, maxLevel: 4, weight: 15 }, // Wurmple
      { speciesId: 280, minLevel: 4, maxLevel: 4, weight: 10 }, // Ralts
      { speciesId: 270, minLevel: 3, maxLevel: 4, weight: 15 }, // Lotad
      { speciesId: 273, minLevel: 3, maxLevel: 4, weight: 10 }, // Seedot
    ],
  }],

  petalburg_woods: [{
    type: 'grass',
    entries: [
      { speciesId: 263, minLevel: 5, maxLevel: 6, weight: 20 }, // Zigzagoon
      { speciesId: 265, minLevel: 5, maxLevel: 6, weight: 20 }, // Wurmple
      { speciesId: 266, minLevel: 5, maxLevel: 6, weight: 10 }, // Silcoon
      { speciesId: 268, minLevel: 5, maxLevel: 6, weight: 10 }, // Cascoon
      { speciesId: 285, minLevel: 5, maxLevel: 6, weight: 15 }, // Shroomish
      { speciesId: 276, minLevel: 5, maxLevel: 6, weight: 15 }, // Taillow
      { speciesId: 283, minLevel: 5, maxLevel: 6, weight: 10 }, // Surskit
    ],
  }],

  route_104: [{
    type: 'grass',
    entries: [
      { speciesId: 263, minLevel: 4, maxLevel: 7, weight: 25 }, // Zigzagoon
      { speciesId: 276, minLevel: 4, maxLevel: 7, weight: 25 }, // Taillow
      { speciesId: 265, minLevel: 4, maxLevel: 5, weight: 15 }, // Wurmple
      { speciesId: 278, minLevel: 4, maxLevel: 7, weight: 20 }, // Wingull
      { speciesId: 183, minLevel: 4, maxLevel: 7, weight: 15 }, // Marill
    ],
  }],

  route_110: [{
    type: 'grass',
    entries: [
      { speciesId: 261, minLevel: 12, maxLevel: 14, weight: 20 }, // Poochyena
      { speciesId: 309, minLevel: 12, maxLevel: 14, weight: 25 }, // Electrike
      { speciesId: 311, minLevel: 12, maxLevel: 14, weight: 10 }, // Plusle
      { speciesId: 312, minLevel: 12, maxLevel: 14, weight: 10 }, // Minun
      { speciesId: 314, minLevel: 12, maxLevel: 14, weight: 10 }, // Illumise
      { speciesId: 43, minLevel: 12, maxLevel: 14, weight: 15 },  // Oddish
      { speciesId: 263, minLevel: 12, maxLevel: 14, weight: 10 }, // Zigzagoon
    ],
  }],

  route_111: [{
    type: 'grass',
    entries: [
      { speciesId: 27, minLevel: 20, maxLevel: 22, weight: 20 },  // Sandshrew
      { speciesId: 322, minLevel: 20, maxLevel: 22, weight: 20 }, // Numel
      { speciesId: 328, minLevel: 20, maxLevel: 22, weight: 20 }, // Trapinch
      { speciesId: 331, minLevel: 20, maxLevel: 22, weight: 15 }, // Cacnea
      { speciesId: 343, minLevel: 20, maxLevel: 22, weight: 15 }, // Baltoy
      { speciesId: 74, minLevel: 20, maxLevel: 22, weight: 10 },  // Geodude
    ],
  }],

  route_113: [{
    type: 'grass',
    entries: [
      { speciesId: 327, minLevel: 14, maxLevel: 16, weight: 25 }, // Spinda
      { speciesId: 218, minLevel: 14, maxLevel: 16, weight: 25 }, // Slugma
      { speciesId: 227, minLevel: 14, maxLevel: 16, weight: 25 }, // Skarmory
      { speciesId: 322, minLevel: 14, maxLevel: 16, weight: 25 }, // Numel
    ],
  }],

  route_119: [{
    type: 'grass',
    entries: [
      { speciesId: 43, minLevel: 25, maxLevel: 27, weight: 15 },  // Oddish
      { speciesId: 44, minLevel: 25, maxLevel: 27, weight: 10 },  // Gloom
      { speciesId: 352, minLevel: 25, maxLevel: 27, weight: 15 }, // Kecleon
      { speciesId: 357, minLevel: 25, maxLevel: 27, weight: 15 }, // Tropius
      { speciesId: 264, minLevel: 25, maxLevel: 27, weight: 15 }, // Linoone
      { speciesId: 261, minLevel: 25, maxLevel: 27, weight: 15 }, // Poochyena
      { speciesId: 262, minLevel: 25, maxLevel: 27, weight: 15 }, // Mightyena
    ],
  }],

  route_120: [{
    type: 'grass',
    entries: [
      { speciesId: 43, minLevel: 25, maxLevel: 27, weight: 15 },  // Oddish
      { speciesId: 352, minLevel: 25, maxLevel: 27, weight: 15 }, // Kecleon
      { speciesId: 359, minLevel: 25, maxLevel: 27, weight: 10 }, // Absol
      { speciesId: 264, minLevel: 25, maxLevel: 27, weight: 20 }, // Linoone
      { speciesId: 262, minLevel: 25, maxLevel: 27, weight: 20 }, // Mightyena
      { speciesId: 183, minLevel: 25, maxLevel: 27, weight: 20 }, // Marill
    ],
  }],

  route_122: [{
    type: 'surf',
    entries: [
      { speciesId: 72, minLevel: 25, maxLevel: 30, weight: 40 },  // Tentacool
      { speciesId: 278, minLevel: 25, maxLevel: 30, weight: 30 }, // Wingull
      { speciesId: 279, minLevel: 25, maxLevel: 30, weight: 30 }, // Pelipper
    ],
  }],

  meteor_falls: [{
    type: 'cave',
    entries: [
      { speciesId: 41, minLevel: 14, maxLevel: 18, weight: 35 },  // Zubat
      { speciesId: 337, minLevel: 25, maxLevel: 30, weight: 15 }, // Lunatone
      { speciesId: 338, minLevel: 25, maxLevel: 30, weight: 15 }, // Solrock
      { speciesId: 74, minLevel: 14, maxLevel: 18, weight: 20 },  // Geodude
      { speciesId: 371, minLevel: 25, maxLevel: 35, weight: 15 }, // Bagon (rare)
    ],
  }],

  victory_road_hoenn: [{
    type: 'cave',
    entries: [
      { speciesId: 42, minLevel: 38, maxLevel: 42, weight: 15 },  // Golbat
      { speciesId: 297, minLevel: 38, maxLevel: 42, weight: 15 }, // Hariyama
      { speciesId: 303, minLevel: 38, maxLevel: 42, weight: 10 }, // Mawile
      { speciesId: 302, minLevel: 38, maxLevel: 42, weight: 10 }, // Sableye
      { speciesId: 304, minLevel: 38, maxLevel: 42, weight: 15 }, // Aron
      { speciesId: 75, minLevel: 38, maxLevel: 42, weight: 10 },  // Graveler
      { speciesId: 264, minLevel: 38, maxLevel: 42, weight: 15 }, // Linoone
      { speciesId: 67, minLevel: 38, maxLevel: 42, weight: 10 },  // Machoke
    ],
  }],
};

export function getHoennEncounters(mapId: string): WildEncounterZone[] {
  return hoennEncounters[mapId] ?? [];
}
