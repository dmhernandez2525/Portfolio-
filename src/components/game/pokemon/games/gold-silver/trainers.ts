// ============================================================================
// Gold/Silver - Trainer Definitions
// ============================================================================

import type { TrainerDef } from '../../engine/types';

// --- Johto Gym Leaders ---

export const gymLeaders: Record<string, TrainerDef> = {
  falkner: {
    id: 'falkner', name: 'Falkner', class: 'Gym Leader', spriteId: 'falkner',
    aiTier: 'smart', reward: 900, isGymLeader: true, badge: 'zephyr',
    party: [
      { speciesId: 16, level: 7 },   // Pidgey
      { speciesId: 17, level: 9 },   // Pidgeotto
    ],
    defeatDialog: ['...I see.', 'Here, take the ZEPHYR BADGE!'],
  },

  bugsy: {
    id: 'bugsy', name: 'Bugsy', class: 'Gym Leader', spriteId: 'bugsy',
    aiTier: 'smart', reward: 1440, isGymLeader: true, badge: 'hive',
    party: [
      { speciesId: 11, level: 14 },  // Metapod
      { speciesId: 14, level: 14 },  // Kakuna
      { speciesId: 123, level: 16 }, // Scyther
    ],
    defeatDialog: ['Whoa, amazing!', 'You\'re an expert on POKeMON! Take the HIVE BADGE!'],
  },

  whitney: {
    id: 'whitney', name: 'Whitney', class: 'Gym Leader', spriteId: 'whitney',
    aiTier: 'smart', reward: 2000, isGymLeader: true, badge: 'plain',
    party: [
      { speciesId: 35, level: 18 },  // Clefairy
      { speciesId: 241, level: 20 }, // Miltank
    ],
    defeatDialog: ['Sniff... You meanie!', '...Fine, take the PLAIN BADGE.'],
  },

  morty: {
    id: 'morty', name: 'Morty', class: 'Gym Leader', spriteId: 'morty',
    aiTier: 'smart', reward: 2300, isGymLeader: true, badge: 'fog',
    party: [
      { speciesId: 92, level: 21 },  // Gastly
      { speciesId: 93, level: 21 },  // Haunter
      { speciesId: 93, level: 23 },  // Haunter
      { speciesId: 94, level: 25 },  // Gengar
    ],
    defeatDialog: ['I see... Your bond with your POKeMON is strong.', 'Take the FOG BADGE!'],
  },

  chuck: {
    id: 'chuck', name: 'Chuck', class: 'Gym Leader', spriteId: 'chuck',
    aiTier: 'smart', reward: 2700, isGymLeader: true, badge: 'storm',
    party: [
      { speciesId: 57, level: 27 },  // Primeape
      { speciesId: 62, level: 30 },  // Poliwrath
    ],
    defeatDialog: ['Wahahah! You beat me!', 'Here, take the STORM BADGE!'],
  },

  jasmine: {
    id: 'jasmine', name: 'Jasmine', class: 'Gym Leader', spriteId: 'jasmine',
    aiTier: 'smart', reward: 3500, isGymLeader: true, badge: 'mineral',
    party: [
      { speciesId: 81, level: 30 },  // Magnemite
      { speciesId: 81, level: 30 },  // Magnemite
      { speciesId: 208, level: 35 }, // Steelix
    ],
    defeatDialog: ['...You are strong.', 'Please take the MINERAL BADGE.'],
  },

  pryce: {
    id: 'pryce', name: 'Pryce', class: 'Gym Leader', spriteId: 'pryce',
    aiTier: 'smart', reward: 3100, isGymLeader: true, badge: 'glacier',
    party: [
      { speciesId: 86, level: 27 },  // Seel
      { speciesId: 87, level: 29 },  // Dewgong
      { speciesId: 221, level: 31 }, // Piloswine
    ],
    defeatDialog: ['Ah, I am impressed!', 'Take the GLACIER BADGE!'],
  },

  clair: {
    id: 'clair', name: 'Clair', class: 'Gym Leader', spriteId: 'clair',
    aiTier: 'expert', reward: 3960, isGymLeader: true, badge: 'rising',
    party: [
      { speciesId: 147, level: 37 }, // Dratini
      { speciesId: 147, level: 37 }, // Dratini
      { speciesId: 148, level: 37 }, // Dragonair
      { speciesId: 230, level: 40 }, // Kingdra
    ],
    defeatDialog: ['I lost?! I don\'t believe it!', '...Fine. Take the RISING BADGE.'],
  },
};

// --- Elite Four + Champion ---

export const eliteFour: TrainerDef[] = [
  {
    id: 'will', name: 'Will', class: 'Elite Four', spriteId: 'will',
    aiTier: 'expert', reward: 4000, isGymLeader: false,
    party: [
      { speciesId: 178, level: 40 }, // Xatu
      { speciesId: 124, level: 41 }, // Jynx
      { speciesId: 103, level: 41 }, // Exeggutor
      { speciesId: 80, level: 41 },  // Slowbro
      { speciesId: 178, level: 42 }, // Xatu
    ],
    defeatDialog: ['I... I can\'t believe it!', 'Even my future sight was not enough!'],
  },
  {
    id: 'koga_e4', name: 'Koga', class: 'Elite Four', spriteId: 'koga',
    aiTier: 'expert', reward: 4200, isGymLeader: false,
    party: [
      { speciesId: 168, level: 40 }, // Ariados
      { speciesId: 49, level: 41 },  // Venomoth
      { speciesId: 205, level: 43 }, // Forretress
      { speciesId: 89, level: 42 },  // Muk
      { speciesId: 169, level: 44 }, // Crobat
    ],
    defeatDialog: ['Hmm! You have proven your worth!'],
  },
  {
    id: 'bruno_e4', name: 'Bruno', class: 'Elite Four', spriteId: 'bruno',
    aiTier: 'expert', reward: 4400, isGymLeader: false,
    party: [
      { speciesId: 106, level: 42 }, // Hitmonlee
      { speciesId: 107, level: 42 }, // Hitmonchan
      { speciesId: 95, level: 43 },  // Onix
      { speciesId: 237, level: 43 }, // Hitmontop
      { speciesId: 68, level: 46 },  // Machamp
    ],
    defeatDialog: ['Having lost, I have no right to say anything.', 'Go face your next challenge!'],
  },
  {
    id: 'karen', name: 'Karen', class: 'Elite Four', spriteId: 'karen',
    aiTier: 'expert', reward: 4600, isGymLeader: false,
    party: [
      { speciesId: 197, level: 42 }, // Umbreon
      { speciesId: 45, level: 42 },  // Vileplume
      { speciesId: 94, level: 45 },  // Gengar
      { speciesId: 198, level: 44 }, // Murkrow
      { speciesId: 229, level: 47 }, // Houndoom
    ],
    defeatDialog: ['Strong POKeMON. Weak POKeMON.', 'That is only the selfish perception of people.', 'You are truly skilled.'],
  },
];

export const champion: TrainerDef = {
  id: 'lance_champion', name: 'LANCE', class: 'Champion', spriteId: 'lance',
  aiTier: 'expert', reward: 7200, isGymLeader: false,
  party: [
    { speciesId: 130, level: 44 }, // Gyarados
    { speciesId: 148, level: 47 }, // Dragonair
    { speciesId: 148, level: 47 }, // Dragonair
    { speciesId: 142, level: 46 }, // Aerodactyl
    { speciesId: 6, level: 46 },   // Charizard
    { speciesId: 149, level: 50 }, // Dragonite
  ],
  defeatDialog: ['...It\'s over.', 'You are the new POKeMON LEAGUE CHAMPION!'],
};

// --- Gym Trainers ---

export const gymTrainers: Record<string, TrainerDef[]> = {
  violet_gym: [
    { id: 'violet_gym_1', name: 'Rod', class: 'Bird Keeper', spriteId: 'bird_keeper',
      aiTier: 'basic', reward: 160, isGymLeader: false,
      party: [{ speciesId: 21, level: 7 }, { speciesId: 16, level: 7 }], // Spearow, Pidgey
      defeatDialog: ['My birds fell!'] },
  ],
  azalea_gym: [
    { id: 'azalea_gym_1', name: 'Al', class: 'Bug Catcher', spriteId: 'bug_catcher',
      aiTier: 'basic', reward: 240, isGymLeader: false,
      party: [{ speciesId: 10, level: 12 }, { speciesId: 13, level: 12 }], // Caterpie, Weedle
      defeatDialog: ['My bugs!'] },
    { id: 'azalea_gym_2', name: 'Josh', class: 'Bug Catcher', spriteId: 'bug_catcher',
      aiTier: 'basic', reward: 260, isGymLeader: false,
      party: [{ speciesId: 167, level: 13 }], // Spinarak
      defeatDialog: ['Ugh, my web fell apart!'] },
  ],
  goldenrod_gym: [
    { id: 'goldenrod_gym_1', name: 'Samantha', class: 'Lass', spriteId: 'lass',
      aiTier: 'basic', reward: 440, isGymLeader: false,
      party: [{ speciesId: 35, level: 18 }, { speciesId: 39, level: 18 }], // Clefairy, Jigglypuff
      defeatDialog: ['Oh no, I lost!'] },
    { id: 'goldenrod_gym_2', name: 'Cathy', class: 'Beauty', spriteId: 'beauty',
      aiTier: 'basic', reward: 460, isGymLeader: false,
      party: [{ speciesId: 209, level: 19 }], // Snubbull
      defeatDialog: ['That was rough!'] },
  ],
  ecruteak_gym: [
    { id: 'ecruteak_gym_1', name: 'Jeffrey', class: 'Medium', spriteId: 'medium',
      aiTier: 'basic', reward: 560, isGymLeader: false,
      party: [{ speciesId: 92, level: 22 }, { speciesId: 93, level: 22 }], // Gastly, Haunter
      defeatDialog: ['The spirits have abandoned me!'] },
    { id: 'ecruteak_gym_2', name: 'Martha', class: 'Medium', spriteId: 'medium',
      aiTier: 'basic', reward: 580, isGymLeader: false,
      party: [{ speciesId: 92, level: 23 }], // Gastly
      defeatDialog: ['Noo, my Gastly!'] },
  ],
  olivine_gym: [
    { id: 'olivine_gym_1', name: 'Connie', class: 'Lass', spriteId: 'lass',
      aiTier: 'basic', reward: 640, isGymLeader: false,
      party: [{ speciesId: 81, level: 28 }], // Magnemite
      defeatDialog: ['JASMINE will avenge me!'] },
  ],
  cianwood_gym: [
    { id: 'cianwood_gym_1', name: 'Yoshi', class: 'Black Belt', spriteId: 'blackbelt',
      aiTier: 'basic', reward: 660, isGymLeader: false,
      party: [{ speciesId: 66, level: 27 }, { speciesId: 57, level: 27 }], // Machop, Primeape
      defeatDialog: ['Your fighting spirit is strong!'] },
    { id: 'cianwood_gym_2', name: 'Lao', class: 'Black Belt', spriteId: 'blackbelt',
      aiTier: 'basic', reward: 680, isGymLeader: false,
      party: [{ speciesId: 236, level: 28 }], // Tyrogue
      defeatDialog: ['What a punch!'] },
  ],
  mahogany_gym: [
    { id: 'mahogany_gym_1', name: 'Zach', class: 'Skier', spriteId: 'skier',
      aiTier: 'basic', reward: 720, isGymLeader: false,
      party: [{ speciesId: 220, level: 30 }, { speciesId: 86, level: 30 }], // Swinub, Seel
      defeatDialog: ['Brrr, I\u0027m frozen!'] },
    { id: 'mahogany_gym_2', name: 'Douglas', class: 'Boarder', spriteId: 'boarder',
      aiTier: 'basic', reward: 740, isGymLeader: false,
      party: [{ speciesId: 87, level: 31 }], // Dewgong
      defeatDialog: ['The ice cracked under me!'] },
  ],
  blackthorn_gym: [
    { id: 'blackthorn_gym_1', name: 'Paul', class: 'Cooltrainer', spriteId: 'cooltrainer',
      aiTier: 'smart', reward: 800, isGymLeader: false,
      party: [{ speciesId: 148, level: 34 }, { speciesId: 117, level: 34 }], // Dragonair, Seadra
      defeatDialog: ['Dragon tamers are rare...'] },
    { id: 'blackthorn_gym_2', name: 'Fran', class: 'Cooltrainer', spriteId: 'cooltrainer_f',
      aiTier: 'smart', reward: 820, isGymLeader: false,
      party: [{ speciesId: 148, level: 35 }], // Dragonair
      defeatDialog: ['CLAIR is even stronger!'] },
    { id: 'blackthorn_gym_3', name: 'Mike', class: 'Dragon Tamer', spriteId: 'dragon_tamer',
      aiTier: 'smart', reward: 840, isGymLeader: false,
      party: [{ speciesId: 147, level: 33 }, { speciesId: 147, level: 33 }], // Dratini x2
      defeatDialog: ['My dragons fell!'] },
  ],
};

// --- Sample route trainers ---

export const routeTrainers: Record<string, TrainerDef[]> = {
  route_29: [
    {
      id: 'youngster_route29', name: 'Joey', class: 'Youngster', spriteId: 'youngster',
      aiTier: 'basic', reward: 64, isGymLeader: false,
      party: [
        { speciesId: 19, level: 4 }, // Rattata
      ],
      defeatDialog: ['My RATTATA is in the top percentage!', 'But you still beat it...'],
    },
  ],
  route_30: [
    {
      id: 'youngster_route30', name: 'Mikey', class: 'Youngster', spriteId: 'youngster',
      aiTier: 'basic', reward: 96, isGymLeader: false,
      party: [
        { speciesId: 16, level: 4 }, // Pidgey
        { speciesId: 19, level: 6 }, // Rattata
      ],
      defeatDialog: ['You\'re pretty tough!'],
    },
  ],
  route_32: [
    {
      id: 'fisher_route32', name: 'Ralph', class: 'Fisher', spriteId: 'fisher',
      aiTier: 'basic', reward: 216, isGymLeader: false,
      party: [
        { speciesId: 118, level: 10 }, // Goldeen
        { speciesId: 60, level: 10 },  // Poliwag
      ],
      defeatDialog: ['Wow, you beat my water POKeMON!'],
    },
  ],
};
