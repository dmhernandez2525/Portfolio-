// ============================================================================
// Ruby/Sapphire - Trainer Definitions
// ============================================================================
// ID convention: plain lowercase for characters unique to this game.
// Characters appearing across games with different roles get a suffix:
//   _e4 = Elite Four member.
// e.g. drake_e4 distinguishes from potential future appearances.

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
      { speciesId: 322, level: 26 }, // Numel
      { speciesId: 218, level: 26 }, // Slugma
      { speciesId: 323, level: 28 }, // Camerupt
      { speciesId: 324, level: 29 }, // Torkoal
    ],
    defeatDialog: ['Oh... I guess I was trying too hard...', 'Take the HEAT BADGE!'],
  },

  norman: {
    id: 'norman', name: 'Norman', class: 'Gym Leader', spriteId: 'norman',
    aiTier: 'expert', reward: 3100, isGymLeader: true, badge: 'balance',
    party: [
      { speciesId: 327, level: 27 }, // Spinda
      { speciesId: 288, level: 27 }, // Vigoroth
      { speciesId: 264, level: 29 }, // Linoone
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
    defeatDialog: ['What?! Our combination was defeated?!', 'Take the MIND BADGE!'],
  },

  wallace: {
    id: 'wallace', name: 'Wallace', class: 'Gym Leader', spriteId: 'wallace',
    aiTier: 'smart', reward: 4600, isGymLeader: true, badge: 'rain',
    party: [
      { speciesId: 370, level: 42 }, // Luvdisc
      { speciesId: 340, level: 42 }, // Whiscash
      { speciesId: 364, level: 43 }, // Sealeo
      { speciesId: 119, level: 44 }, // Seaking
      { speciesId: 350, level: 46 }, // Milotic
    ],
    defeatDialog: ['I realize now your elegance surpasses mine!', 'You are worthy of the RAIN BADGE!'],
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

// --- Gym Trainers ---

export const gymTrainers: Record<string, TrainerDef[]> = {
  rustboro_gym: [
    { id: 'rustboro_gym_1', name: 'Marc', class: 'Youngster', spriteId: 'youngster',
      aiTier: 'basic', reward: 200, isGymLeader: false,
      party: [{ speciesId: 74, level: 12 }, { speciesId: 299, level: 12 }], // Geodude, Nosepass
      defeatDialog: ['My rocks crumbled!'] },
    { id: 'rustboro_gym_2', name: 'Tommy', class: 'Youngster', spriteId: 'youngster',
      aiTier: 'basic', reward: 220, isGymLeader: false,
      party: [{ speciesId: 74, level: 13 }], // Geodude
      defeatDialog: ['That was rock solid!'] },
  ],
  dewford_gym: [
    { id: 'dewford_gym_1', name: 'Takao', class: 'Black Belt', spriteId: 'blackbelt',
      aiTier: 'basic', reward: 320, isGymLeader: false,
      party: [{ speciesId: 66, level: 15 }, { speciesId: 296, level: 15 }], // Machop, Makuhita
      defeatDialog: ['Your technique is sharp!'] },
  ],
  mauville_gym: [
    { id: 'mauville_gym_1', name: 'Kirk', class: 'Guitarist', spriteId: 'guitarist',
      aiTier: 'basic', reward: 460, isGymLeader: false,
      party: [{ speciesId: 309, level: 21 }, { speciesId: 81, level: 21 }], // Electrike, Magnemite
      defeatDialog: ['You rocked me!'] },
    { id: 'mauville_gym_2', name: 'Shawn', class: 'Guitarist', spriteId: 'guitarist',
      aiTier: 'basic', reward: 480, isGymLeader: false,
      party: [{ speciesId: 100, level: 22 }], // Voltorb
      defeatDialog: ['My amp blew out!'] },
  ],
  lavaridge_gym: [
    { id: 'lavaridge_gym_1', name: 'Eli', class: 'Kindler', spriteId: 'kindler',
      aiTier: 'basic', reward: 560, isGymLeader: false,
      party: [{ speciesId: 322, level: 25 }, { speciesId: 218, level: 25 }], // Numel, Slugma
      defeatDialog: ['The heat got to me!'] },
    { id: 'lavaridge_gym_2', name: 'Jeff', class: 'Kindler', spriteId: 'kindler',
      aiTier: 'basic', reward: 580, isGymLeader: false,
      party: [{ speciesId: 77, level: 26 }], // Ponyta
      defeatDialog: ['You cooled me off!'] },
  ],
  petalburg_gym: [
    { id: 'petalburg_gym_1', name: 'Randall', class: 'Cooltrainer', spriteId: 'cooltrainer',
      aiTier: 'basic', reward: 620, isGymLeader: false,
      party: [{ speciesId: 289, level: 28 }], // Slaking
      defeatDialog: ['I slacked off too much!'] },
    { id: 'petalburg_gym_2', name: 'Mary', class: 'Cooltrainer', spriteId: 'cooltrainer_f',
      aiTier: 'basic', reward: 640, isGymLeader: false,
      party: [{ speciesId: 264, level: 28 }, { speciesId: 288, level: 28 }], // Linoone, Vigoroth
      defeatDialog: ['You outpaced me!'] },
  ],
  fortree_gym: [
    { id: 'fortree_gym_1', name: 'Jared', class: 'Bird Keeper', spriteId: 'bird_keeper',
      aiTier: 'basic', reward: 700, isGymLeader: false,
      party: [{ speciesId: 333, level: 31 }, { speciesId: 277, level: 31 }], // Swablu, Swellow
      defeatDialog: ['My birds fell from the sky!'] },
    { id: 'fortree_gym_2', name: 'Ashley', class: 'Bird Keeper', spriteId: 'bird_keeper',
      aiTier: 'basic', reward: 720, isGymLeader: false,
      party: [{ speciesId: 279, level: 32 }], // Pelipper
      defeatDialog: ['The wind shifted!'] },
  ],
  mossdeep_gym: [
    { id: 'mossdeep_gym_1', name: 'Virgil', class: 'Psychic', spriteId: 'psychic',
      aiTier: 'basic', reward: 780, isGymLeader: false,
      party: [{ speciesId: 337, level: 36 }, { speciesId: 338, level: 36 }], // Lunatone, Solrock
      defeatDialog: ['The stars didn\u0027t align!'] },
    { id: 'mossdeep_gym_2', name: 'Hannah', class: 'Psychic', spriteId: 'psychic',
      aiTier: 'basic', reward: 800, isGymLeader: false,
      party: [{ speciesId: 326, level: 37 }], // Grumpig
      defeatDialog: ['My psychic link broke!'] },
    { id: 'mossdeep_gym_3', name: 'Nate', class: 'Psychic', spriteId: 'psychic',
      aiTier: 'smart', reward: 820, isGymLeader: false,
      party: [{ speciesId: 344, level: 38 }], // Claydol
      defeatDialog: ['I couldn\u0027t read your mind!'] },
  ],
  sootopolis_gym: [
    { id: 'sootopolis_gym_1', name: 'Andrea', class: 'Beauty', spriteId: 'beauty',
      aiTier: 'basic', reward: 860, isGymLeader: false,
      party: [{ speciesId: 370, level: 39 }, { speciesId: 119, level: 39 }], // Luvdisc, Seaking
      defeatDialog: ['WALLACE is even more graceful!'] },
    { id: 'sootopolis_gym_2', name: 'Crissy', class: 'Beauty', spriteId: 'beauty',
      aiTier: 'basic', reward: 880, isGymLeader: false,
      party: [{ speciesId: 340, level: 40 }], // Whiscash
      defeatDialog: ['The current swept me away!'] },
    { id: 'sootopolis_gym_3', name: 'Brianna', class: 'Lady', spriteId: 'lady',
      aiTier: 'smart', reward: 900, isGymLeader: false,
      party: [{ speciesId: 121, level: 41 }], // Starmie
      defeatDialog: ['What elegance in battle!'] },
  ],
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
