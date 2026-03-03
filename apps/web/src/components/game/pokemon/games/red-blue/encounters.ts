// ============================================================================
// Red/Blue - Wild Encounter Tables
// ============================================================================

import type { WildEncounterZone, WildEncounterEntry } from '../../engine/types';
import { getTimeOfDay } from '../../engine/time-system';

// Encounter tables per map
export const kantoEncounters: Record<string, WildEncounterZone[]> = {
  route_1: [
    {
      type: 'grass',
      entries: [
        { speciesId: 16, minLevel: 2, maxLevel: 5, weight: 50 },  // Pidgey
        { speciesId: 19, minLevel: 2, maxLevel: 4, weight: 50 },  // Rattata
      ],
    },
  ],

  route_2: [
    {
      type: 'grass',
      entries: [
        { speciesId: 16, minLevel: 3, maxLevel: 5, weight: 40 },  // Pidgey
        { speciesId: 19, minLevel: 3, maxLevel: 5, weight: 30 },  // Rattata
        { speciesId: 10, minLevel: 3, maxLevel: 5, weight: 15 },  // Caterpie
        { speciesId: 13, minLevel: 3, maxLevel: 5, weight: 15 },  // Weedle
      ],
    },
  ],

  viridian_forest: [
    {
      type: 'grass',
      entries: [
        { speciesId: 10, minLevel: 3, maxLevel: 6, weight: 25 },  // Caterpie
        { speciesId: 11, minLevel: 4, maxLevel: 6, weight: 10 },  // Metapod
        { speciesId: 13, minLevel: 3, maxLevel: 6, weight: 25 },  // Weedle
        { speciesId: 14, minLevel: 4, maxLevel: 6, weight: 10 },  // Kakuna
        { speciesId: 25, minLevel: 3, maxLevel: 5, weight: 5 },   // Pikachu (rare)
        { speciesId: 16, minLevel: 4, maxLevel: 6, weight: 25 },  // Pidgey
      ],
    },
  ],

  route_3: [
    {
      type: 'grass',
      entries: [
        { speciesId: 21, minLevel: 6, maxLevel: 8, weight: 30 },  // Spearow
        { speciesId: 16, minLevel: 6, maxLevel: 8, weight: 20 },  // Pidgey
        { speciesId: 39, minLevel: 5, maxLevel: 8, weight: 15 },  // Jigglypuff
        { speciesId: 27, minLevel: 6, maxLevel: 8, weight: 20 },  // Sandshrew
        { speciesId: 32, minLevel: 6, maxLevel: 8, weight: 15 },  // Nidoran M
      ],
    },
  ],

  mt_moon: [
    {
      type: 'cave',
      entries: [
        { speciesId: 41, minLevel: 7, maxLevel: 10, weight: 40 }, // Zubat
        { speciesId: 35, minLevel: 8, maxLevel: 11, weight: 10 }, // Clefairy
        { speciesId: 46, minLevel: 8, maxLevel: 10, weight: 20 }, // Paras
        { speciesId: 74, minLevel: 7, maxLevel: 10, weight: 30 }, // Geodude
      ],
    },
  ],

  route_4: [
    {
      type: 'grass',
      entries: [
        { speciesId: 19, minLevel: 8, maxLevel: 12, weight: 30 }, // Rattata
        { speciesId: 21, minLevel: 8, maxLevel: 12, weight: 30 }, // Spearow
        { speciesId: 23, minLevel: 8, maxLevel: 12, weight: 20 }, // Ekans
        { speciesId: 56, minLevel: 10, maxLevel: 12, weight: 20 },// Mankey
      ],
    },
  ],

  route_24: [
    {
      type: 'grass',
      entries: [
        { speciesId: 10, minLevel: 7, maxLevel: 12, weight: 15 }, // Caterpie
        { speciesId: 13, minLevel: 7, maxLevel: 12, weight: 15 }, // Weedle
        { speciesId: 16, minLevel: 8, maxLevel: 13, weight: 20 }, // Pidgey
        { speciesId: 43, minLevel: 12, maxLevel: 14, weight: 25 },// Oddish
        { speciesId: 63, minLevel: 7, maxLevel: 11, weight: 25 }, // Abra
      ],
    },
  ],

  route_6: [
    {
      type: 'grass',
      entries: [
        { speciesId: 16, minLevel: 13, maxLevel: 17, weight: 25 }, // Pidgey
        { speciesId: 43, minLevel: 13, maxLevel: 17, weight: 25 }, // Oddish
        { speciesId: 56, minLevel: 13, maxLevel: 17, weight: 25 }, // Mankey
        { speciesId: 52, minLevel: 13, maxLevel: 17, weight: 25 }, // Meowth
      ],
    },
  ],

  route_5: [
    {
      type: 'grass',
      entries: [
        { speciesId: 43, minLevel: 13, maxLevel: 16, weight: 25 }, // Oddish
        { speciesId: 52, minLevel: 13, maxLevel: 16, weight: 25 }, // Meowth
        { speciesId: 16, minLevel: 13, maxLevel: 16, weight: 25 }, // Pidgey
        { speciesId: 56, minLevel: 13, maxLevel: 16, weight: 25 }, // Mankey
      ],
    },
  ],

  route_7: [
    {
      type: 'grass',
      entries: [
        { speciesId: 16, minLevel: 17, maxLevel: 22, weight: 20 }, // Pidgey
        { speciesId: 37, minLevel: 17, maxLevel: 20, weight: 20 }, // Vulpix
        { speciesId: 43, minLevel: 17, maxLevel: 22, weight: 20 }, // Oddish
        { speciesId: 52, minLevel: 17, maxLevel: 22, weight: 20 }, // Meowth
        { speciesId: 58, minLevel: 17, maxLevel: 20, weight: 20 }, // Growlithe
      ],
    },
  ],

  route_9: [
    {
      type: 'grass',
      entries: [
        { speciesId: 19, minLevel: 15, maxLevel: 18, weight: 20 }, // Rattata
        { speciesId: 21, minLevel: 15, maxLevel: 18, weight: 25 }, // Spearow
        { speciesId: 23, minLevel: 14, maxLevel: 17, weight: 20 }, // Ekans
        { speciesId: 29, minLevel: 11, maxLevel: 17, weight: 15 }, // Nidoran F
        { speciesId: 32, minLevel: 11, maxLevel: 17, weight: 20 }, // Nidoran M
      ],
    },
  ],

  route_10: [
    {
      type: 'grass',
      entries: [
        { speciesId: 100, minLevel: 14, maxLevel: 17, weight: 20 }, // Voltorb
        { speciesId: 21, minLevel: 13, maxLevel: 17, weight: 25 },  // Spearow
        { speciesId: 23, minLevel: 11, maxLevel: 17, weight: 20 },  // Ekans
        { speciesId: 81, minLevel: 16, maxLevel: 17, weight: 15 },  // Magnemite
        { speciesId: 29, minLevel: 13, maxLevel: 17, weight: 20 },  // Nidoran F
      ],
    },
  ],

  rock_tunnel: [
    {
      type: 'cave',
      entries: [
        { speciesId: 41, minLevel: 15, maxLevel: 18, weight: 30 }, // Zubat
        { speciesId: 74, minLevel: 15, maxLevel: 17, weight: 25 }, // Geodude
        { speciesId: 66, minLevel: 15, maxLevel: 18, weight: 25 }, // Machop
        { speciesId: 95, minLevel: 13, maxLevel: 17, weight: 20 }, // Onix
      ],
    },
  ],

  route_8: [
    {
      type: 'grass',
      entries: [
        { speciesId: 37, minLevel: 18, maxLevel: 22, weight: 20 }, // Vulpix
        { speciesId: 58, minLevel: 18, maxLevel: 22, weight: 20 }, // Growlithe
        { speciesId: 52, minLevel: 18, maxLevel: 22, weight: 20 }, // Meowth
        { speciesId: 77, minLevel: 18, maxLevel: 22, weight: 20 }, // Ponyta
        { speciesId: 96, minLevel: 20, maxLevel: 22, weight: 20 }, // Drowzee
      ],
    },
  ],

  route_11: [
    {
      type: 'grass',
      entries: [
        { speciesId: 23, minLevel: 13, maxLevel: 17, weight: 20 }, // Ekans
        { speciesId: 96, minLevel: 15, maxLevel: 18, weight: 20 }, // Drowzee
        { speciesId: 21, minLevel: 13, maxLevel: 17, weight: 20 }, // Spearow
        { speciesId: 19, minLevel: 13, maxLevel: 17, weight: 20 }, // Rattata
        { speciesId: 56, minLevel: 15, maxLevel: 18, weight: 20 }, // Mankey
      ],
    },
  ],

  route_12: [
    {
      type: 'grass',
      entries: [
        { speciesId: 43, minLevel: 22, maxLevel: 26, weight: 25 }, // Oddish
        { speciesId: 44, minLevel: 24, maxLevel: 26, weight: 10 }, // Gloom
        { speciesId: 69, minLevel: 22, maxLevel: 26, weight: 25 }, // Bellsprout
        { speciesId: 16, minLevel: 23, maxLevel: 27, weight: 20 }, // Pidgey
        { speciesId: 48, minLevel: 24, maxLevel: 26, weight: 20 }, // Venonat
      ],
    },
  ],

  route_13: [
    {
      type: 'grass',
      entries: [
        { speciesId: 43, minLevel: 22, maxLevel: 26, weight: 20 }, // Oddish
        { speciesId: 69, minLevel: 22, maxLevel: 26, weight: 20 }, // Bellsprout
        { speciesId: 16, minLevel: 25, maxLevel: 27, weight: 15 }, // Pidgey
        { speciesId: 17, minLevel: 27, maxLevel: 29, weight: 10 }, // Pidgeotto
        { speciesId: 48, minLevel: 24, maxLevel: 26, weight: 20 }, // Venonat
        { speciesId: 132, minLevel: 25, maxLevel: 25, weight: 15 }, // Ditto
      ],
    },
  ],

  route_14: [
    {
      type: 'grass',
      entries: [
        { speciesId: 43, minLevel: 23, maxLevel: 26, weight: 20 }, // Oddish
        { speciesId: 69, minLevel: 23, maxLevel: 26, weight: 20 }, // Bellsprout
        { speciesId: 48, minLevel: 24, maxLevel: 27, weight: 20 }, // Venonat
        { speciesId: 132, minLevel: 23, maxLevel: 23, weight: 15 }, // Ditto
        { speciesId: 17, minLevel: 28, maxLevel: 30, weight: 10 }, // Pidgeotto
        { speciesId: 44, minLevel: 26, maxLevel: 28, weight: 15 }, // Gloom
      ],
    },
  ],

  route_15: [
    {
      type: 'grass',
      entries: [
        { speciesId: 43, minLevel: 23, maxLevel: 26, weight: 20 }, // Oddish
        { speciesId: 69, minLevel: 23, maxLevel: 26, weight: 20 }, // Bellsprout
        { speciesId: 48, minLevel: 26, maxLevel: 28, weight: 20 }, // Venonat
        { speciesId: 132, minLevel: 23, maxLevel: 23, weight: 15 }, // Ditto
        { speciesId: 17, minLevel: 28, maxLevel: 30, weight: 10 }, // Pidgeotto
        { speciesId: 44, minLevel: 26, maxLevel: 28, weight: 15 }, // Gloom
      ],
    },
  ],

  route_16: [
    {
      type: 'grass',
      entries: [
        { speciesId: 19, minLevel: 18, maxLevel: 22, weight: 20 }, // Rattata
        { speciesId: 20, minLevel: 22, maxLevel: 25, weight: 15 }, // Raticate
        { speciesId: 21, minLevel: 20, maxLevel: 22, weight: 20 }, // Spearow
        { speciesId: 84, minLevel: 22, maxLevel: 26, weight: 20 }, // Doduo
        { speciesId: 143, minLevel: 30, maxLevel: 30, weight: 5 },  // Snorlax (rare)
        { speciesId: 56, minLevel: 20, maxLevel: 24, weight: 20 }, // Mankey
      ],
    },
  ],

  route_17: [
    {
      type: 'grass',
      entries: [
        { speciesId: 21, minLevel: 20, maxLevel: 25, weight: 25 }, // Spearow
        { speciesId: 22, minLevel: 25, maxLevel: 29, weight: 10 }, // Fearow
        { speciesId: 19, minLevel: 20, maxLevel: 25, weight: 20 }, // Rattata
        { speciesId: 20, minLevel: 25, maxLevel: 29, weight: 10 }, // Raticate
        { speciesId: 84, minLevel: 24, maxLevel: 28, weight: 20 }, // Doduo
        { speciesId: 85, minLevel: 26, maxLevel: 29, weight: 15 }, // Dodrio
      ],
    },
  ],

  route_18: [
    {
      type: 'grass',
      entries: [
        { speciesId: 21, minLevel: 20, maxLevel: 25, weight: 25 }, // Spearow
        { speciesId: 22, minLevel: 25, maxLevel: 29, weight: 15 }, // Fearow
        { speciesId: 84, minLevel: 24, maxLevel: 28, weight: 20 }, // Doduo
        { speciesId: 85, minLevel: 26, maxLevel: 29, weight: 10 }, // Dodrio
        { speciesId: 20, minLevel: 25, maxLevel: 29, weight: 15 }, // Raticate
        { speciesId: 19, minLevel: 20, maxLevel: 25, weight: 15 }, // Rattata
      ],
    },
  ],

  route_22: [
    {
      type: 'grass',
      entries: [
        { speciesId: 19, minLevel: 2, maxLevel: 5, weight: 25 },  // Rattata
        { speciesId: 21, minLevel: 3, maxLevel: 5, weight: 25 },  // Spearow
        { speciesId: 29, minLevel: 3, maxLevel: 5, weight: 15 },  // Nidoran F
        { speciesId: 32, minLevel: 3, maxLevel: 5, weight: 15 },  // Nidoran M
        { speciesId: 56, minLevel: 3, maxLevel: 5, weight: 20 },  // Mankey
      ],
    },
  ],

  route_23: [
    {
      type: 'grass',
      entries: [
        { speciesId: 21, minLevel: 26, maxLevel: 32, weight: 15 }, // Spearow
        { speciesId: 22, minLevel: 34, maxLevel: 38, weight: 10 }, // Fearow
        { speciesId: 23, minLevel: 26, maxLevel: 32, weight: 15 }, // Ekans
        { speciesId: 24, minLevel: 32, maxLevel: 36, weight: 10 }, // Arbok
        { speciesId: 56, minLevel: 26, maxLevel: 32, weight: 15 }, // Mankey
        { speciesId: 132, minLevel: 26, maxLevel: 26, weight: 15 }, // Ditto
        { speciesId: 30, minLevel: 30, maxLevel: 34, weight: 10 }, // Nidorina
        { speciesId: 33, minLevel: 30, maxLevel: 34, weight: 10 }, // Nidorino
      ],
    },
  ],

  route_25: [
    {
      type: 'grass',
      entries: [
        { speciesId: 10, minLevel: 8, maxLevel: 12, weight: 15 }, // Caterpie
        { speciesId: 13, minLevel: 8, maxLevel: 12, weight: 15 }, // Weedle
        { speciesId: 43, minLevel: 12, maxLevel: 14, weight: 20 }, // Oddish
        { speciesId: 63, minLevel: 8, maxLevel: 12, weight: 20 }, // Abra
        { speciesId: 16, minLevel: 8, maxLevel: 14, weight: 15 }, // Pidgey
        { speciesId: 69, minLevel: 12, maxLevel: 14, weight: 15 }, // Bellsprout
      ],
    },
  ],

  safari_zone: [
    {
      type: 'grass',
      entries: [
        { speciesId: 29, minLevel: 22, maxLevel: 30, weight: 15 }, // Nidoran F
        { speciesId: 30, minLevel: 26, maxLevel: 33, weight: 10 }, // Nidorina
        { speciesId: 111, minLevel: 25, maxLevel: 29, weight: 15 },// Rhyhorn
        { speciesId: 113, minLevel: 26, maxLevel: 28, weight: 5 }, // Chansey
        { speciesId: 115, minLevel: 25, maxLevel: 28, weight: 10 },// Kangaskhan
        { speciesId: 123, minLevel: 25, maxLevel: 28, weight: 10 },// Scyther
        { speciesId: 127, minLevel: 25, maxLevel: 28, weight: 10 },// Pinsir
        { speciesId: 128, minLevel: 25, maxLevel: 28, weight: 10 },// Tauros
        { speciesId: 102, minLevel: 24, maxLevel: 27, weight: 15 },// Exeggcute
      ],
    },
  ],

  victory_road: [
    {
      type: 'cave',
      entries: [
        { speciesId: 66, minLevel: 36, maxLevel: 42, weight: 15 }, // Machop
        { speciesId: 67, minLevel: 38, maxLevel: 42, weight: 10 }, // Machoke
        { speciesId: 74, minLevel: 36, maxLevel: 42, weight: 15 }, // Geodude
        { speciesId: 75, minLevel: 40, maxLevel: 44, weight: 10 }, // Graveler
        { speciesId: 41, minLevel: 36, maxLevel: 42, weight: 20 }, // Zubat
        { speciesId: 42, minLevel: 40, maxLevel: 44, weight: 10 }, // Golbat
        { speciesId: 95, minLevel: 36, maxLevel: 42, weight: 10 }, // Onix
        { speciesId: 105, minLevel: 40, maxLevel: 44, weight: 10 },// Marowak
      ],
    },
  ],

  cerulean_cave: [
    {
      type: 'cave',
      entries: [
        { speciesId: 42, minLevel: 46, maxLevel: 55, weight: 15 }, // Golbat
        { speciesId: 64, minLevel: 46, maxLevel: 55, weight: 10 }, // Kadabra
        { speciesId: 82, minLevel: 46, maxLevel: 55, weight: 10 }, // Magneton
        { speciesId: 101, minLevel: 46, maxLevel: 55, weight: 10 },// Electrode
        { speciesId: 132, minLevel: 46, maxLevel: 55, weight: 15 },// Ditto
        { speciesId: 47, minLevel: 49, maxLevel: 55, weight: 10 }, // Parasect
        { speciesId: 57, minLevel: 49, maxLevel: 55, weight: 10 }, // Primeape
        { speciesId: 112, minLevel: 49, maxLevel: 55, weight: 10 },// Rhydon
        { speciesId: 97, minLevel: 49, maxLevel: 55, weight: 10 }, // Hypno
      ],
    },
  ],
};

// Helper to get encounters for a map
export function getEncounters(mapId: string): WildEncounterZone[] {
  return kantoEncounters[mapId] ?? [];
}

// Pick a random wild Pokemon from encounter table
export function rollWildEncounter(
  zones: WildEncounterZone[],
  encounterType: 'grass' | 'surf' | 'fishing' | 'cave' = 'grass'
): { speciesId: number; level: number } | null {
  const zone = zones.find(z => z.type === encounterType);
  if (!zone || zone.entries.length === 0) return null;

  // Filter entries by time of day (entries without timeOfDay are always available)
  const timeOfDay = getTimeOfDay();
  const entries = zone.entries.filter(e => !e.timeOfDay || e.timeOfDay === timeOfDay);
  if (entries.length === 0) return null;

  const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) {
      return rollLevel(entry);
    }
  }

  return rollLevel(entries[entries.length - 1]);
}

function rollLevel(entry: WildEncounterEntry): { speciesId: number; level: number } {
  const level = entry.minLevel + Math.floor(
    Math.random() * (entry.maxLevel - entry.minLevel + 1)
  );
  return { speciesId: entry.speciesId, level };
}
