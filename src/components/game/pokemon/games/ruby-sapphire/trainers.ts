// ============================================================================
// Ruby/Sapphire — Trainer Definitions
// ============================================================================

import type { TrainerDef } from '../../engine/types';

// --- Hoenn Gym Leaders ---

export const gymLeaders: Record<string, TrainerDef> = {
  roxanne: {
    id: 'roxanne', name: 'Roxanne', class: 'Gym Leader', spriteId: 'roxanne',
    aiTier: 'smart', reward: 1500, isGymLeader: true, badge: 'stone',
    party: [
      { speciesId: 74, level: 12 },  // Geodude
      { speciesId: 74, level: 12 },  // Geodude
      { speciesId: 299, level: 15 }, // Nosepass
    ],
    defeatDialog: ['So... I lost...', 'Take this STONE BADGE as proof of your victory!'],
  },

  brawly: {
    id: 'brawly', name: 'Brawly', class: 'Gym Leader', spriteId: 'brawly',
    aiTier: 'smart', reward: 1900, isGymLeader: true, badge: 'knuckle',
    party: [
      { speciesId: 66, level: 16 },  // Machop
      { speciesId: 296, level: 16 }, // Makuhita
      { speciesId: 297, level: 19 }, // Hariyama
    ],
    defeatDialog: ['Whoa, wow! You made a mega impact!', 'Take the KNUCKLE BADGE!'],
  },

  wattson: {
    id: 'wattson', name: 'Wattson', class: 'Gym Leader', spriteId: 'wattson',
    aiTier: 'smart', reward: 2300, isGymLeader: true, badge: 'dynamo',
    party: [
      { speciesId: 100, level: 20 }, // Voltorb
      { speciesId: 309, level: 20 }, // Electrike
      { speciesId: 82, level: 22 },  // Magneton
      { speciesId: 310, level: 24 }, // Manectric
    ],
    defeatDialog: ['Wahahahah! Fine, I lost fair and square!', 'Take the DYNAMO BADGE!'],
  },

  flannery: {
    id: 'flannery', name: 'Flannery', class: 'Gym Leader', spriteId: 'flannery',
    aiTier: 'smart', reward: 2800, isGymLeader: true, badge: 'heat',
    party: [
      { speciesId: 218, level: 24 }, // Slugma
      { speciesId: 218, level: 24 }, // Slugma
      { speciesId: 323, level: 26 }, // Camerupt
      { speciesId: 324, level: 29 }, // Torkoal
    ],
    defeatDialog: ['Oh... I guess I was trying too hard...', 'Take the HEAT BADGE!'],
  },

  norman: {
    id: 'norman', name: 'Norman', class: 'Gym Leader', spriteId: 'norman',
    aiTier: 'expert', reward: 3100, isGymLeader: true, badge: 'balance',
    party: [
      { speciesId: 289, level: 28 }, // Slaking
      { speciesId: 288, level: 30 }, // Vigoroth
      { speciesId: 289, level: 31 }, // Slaking
    ],
    defeatDialog: ['... I... I can\u0027t...', 'You\u0027ve beaten me... Take the BALANCE BADGE.'],
  },

  winona: {
    id: 'winona', name: 'Winona', class: 'Gym Leader', spriteId: 'winona',
    aiTier: 'smart', reward: 3300, isGymLeader: true, badge: 'feather',
    party: [
      { speciesId: 333, level: 29 }, // Swablu
      { speciesId: 277, level: 29 }, // Swellow
      { speciesId: 279, level: 30 }, // Pelipper
      { speciesId: 227, level: 31 }, // Skarmory
      { speciesId: 334, level: 33 }, // Altaria
    ],
    defeatDialog: ['Well done. Take the FEATHER BADGE!'],
  },

  tate_liza: {
    id: 'tate_liza', name: 'Tate & Liza', class: 'Gym Leader', spriteId: 'tate_liza',
    aiTier: 'expert', reward: 4200, isGymLeader: true, badge: 'mind',
    party: [
      { speciesId: 337, level: 42 }, // Lunatone
      { speciesId: 338, level: 42 }, // Solrock
    ],
    defeatDialog: ['What?! Our combination was Pokemon?!', 'Take the MIND BADGE!'],
  },

  juan: {
    id: 'juan', name: 'Juan', class: 'Gym Leader', spriteId: 'juan',
    aiTier: 'expert', reward: 4600, isGymLeader: true, badge: 'rain',
    party: [
      { speciesId: 211, level: 41 }, // Qwilfish (Luvdisc in Emerald)
      { speciesId: 340, level: 41 }, // Whiscash
      { speciesId: 121, level: 43 }, // Starmie (Sealeo)
      { speciesId: 342, level: 43 }, // Crawdaunt
      { speciesId: 230, level: 46 }, // Kingdra
    ],
    defeatDialog: ['Ahahaha, excellente!', 'You are worthy of the RAIN BADGE!'],
  },
};

// --- Elite Four + Champion ---

export const eliteFour: TrainerDef[] = [
  {
    id: 'sidney', name: 'Sidney', class: 'Elite Four', spriteId: 'sidney',
    aiTier: 'expert', reward: 5000, isGymLeader: false,
    party: [
      { speciesId: 262, level: 46 }, // Mightyena
      { speciesId: 275, level: 48 }, // Shiftry
      { speciesId: 332, level: 46 }, // Cacturne
      { speciesId: 342, level: 48 }, // Crawdaunt
      { speciesId: 359, level: 49 }, // Absol
    ],
    defeatDialog: ['Well, how do you like that?', 'I lost! Go on to the next room!'],
  },
  {
    id: 'phoebe', name: 'Phoebe', class: 'Elite Four', spriteId: 'phoebe',
    aiTier: 'expert', reward: 5200, isGymLeader: false,
    party: [
      { speciesId: 356, level: 48 }, // Dusclops
      { speciesId: 354, level: 49 }, // Banette
      { speciesId: 302, level: 50 }, // Sableye
      { speciesId: 354, level: 49 }, // Banette
      { speciesId: 356, level: 51 }, // Dusclops
    ],
    defeatDialog: ['Oh, darn. I\u0027ve gone and lost.', 'Go on ahead!'],
  },
  {
    id: 'glacia', name: 'Glacia', class: 'Elite Four', spriteId: 'glacia',
    aiTier: 'expert', reward: 5400, isGymLeader: false,
    party: [
      { speciesId: 362, level: 50 }, // Glalie
      { speciesId: 364, level: 50 }, // Sealeo
      { speciesId: 364, level: 52 }, // Sealeo
      { speciesId: 362, level: 52 }, // Glalie
      { speciesId: 365, level: 53 }, // Walrein
    ],
    defeatDialog: ['You and your POKeMON...', 'How hot your spirits burn!', 'Go on!'],
  },
  {
    id: 'drake_e4', name: 'Drake', class: 'Elite Four', spriteId: 'drake',
    aiTier: 'expert', reward: 5600, isGymLeader: false,
    party: [
      { speciesId: 371, level: 52 }, // Bagon (Shelgon)
      { speciesId: 334, level: 54 }, // Altaria
      { speciesId: 330, level: 53 }, // Flygon
      { speciesId: 330, level: 53 }, // Flygon
      { speciesId: 373, level: 55 }, // Salamence
    ],
    defeatDialog: ['Superb!', 'You are the new CHAMPION!', 'Or rather, you will be once you...'],
  },
];

export const champion: TrainerDef = {
  id: 'steven', name: 'STEVEN', class: 'Champion', spriteId: 'steven',
  aiTier: 'expert', reward: 8000, isGymLeader: false,
  party: [
    { speciesId: 227, level: 57 }, // Skarmory
    { speciesId: 346, level: 56 }, // Cradily
    { speciesId: 344, level: 56 }, // Claydol
    { speciesId: 348, level: 56 }, // Armaldo
    { speciesId: 306, level: 56 }, // Aggron
    { speciesId: 376, level: 58 }, // Metagross
  ],
  defeatDialog: ['That was time well spent!', 'Congratulations! You are the new CHAMPION!'],
};

// --- Sample route trainers ---

export const routeTrainers: Record<string, TrainerDef[]> = {
  route_102: [
    {
      id: 'youngster_route102', name: 'Calvin', class: 'Youngster', spriteId: 'youngster',
      aiTier: 'basic', reward: 80, isGymLeader: false,
      party: [{ speciesId: 263, level: 5 }], // Zigzagoon
      defeatDialog: ['Wah! I lost!'],
    },
    {
      id: 'bug_catcher_route102', name: 'Rick', class: 'Bug Catcher', spriteId: 'bug_catcher',
      aiTier: 'basic', reward: 48, isGymLeader: false,
      party: [
        { speciesId: 265, level: 4 }, // Wurmple
        { speciesId: 265, level: 4 }, // Wurmple
      ],
      defeatDialog: ['My bugs...'],
    },
  ],
  route_104: [
    {
      id: 'lass_route104', name: 'Haley', class: 'Lass', spriteId: 'lass',
      aiTier: 'basic', reward: 112, isGymLeader: false,
      party: [
        { speciesId: 280, level: 6 }, // Ralts
        { speciesId: 285, level: 6 }, // Shroomish
      ],
      defeatDialog: ['Oh no, I lost!'],
    },
  ],
};
