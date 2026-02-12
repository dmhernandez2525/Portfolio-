// ============================================================================
// Pokemon RPG Engine - Post-Game Content
// ============================================================================
// Legendary encounters, post-game unlocks, and Battle Tower definitions.

import type { TrainerDef, NPCDef, WildEncounterZone } from './types';

// --- Legendary Static Encounters ---
// These are NPCs placed on maps that trigger a battle with a legendary Pokemon
// when interacted with. They disappear after being defeated (via story flag).

export interface StaticEncounter {
  id: string;
  speciesId: number;
  level: number;
  mapId: string;
  requiredFlag: string;
  defeatedFlag: string;
  npc: NPCDef;
}

// Kanto legendaries
export const kantoLegendaries: StaticEncounter[] = [
  {
    id: 'mewtwo',
    speciesId: 150,
    level: 70,
    mapId: 'cerulean_cave_b1f',
    requiredFlag: 'defeated_champion',
    defeatedFlag: 'caught_mewtwo',
    npc: {
      id: 'mewtwo_static',
      x: 7, y: 3,
      direction: 'down',
      dialog: ['A powerful psychic presence...', 'MEWTWO appeared!'],
      spriteId: 'legendary',
    },
  },
  {
    id: 'articuno',
    speciesId: 144,
    level: 50,
    mapId: 'seafoam_islands_b4f',
    requiredFlag: 'defeated_champion',
    defeatedFlag: 'caught_articuno',
    npc: {
      id: 'articuno_static',
      x: 5, y: 4,
      direction: 'down',
      dialog: ['A majestic icy bird...', 'ARTICUNO appeared!'],
      spriteId: 'legendary',
    },
  },
  {
    id: 'zapdos',
    speciesId: 145,
    level: 50,
    mapId: 'power_plant',
    requiredFlag: 'defeated_champion',
    defeatedFlag: 'caught_zapdos',
    npc: {
      id: 'zapdos_static',
      x: 8, y: 2,
      direction: 'down',
      dialog: ['Electric energy crackles in the air...', 'ZAPDOS appeared!'],
      spriteId: 'legendary',
    },
  },
  {
    id: 'moltres',
    speciesId: 146,
    level: 50,
    mapId: 'victory_road_3f',
    requiredFlag: 'defeated_champion',
    defeatedFlag: 'caught_moltres',
    npc: {
      id: 'moltres_static',
      x: 6, y: 5,
      direction: 'down',
      dialog: ['Intense heat radiates from within...', 'MOLTRES appeared!'],
      spriteId: 'legendary',
    },
  },
];

// Hoenn legendaries
export const hoennLegendaries: StaticEncounter[] = [
  {
    id: 'groudon',
    speciesId: 383,
    level: 45,
    mapId: 'terra_cave',
    requiredFlag: 'defeated_champion_rs',
    defeatedFlag: 'caught_groudon',
    npc: {
      id: 'groudon_static',
      x: 5, y: 3,
      direction: 'down',
      dialog: ['The ground trembles violently...', 'GROUDON appeared!'],
      spriteId: 'legendary',
    },
  },
  {
    id: 'kyogre',
    speciesId: 382,
    level: 45,
    mapId: 'marine_cave',
    requiredFlag: 'defeated_champion_rs',
    defeatedFlag: 'caught_kyogre',
    npc: {
      id: 'kyogre_static',
      x: 5, y: 3,
      direction: 'down',
      dialog: ['A massive wave of energy surges...', 'KYOGRE appeared!'],
      spriteId: 'legendary',
    },
  },
  {
    id: 'rayquaza',
    speciesId: 384,
    level: 70,
    mapId: 'sky_pillar_roof',
    requiredFlag: 'defeated_champion_rs',
    defeatedFlag: 'caught_rayquaza',
    npc: {
      id: 'rayquaza_static',
      x: 5, y: 2,
      direction: 'down',
      dialog: ['An immense dragon descends from the clouds...', 'RAYQUAZA appeared!'],
      spriteId: 'legendary',
    },
  },
];

// --- Red Battle (Johto Post-Game) ---

export const redBattle: TrainerDef = {
  id: 'red_mt_silver',
  name: 'RED',
  class: 'Pokemon Master',
  spriteId: 'red',
  isGymLeader: false,
  aiTier: 'expert',
  reward: 20000,
  defeatDialog: ['...', 'RED descended from Mt. Silver.'],
  party: [
    { speciesId: 25,  level: 81, moves: ['thunderbolt', 'volt-tackle', 'iron-tail', 'quick-attack'] },    // Pikachu
    { speciesId: 196, level: 73, moves: ['psychic', 'shadow-ball', 'calm-mind', 'morning-sun'] },          // Espeon
    { speciesId: 143, level: 75, moves: ['body-slam', 'earthquake', 'rest', 'sleep-talk'] },               // Snorlax
    { speciesId: 3,   level: 77, moves: ['solar-beam', 'sludge-bomb', 'sleep-powder', 'synthesis'] },      // Venusaur
    { speciesId: 6,   level: 77, moves: ['flamethrower', 'dragon-claw', 'air-slash', 'blast-burn'] },      // Charizard
    { speciesId: 9,   level: 77, moves: ['surf', 'ice-beam', 'rain-dance', 'hydro-cannon'] },              // Blastoise
  ],
};

// --- Battle Tower (Hoenn Post-Game) ---

export interface BattleTowerTrainer {
  name: string;
  class: string;
  party: Array<{ speciesId: number; level: number; moves?: string[] }>;
}

export const battleTowerTrainers: BattleTowerTrainer[] = [
  {
    name: 'MARCUS',
    class: 'Cooltrainer',
    party: [
      { speciesId: 248, level: 50 },  // Tyranitar
      { speciesId: 130, level: 50 },  // Gyarados
      { speciesId: 65,  level: 50 },  // Alakazam
    ],
  },
  {
    name: 'ELENA',
    class: 'Ace Trainer',
    party: [
      { speciesId: 282, level: 50 },  // Gardevoir
      { speciesId: 376, level: 50 },  // Metagross
      { speciesId: 373, level: 50 },  // Salamence
    ],
  },
  {
    name: 'KENT',
    class: 'Expert',
    party: [
      { speciesId: 306, level: 50 },  // Aggron
      { speciesId: 359, level: 50 },  // Absol
      { speciesId: 330, level: 50 },  // Flygon
    ],
  },
  {
    name: 'JADE',
    class: 'Dragon Tamer',
    party: [
      { speciesId: 334, level: 50 },  // Altaria
      { speciesId: 373, level: 50 },  // Salamence
      { speciesId: 149, level: 50 },  // Dragonite
    ],
  },
  {
    name: 'ROSS',
    class: 'Battle Veteran',
    party: [
      { speciesId: 289, level: 50 },  // Slaking
      { speciesId: 68,  level: 50 },  // Machamp
      { speciesId: 344, level: 50 },  // Claydol
    ],
  },
];

// Cerulean Cave encounter table (post-game dungeon)
export const ceruleanCaveEncounters: WildEncounterZone[] = [
  {
    type: 'cave',
    entries: [
      { speciesId: 42,  minLevel: 46, maxLevel: 50, weight: 20 },  // Golbat
      { speciesId: 64,  minLevel: 46, maxLevel: 48, weight: 15 },  // Kadabra
      { speciesId: 82,  minLevel: 46, maxLevel: 48, weight: 10 },  // Magneton
      { speciesId: 132, minLevel: 46, maxLevel: 50, weight: 15 },  // Ditto
      { speciesId: 101, minLevel: 46, maxLevel: 48, weight: 10 },  // Electrode
      { speciesId: 55,  minLevel: 48, maxLevel: 52, weight: 10 },  // Golduck
      { speciesId: 57,  minLevel: 48, maxLevel: 52, weight: 10 },  // Primeape
      { speciesId: 112, minLevel: 48, maxLevel: 52, weight: 10 },  // Rhydon
    ],
  },
];

// Kanto post-game encounters for Johto (level-scaled)
export const kantoPostgameEncounters: Record<string, WildEncounterZone[]> = {
  route_1_postgame: [
    {
      type: 'grass',
      entries: [
        { speciesId: 16, minLevel: 28, maxLevel: 32, weight: 50 },  // Pidgey
        { speciesId: 19, minLevel: 28, maxLevel: 32, weight: 50 },  // Rattata
      ],
    },
  ],
  route_2_postgame: [
    {
      type: 'grass',
      entries: [
        { speciesId: 16, minLevel: 30, maxLevel: 34, weight: 40 },  // Pidgey
        { speciesId: 19, minLevel: 30, maxLevel: 34, weight: 30 },  // Rattata
        { speciesId: 10, minLevel: 30, maxLevel: 34, weight: 15 },  // Caterpie
        { speciesId: 13, minLevel: 30, maxLevel: 34, weight: 15 },  // Weedle
      ],
    },
  ],
};
