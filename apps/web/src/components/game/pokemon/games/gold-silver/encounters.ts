// ============================================================================
// Gold/Silver - Wild Encounter Tables
// ============================================================================

import type { WildEncounterZone } from '../../engine/types';

export const johtoEncounters: Record<string, WildEncounterZone[]> = {
  route_29: [
    {
      type: 'grass',
      entries: [
        { speciesId: 16, minLevel: 2, maxLevel: 5, weight: 35, timeOfDay: 'day' },     // Pidgey (day)
        { speciesId: 16, minLevel: 2, maxLevel: 5, weight: 35, timeOfDay: 'morning' },  // Pidgey (morning)
        { speciesId: 161, minLevel: 2, maxLevel: 5, weight: 35, timeOfDay: 'morning' }, // Sentret (morning)
        { speciesId: 161, minLevel: 2, maxLevel: 5, weight: 35, timeOfDay: 'day' },     // Sentret (day)
        { speciesId: 187, minLevel: 3, maxLevel: 5, weight: 15, timeOfDay: 'morning' }, // Hoppip (morning)
        { speciesId: 187, minLevel: 3, maxLevel: 5, weight: 15, timeOfDay: 'day' },     // Hoppip (day)
        { speciesId: 163, minLevel: 2, maxLevel: 5, weight: 35, timeOfDay: 'night' },   // Hoothoot (night)
        { speciesId: 19, minLevel: 3, maxLevel: 5, weight: 30, timeOfDay: 'night' },    // Rattata (night)
        { speciesId: 19, minLevel: 3, maxLevel: 4, weight: 15 },                         // Rattata (always)
      ],
    },
  ],

  route_30: [
    {
      type: 'grass',
      entries: [
        { speciesId: 16, minLevel: 3, maxLevel: 5, weight: 30, timeOfDay: 'morning' },  // Pidgey (morning)
        { speciesId: 16, minLevel: 3, maxLevel: 5, weight: 30, timeOfDay: 'day' },      // Pidgey (day)
        { speciesId: 10, minLevel: 3, maxLevel: 5, weight: 20, timeOfDay: 'morning' },  // Caterpie (morning)
        { speciesId: 10, minLevel: 3, maxLevel: 5, weight: 20, timeOfDay: 'day' },      // Caterpie (day)
        { speciesId: 11, minLevel: 4, maxLevel: 5, weight: 10 },                         // Metapod (always)
        { speciesId: 60, minLevel: 4, maxLevel: 5, weight: 15 },                         // Poliwag (always)
        { speciesId: 187, minLevel: 3, maxLevel: 5, weight: 25, timeOfDay: 'morning' }, // Hoppip (morning)
        { speciesId: 187, minLevel: 3, maxLevel: 5, weight: 25, timeOfDay: 'day' },     // Hoppip (day)
        { speciesId: 163, minLevel: 3, maxLevel: 5, weight: 30, timeOfDay: 'night' },   // Hoothoot (night)
        { speciesId: 167, minLevel: 3, maxLevel: 5, weight: 25, timeOfDay: 'night' },   // Spinarak (night)
      ],
    },
  ],

  route_31: [
    {
      type: 'grass',
      entries: [
        { speciesId: 16, minLevel: 4, maxLevel: 6, weight: 30, timeOfDay: 'morning' },  // Pidgey (morning)
        { speciesId: 16, minLevel: 4, maxLevel: 6, weight: 30, timeOfDay: 'day' },      // Pidgey (day)
        { speciesId: 10, minLevel: 4, maxLevel: 6, weight: 20 },                         // Caterpie (always)
        { speciesId: 69, minLevel: 4, maxLevel: 6, weight: 20 },                         // Bellsprout (always)
        { speciesId: 187, minLevel: 5, maxLevel: 6, weight: 15, timeOfDay: 'morning' }, // Hoppip (morning)
        { speciesId: 187, minLevel: 5, maxLevel: 6, weight: 15, timeOfDay: 'day' },     // Hoppip (day)
        { speciesId: 60, minLevel: 4, maxLevel: 6, weight: 15 },                         // Poliwag (always)
        { speciesId: 163, minLevel: 4, maxLevel: 6, weight: 30, timeOfDay: 'night' },   // Hoothoot (night)
      ],
    },
  ],

  sprout_tower: [
    {
      type: 'cave',
      entries: [
        { speciesId: 19, minLevel: 3, maxLevel: 5, weight: 50 },                        // Rattata (always)
        { speciesId: 92, minLevel: 3, maxLevel: 6, weight: 50, timeOfDay: 'night' },    // Gastly (night)
        { speciesId: 92, minLevel: 3, maxLevel: 6, weight: 25, timeOfDay: 'morning' },  // Gastly (rare morning)
        { speciesId: 92, minLevel: 3, maxLevel: 6, weight: 25, timeOfDay: 'day' },      // Gastly (rare day)
      ],
    },
  ],

  route_32: [
    {
      type: 'grass',
      entries: [
        { speciesId: 19, minLevel: 6, maxLevel: 8, weight: 20 },   // Rattata
        { speciesId: 41, minLevel: 4, maxLevel: 8, weight: 15 },   // Zubat
        { speciesId: 69, minLevel: 6, maxLevel: 8, weight: 15 },   // Bellsprout
        { speciesId: 179, minLevel: 6, maxLevel: 8, weight: 20 },  // Mareep
        { speciesId: 187, minLevel: 6, maxLevel: 8, weight: 15, timeOfDay: 'morning' }, // Hoppip (morning)
        { speciesId: 187, minLevel: 6, maxLevel: 8, weight: 15, timeOfDay: 'day' },     // Hoppip (day)
        { speciesId: 194, minLevel: 6, maxLevel: 8, weight: 15, timeOfDay: 'night' },   // Wooper (night)
      ],
    },
  ],

  union_cave: [
    {
      type: 'cave',
      entries: [
        { speciesId: 41, minLevel: 6, maxLevel: 8, weight: 25 },  // Zubat
        { speciesId: 74, minLevel: 6, maxLevel: 8, weight: 25 },  // Geodude
        { speciesId: 95, minLevel: 6, maxLevel: 8, weight: 15 },  // Onix
        { speciesId: 27, minLevel: 6, maxLevel: 8, weight: 20 },  // Sandshrew
        { speciesId: 19, minLevel: 6, maxLevel: 8, weight: 15 },  // Rattata
      ],
    },
  ],

  route_33: [
    {
      type: 'grass',
      entries: [
        { speciesId: 21, minLevel: 6, maxLevel: 8, weight: 30 },  // Spearow
        { speciesId: 19, minLevel: 6, maxLevel: 8, weight: 25 },  // Rattata
        { speciesId: 187, minLevel: 6, maxLevel: 8, weight: 20, timeOfDay: 'morning' }, // Hoppip (morning)
        { speciesId: 187, minLevel: 6, maxLevel: 8, weight: 20, timeOfDay: 'day' },     // Hoppip (day)
        { speciesId: 23, minLevel: 6, maxLevel: 8, weight: 25 },                         // Ekans (always)
      ],
    },
  ],

  ilex_forest: [
    {
      type: 'grass',
      entries: [
        { speciesId: 10, minLevel: 5, maxLevel: 7, weight: 20, timeOfDay: 'morning' },  // Caterpie (morning)
        { speciesId: 10, minLevel: 5, maxLevel: 7, weight: 20, timeOfDay: 'day' },      // Caterpie (day)
        { speciesId: 11, minLevel: 5, maxLevel: 7, weight: 10 },                         // Metapod (always)
        { speciesId: 13, minLevel: 5, maxLevel: 7, weight: 20 },                         // Weedle (always)
        { speciesId: 14, minLevel: 5, maxLevel: 7, weight: 10 },                         // Kakuna (always)
        { speciesId: 43, minLevel: 5, maxLevel: 7, weight: 15, timeOfDay: 'night' },    // Oddish (night)
        { speciesId: 46, minLevel: 5, maxLevel: 7, weight: 15 },                         // Paras (always)
        { speciesId: 41, minLevel: 5, maxLevel: 7, weight: 10 },                         // Zubat (always)
        { speciesId: 163, minLevel: 5, maxLevel: 7, weight: 15, timeOfDay: 'night' },   // Hoothoot (night)
      ],
    },
  ],

  route_34: [
    {
      type: 'grass',
      entries: [
        { speciesId: 19, minLevel: 10, maxLevel: 12, weight: 20 },  // Rattata
        { speciesId: 132, minLevel: 10, maxLevel: 10, weight: 10 }, // Ditto
        { speciesId: 63, minLevel: 10, maxLevel: 12, weight: 15 },  // Abra
        { speciesId: 96, minLevel: 10, maxLevel: 12, weight: 20 },  // Drowzee
        { speciesId: 183, minLevel: 10, maxLevel: 12, weight: 20 }, // Marill
        { speciesId: 16, minLevel: 10, maxLevel: 12, weight: 15 },  // Pidgey
      ],
    },
  ],

  route_35: [
    {
      type: 'grass',
      entries: [
        { speciesId: 29, minLevel: 12, maxLevel: 14, weight: 20 },  // Nidoran F
        { speciesId: 32, minLevel: 12, maxLevel: 14, weight: 20 },  // Nidoran M
        { speciesId: 96, minLevel: 12, maxLevel: 14, weight: 20 },  // Drowzee
        { speciesId: 16, minLevel: 12, maxLevel: 14, weight: 20 },  // Pidgey
        { speciesId: 183, minLevel: 12, maxLevel: 14, weight: 20 }, // Marill
      ],
    },
  ],

  route_36: [
    {
      type: 'grass',
      entries: [
        { speciesId: 29, minLevel: 13, maxLevel: 15, weight: 25 },  // Nidoran F
        { speciesId: 32, minLevel: 13, maxLevel: 15, weight: 25 },  // Nidoran M
        { speciesId: 37, minLevel: 13, maxLevel: 15, weight: 15 },  // Vulpix
        { speciesId: 58, minLevel: 13, maxLevel: 15, weight: 15 },  // Growlithe
        { speciesId: 161, minLevel: 13, maxLevel: 15, weight: 20 }, // Sentret
      ],
    },
  ],

  route_37: [
    {
      type: 'grass',
      entries: [
        { speciesId: 37, minLevel: 14, maxLevel: 16, weight: 20 },                       // Vulpix (always)
        { speciesId: 58, minLevel: 14, maxLevel: 16, weight: 20 },                       // Growlithe (always)
        { speciesId: 167, minLevel: 14, maxLevel: 16, weight: 20, timeOfDay: 'night' },  // Spinarak (night)
        { speciesId: 165, minLevel: 14, maxLevel: 16, weight: 20, timeOfDay: 'morning' },// Ledyba (morning)
        { speciesId: 21, minLevel: 14, maxLevel: 16, weight: 20 },                       // Spearow (always)
        { speciesId: 21, minLevel: 14, maxLevel: 16, weight: 20, timeOfDay: 'day' },     // Spearow (extra day)
      ],
    },
  ],

  route_38: [
    {
      type: 'grass',
      entries: [
        { speciesId: 19, minLevel: 16, maxLevel: 18, weight: 20 },  // Rattata
        { speciesId: 20, minLevel: 16, maxLevel: 18, weight: 10 },  // Raticate
        { speciesId: 128, minLevel: 16, maxLevel: 18, weight: 15 }, // Tauros
        { speciesId: 241, minLevel: 16, maxLevel: 18, weight: 15 }, // Miltank
        { speciesId: 39, minLevel: 16, maxLevel: 18, weight: 15 },  // Jigglypuff
        { speciesId: 52, minLevel: 16, maxLevel: 18, weight: 15 },  // Meowth
        { speciesId: 56, minLevel: 16, maxLevel: 18, weight: 10 },  // Mankey
      ],
    },
  ],

  route_39: [
    {
      type: 'grass',
      entries: [
        { speciesId: 19, minLevel: 16, maxLevel: 18, weight: 20 },  // Rattata
        { speciesId: 20, minLevel: 16, maxLevel: 18, weight: 10 },  // Raticate
        { speciesId: 128, minLevel: 16, maxLevel: 18, weight: 15 }, // Tauros
        { speciesId: 241, minLevel: 16, maxLevel: 18, weight: 15 }, // Miltank
        { speciesId: 52, minLevel: 16, maxLevel: 18, weight: 20 },  // Meowth
        { speciesId: 56, minLevel: 16, maxLevel: 18, weight: 20 },  // Mankey
      ],
    },
  ],

  route_40: [
    {
      type: 'surf',
      entries: [
        { speciesId: 72, minLevel: 20, maxLevel: 24, weight: 40 },  // Tentacool
        { speciesId: 73, minLevel: 22, maxLevel: 24, weight: 15 },  // Tentacruel
        { speciesId: 170, minLevel: 20, maxLevel: 24, weight: 25 }, // Chinchou
        { speciesId: 129, minLevel: 20, maxLevel: 24, weight: 20 }, // Magikarp
      ],
    },
  ],

  route_41: [
    {
      type: 'surf',
      entries: [
        { speciesId: 72, minLevel: 20, maxLevel: 24, weight: 35 },  // Tentacool
        { speciesId: 73, minLevel: 22, maxLevel: 24, weight: 15 },  // Tentacruel
        { speciesId: 170, minLevel: 20, maxLevel: 24, weight: 20 }, // Chinchou
        { speciesId: 226, minLevel: 20, maxLevel: 24, weight: 15 }, // Mantine
        { speciesId: 129, minLevel: 20, maxLevel: 24, weight: 15 }, // Magikarp
      ],
    },
  ],

  route_42: [
    {
      type: 'grass',
      entries: [
        { speciesId: 56, minLevel: 23, maxLevel: 25, weight: 25 },  // Mankey
        { speciesId: 21, minLevel: 23, maxLevel: 25, weight: 25 },  // Spearow
        { speciesId: 22, minLevel: 23, maxLevel: 25, weight: 10 },  // Fearow
        { speciesId: 41, minLevel: 23, maxLevel: 25, weight: 20 },  // Zubat
        { speciesId: 179, minLevel: 23, maxLevel: 25, weight: 20 }, // Mareep
      ],
    },
  ],

  ice_path: [
    {
      type: 'cave',
      entries: [
        { speciesId: 41, minLevel: 22, maxLevel: 24, weight: 20 },  // Zubat
        { speciesId: 42, minLevel: 22, maxLevel: 24, weight: 10 },  // Golbat
        { speciesId: 220, minLevel: 22, maxLevel: 24, weight: 25 }, // Swinub
        { speciesId: 215, minLevel: 22, maxLevel: 24, weight: 15 }, // Sneasel
        { speciesId: 124, minLevel: 22, maxLevel: 24, weight: 15 }, // Jynx
        { speciesId: 238, minLevel: 22, maxLevel: 24, weight: 15 }, // Smoochum
      ],
    },
  ],

  route_44: [
    {
      type: 'grass',
      entries: [
        { speciesId: 69, minLevel: 24, maxLevel: 26, weight: 25 }, // Bellsprout
        { speciesId: 70, minLevel: 24, maxLevel: 26, weight: 15 }, // Weepinbell
        { speciesId: 178, minLevel: 24, maxLevel: 26, weight: 20 },// Xatu (area)
        { speciesId: 47, minLevel: 24, maxLevel: 26, weight: 20 }, // Parasect
        { speciesId: 114, minLevel: 24, maxLevel: 26, weight: 20 },// Tangela
      ],
    },
  ],

  route_45: [
    {
      type: 'grass',
      entries: [
        { speciesId: 74, minLevel: 24, maxLevel: 28, weight: 20 },  // Geodude
        { speciesId: 75, minLevel: 26, maxLevel: 28, weight: 10 },  // Graveler
        { speciesId: 231, minLevel: 20, maxLevel: 23, weight: 15 }, // Phanpy
        { speciesId: 84, minLevel: 24, maxLevel: 28, weight: 20 },  // Doduo
        { speciesId: 227, minLevel: 24, maxLevel: 28, weight: 15 }, // Skarmory
        { speciesId: 207, minLevel: 24, maxLevel: 28, weight: 20 }, // Gligar
      ],
    },
  ],

  route_43: [
    {
      type: 'grass',
      entries: [
        { speciesId: 16, minLevel: 23, maxLevel: 25, weight: 20 },   // Pidgey
        { speciesId: 17, minLevel: 23, maxLevel: 25, weight: 10 },   // Pidgeotto
        { speciesId: 22, minLevel: 23, maxLevel: 25, weight: 10 },   // Fearow
        { speciesId: 20, minLevel: 23, maxLevel: 25, weight: 15 },   // Raticate
        { speciesId: 129, minLevel: 10, maxLevel: 20, weight: 20 },  // Magikarp (lake area)
        { speciesId: 130, minLevel: 30, maxLevel: 30, weight: 5 },   // Gyarados (Red Gyarados area)
        { speciesId: 178, minLevel: 23, maxLevel: 25, weight: 20 },  // Xatu
      ],
    },
  ],

  route_46: [
    {
      type: 'grass',
      entries: [
        { speciesId: 74, minLevel: 2, maxLevel: 5, weight: 25 },  // Geodude
        { speciesId: 21, minLevel: 2, maxLevel: 5, weight: 25 },  // Spearow
        { speciesId: 19, minLevel: 2, maxLevel: 5, weight: 25 },  // Rattata
        { speciesId: 41, minLevel: 2, maxLevel: 5, weight: 25 },  // Zubat
      ],
    },
  ],

  route_28: [
    {
      type: 'grass',
      entries: [
        { speciesId: 22, minLevel: 39, maxLevel: 42, weight: 15 },   // Fearow
        { speciesId: 101, minLevel: 38, maxLevel: 40, weight: 15 },  // Electrode
        { speciesId: 47, minLevel: 38, maxLevel: 42, weight: 15 },   // Parasect
        { speciesId: 55, minLevel: 38, maxLevel: 42, weight: 15 },   // Golduck
        { speciesId: 57, minLevel: 38, maxLevel: 42, weight: 15 },   // Primeape
        { speciesId: 189, minLevel: 38, maxLevel: 42, weight: 10 },  // Jumpluff
        { speciesId: 30, minLevel: 38, maxLevel: 42, weight: 15 },   // Nidorina
      ],
    },
  ],

  mt_silver: [
    {
      type: 'cave',
      entries: [
        { speciesId: 42, minLevel: 42, maxLevel: 48, weight: 15 },  // Golbat
        { speciesId: 75, minLevel: 42, maxLevel: 48, weight: 10 },  // Graveler
        { speciesId: 67, minLevel: 42, maxLevel: 48, weight: 10 },  // Machoke
        { speciesId: 95, minLevel: 42, maxLevel: 48, weight: 10 },  // Onix
        { speciesId: 208, minLevel: 44, maxLevel: 48, weight: 10 }, // Steelix
        { speciesId: 217, minLevel: 44, maxLevel: 48, weight: 10 }, // Ursaring
        { speciesId: 105, minLevel: 42, maxLevel: 48, weight: 10 }, // Marowak
        { speciesId: 215, minLevel: 42, maxLevel: 48, weight: 15 }, // Sneasel
        { speciesId: 225, minLevel: 42, maxLevel: 48, weight: 10 }, // Delibird
      ],
    },
  ],
};

export function getJohtoEncounters(mapId: string): WildEncounterZone[] {
  return johtoEncounters[mapId] ?? [];
}
