// ============================================================================
// Red/Blue - Trainer Definitions
// ============================================================================
// ID convention: plain lowercase for characters unique to this game.
// Characters appearing across games with different roles get a suffix:
//   _e4 = Elite Four member, _champion = Champion.
// e.g. lance (E4 here) vs lance_champion (Champion in Gold/Silver).

import type { TrainerDef } from '../../engine/types';

// --- Gym Leaders ---

export const gymLeaders: Record<string, TrainerDef> = {
  brock: {
    id: 'brock', name: 'Brock', class: 'Gym Leader', spriteId: 'brock',
    aiTier: 'smart', reward: 1386, isGymLeader: true, badge: 'boulder',
    party: [
      { speciesId: 74, level: 12 },  // Geodude
      { speciesId: 95, level: 14 },  // Onix
    ],
    defeatDialog: ['I took you for granted.', "As proof of your victory, here's the BOULDER BADGE!"],
  },

  misty: {
    id: 'misty', name: 'Misty', class: 'Gym Leader', spriteId: 'misty',
    aiTier: 'smart', reward: 2100, isGymLeader: true, badge: 'cascade',
    party: [
      { speciesId: 120, level: 18 }, // Staryu
      { speciesId: 121, level: 21 }, // Starmie
    ],
    defeatDialog: ['Wow! You\'re too much!', 'Here, take the CASCADE BADGE!'],
  },

  lt_surge: {
    id: 'lt_surge', name: 'Lt. Surge', class: 'Gym Leader', spriteId: 'surge',
    aiTier: 'smart', reward: 2520, isGymLeader: true, badge: 'thunder',
    party: [
      { speciesId: 100, level: 21 }, // Voltorb
      { speciesId: 25, level: 18 },  // Pikachu
      { speciesId: 26, level: 24 },  // Raichu
    ],
    defeatDialog: ['Whoa! You beat me!', 'Take the THUNDER BADGE!'],
  },

  erika: {
    id: 'erika', name: 'Erika', class: 'Gym Leader', spriteId: 'erika',
    aiTier: 'smart', reward: 2871, isGymLeader: true, badge: 'rainbow',
    party: [
      { speciesId: 71, level: 29 },  // Victreebel
      { speciesId: 114, level: 24 }, // Tangela
      { speciesId: 45, level: 29 },  // Vileplume
    ],
    defeatDialog: ['Oh! I concede defeat.', 'Take this RAINBOW BADGE.'],
  },

  koga: {
    id: 'koga', name: 'Koga', class: 'Gym Leader', spriteId: 'koga',
    aiTier: 'smart', reward: 4257, isGymLeader: true, badge: 'soul',
    party: [
      { speciesId: 109, level: 37 }, // Koffing
      { speciesId: 89, level: 39 },  // Muk
      { speciesId: 109, level: 37 }, // Koffing
      { speciesId: 110, level: 43 }, // Weezing
    ],
    defeatDialog: ['Humph! You have proven your worth!', 'Here! Take the SOUL BADGE!'],
  },

  sabrina: {
    id: 'sabrina', name: 'Sabrina', class: 'Gym Leader', spriteId: 'sabrina',
    aiTier: 'expert', reward: 4257, isGymLeader: true, badge: 'marsh',
    party: [
      { speciesId: 64, level: 38 },  // Kadabra
      { speciesId: 122, level: 37 }, // Mr. Mime
      { speciesId: 49, level: 38 },  // Venomoth
      { speciesId: 65, level: 43 },  // Alakazam
    ],
    defeatDialog: ['I\'m shocked! But a loss is a loss.', 'I admit you are skilled. Take MARSH BADGE!'],
  },

  blaine: {
    id: 'blaine', name: 'Blaine', class: 'Gym Leader', spriteId: 'blaine',
    aiTier: 'smart', reward: 4653, isGymLeader: true, badge: 'volcano',
    party: [
      { speciesId: 58, level: 42 },  // Growlithe
      { speciesId: 77, level: 40 },  // Ponyta
      { speciesId: 78, level: 42 },  // Rapidash
      { speciesId: 59, level: 47 },  // Arcanine
    ],
    defeatDialog: ['I\'ve burned out!', 'Take the VOLCANO BADGE!'],
  },

  giovanni: {
    id: 'giovanni', name: 'Giovanni', class: 'Gym Leader', spriteId: 'giovanni',
    aiTier: 'expert', reward: 5049, isGymLeader: true, badge: 'earth',
    party: [
      { speciesId: 111, level: 45 }, // Rhyhorn
      { speciesId: 51, level: 42 },  // Dugtrio
      { speciesId: 31, level: 44 },  // Nidoqueen
      { speciesId: 34, level: 45 },  // Nidoking
      { speciesId: 112, level: 50 }, // Rhydon
    ],
    defeatDialog: ['Ha! That was a truly intense fight!', 'You deserve the EARTH BADGE!'],
  },
};

// --- Elite Four + Champion ---

export const eliteFour: TrainerDef[] = [
  {
    id: 'lorelei', name: 'Lorelei', class: 'Elite Four', spriteId: 'lorelei',
    aiTier: 'expert', reward: 5940, isGymLeader: false,
    party: [
      { speciesId: 87, level: 54 },  // Dewgong
      { speciesId: 91, level: 53 },  // Cloyster
      { speciesId: 80, level: 54 },  // Slowbro
      { speciesId: 124, level: 56 }, // Jynx
      { speciesId: 131, level: 56 }, // Lapras
    ],
    defeatDialog: ['You\'re better than I thought.', 'Go on ahead. You only got lucky.'],
  },
  {
    id: 'bruno', name: 'Bruno', class: 'Elite Four', spriteId: 'bruno',
    aiTier: 'expert', reward: 5940, isGymLeader: false,
    party: [
      { speciesId: 95, level: 53 },  // Onix
      { speciesId: 107, level: 55 }, // Hitmonchan
      { speciesId: 106, level: 55 }, // Hitmonlee
      { speciesId: 95, level: 56 },  // Onix
      { speciesId: 68, level: 58 },  // Machamp
    ],
    defeatDialog: ['My fighting Pokemon lost?', 'You are indeed worthy of the POKeMON LEAGUE!'],
  },
  {
    id: 'agatha', name: 'Agatha', class: 'Elite Four', spriteId: 'agatha',
    aiTier: 'expert', reward: 5940, isGymLeader: false,
    party: [
      { speciesId: 94, level: 56 },  // Gengar
      { speciesId: 42, level: 56 },  // Golbat
      { speciesId: 93, level: 55 },  // Haunter
      { speciesId: 24, level: 58 },  // Arbok
      { speciesId: 94, level: 60 },  // Gengar
    ],
    defeatDialog: ['Oh ho! You\'re something special!', 'I have nothing else to say. Run along!'],
  },
  {
    id: 'lance', name: 'Lance', class: 'Elite Four', spriteId: 'lance',
    aiTier: 'expert', reward: 5940, isGymLeader: false,
    party: [
      { speciesId: 130, level: 58 }, // Gyarados
      { speciesId: 148, level: 56 }, // Dragonair
      { speciesId: 148, level: 56 }, // Dragonair
      { speciesId: 142, level: 60 }, // Aerodactyl
      { speciesId: 149, level: 62 }, // Dragonite
    ],
    defeatDialog: ['That\'s it!', 'I hate to admit it, but you are a POKeMON master!'],
  },
];

export const champion: TrainerDef = {
  id: 'blue', name: 'BLUE', class: 'Champion', spriteId: 'rival',
  aiTier: 'expert', reward: 6930, isGymLeader: false,
  party: [
    { speciesId: 18, level: 61 },  // Pidgeot
    { speciesId: 65, level: 59 },  // Alakazam
    { speciesId: 112, level: 61 }, // Rhydon
    { speciesId: 130, level: 61 }, // Gyarados
    { speciesId: 59, level: 63 },  // Arcanine
    { speciesId: 3, level: 65 },   // Venusaur
  ],
  defeatDialog: ['NO! That can\'t be!', 'You are the new CHAMPION!'],
};

// --- Gym Trainers ---

export const gymTrainers: Record<string, TrainerDef[]> = {
  pewter_gym: [
    { id: 'pewter_gym_1', name: 'Liam', class: 'Jr. Trainer', spriteId: 'youngster',
      aiTier: 'basic', reward: 200, isGymLeader: false,
      party: [{ speciesId: 74, level: 11 }, { speciesId: 27, level: 10 }], // Geodude, Sandshrew
      defeatDialog: ['You beat me!'] },
  ],
  cerulean_gym: [
    { id: 'cerulean_gym_1', name: 'Diana', class: 'Swimmer', spriteId: 'swimmer_f',
      aiTier: 'basic', reward: 340, isGymLeader: false,
      party: [{ speciesId: 118, level: 16 }, { speciesId: 54, level: 16 }], // Goldeen, Psyduck
      defeatDialog: ['You\u0027re too strong!'] },
    { id: 'cerulean_gym_2', name: 'Parker', class: 'Swimmer', spriteId: 'swimmer',
      aiTier: 'basic', reward: 360, isGymLeader: false,
      party: [{ speciesId: 116, level: 17 }, { speciesId: 90, level: 17 }], // Horsea, Shellder
      defeatDialog: ['I got washed away!'] },
  ],
  vermilion_gym: [
    { id: 'vermilion_gym_1', name: 'Gordon', class: 'Sailor', spriteId: 'sailor',
      aiTier: 'basic', reward: 500, isGymLeader: false,
      party: [{ speciesId: 100, level: 21 }, { speciesId: 81, level: 21 }], // Voltorb, Magnemite
      defeatDialog: ['Shocking defeat!'] },
    { id: 'vermilion_gym_2', name: 'Buzz', class: 'Engineer', spriteId: 'engineer',
      aiTier: 'basic', reward: 520, isGymLeader: false,
      party: [{ speciesId: 25, level: 22 }], // Pikachu
      defeatDialog: ['I got zapped instead!'] },
  ],
  celadon_gym: [
    { id: 'celadon_gym_1', name: 'Tamia', class: 'Lass', spriteId: 'lass',
      aiTier: 'basic', reward: 560, isGymLeader: false,
      party: [{ speciesId: 43, level: 26 }, { speciesId: 70, level: 26 }], // Oddish, Weepinbell
      defeatDialog: ['Oh no, my flowers!'] },
    { id: 'celadon_gym_2', name: 'Bridget', class: 'Beauty', spriteId: 'beauty',
      aiTier: 'basic', reward: 580, isGymLeader: false,
      party: [{ speciesId: 114, level: 27 }], // Tangela
      defeatDialog: ['That was thorny!'] },
    { id: 'celadon_gym_3', name: 'Lisa', class: 'Jr. Trainer', spriteId: 'lass',
      aiTier: 'basic', reward: 600, isGymLeader: false,
      party: [{ speciesId: 2, level: 28 }], // Ivysaur
      defeatDialog: ['You overpowered me!'] },
  ],
  fuchsia_gym: [
    { id: 'fuchsia_gym_1', name: 'Nob', class: 'Juggler', spriteId: 'juggler',
      aiTier: 'basic', reward: 680, isGymLeader: false,
      party: [{ speciesId: 109, level: 34 }, { speciesId: 88, level: 34 }], // Koffing, Grimer
      defeatDialog: ['My poison tricks failed!'] },
    { id: 'fuchsia_gym_2', name: 'Aya', class: 'Tamer', spriteId: 'tamer',
      aiTier: 'basic', reward: 700, isGymLeader: false,
      party: [{ speciesId: 24, level: 35 }, { speciesId: 49, level: 35 }], // Arbok, Venomoth
      defeatDialog: ['Impressive technique!'] },
  ],
  saffron_gym: [
    { id: 'saffron_gym_1', name: 'Johan', class: 'Psychic', spriteId: 'psychic',
      aiTier: 'basic', reward: 760, isGymLeader: false,
      party: [{ speciesId: 64, level: 36 }, { speciesId: 122, level: 36 }], // Kadabra, Mr. Mime
      defeatDialog: ['I didn\u0027t foresee this!'] },
    { id: 'saffron_gym_2', name: 'Tyron', class: 'Psychic', spriteId: 'psychic',
      aiTier: 'basic', reward: 780, isGymLeader: false,
      party: [{ speciesId: 97, level: 37 }], // Hypno
      defeatDialog: ['My mind control failed!'] },
    { id: 'saffron_gym_3', name: 'Marcel', class: 'Channeler', spriteId: 'channeler',
      aiTier: 'basic', reward: 800, isGymLeader: false,
      party: [{ speciesId: 124, level: 38 }], // Jynx
      defeatDialog: ['The spirits are upset!'] },
  ],
  cinnabar_gym: [
    { id: 'cinnabar_gym_1', name: 'Erik', class: 'Super Nerd', spriteId: 'nerd',
      aiTier: 'basic', reward: 840, isGymLeader: false,
      party: [{ speciesId: 126, level: 40 }, { speciesId: 77, level: 40 }], // Magmar, Ponyta
      defeatDialog: ['Too hot to handle!'] },
    { id: 'cinnabar_gym_2', name: 'Avery', class: 'Burglar', spriteId: 'burglar',
      aiTier: 'basic', reward: 860, isGymLeader: false,
      party: [{ speciesId: 38, level: 41 }], // Ninetales
      defeatDialog: ['I got burned!'] },
  ],
  viridian_gym: [
    { id: 'viridian_gym_1', name: 'Yuji', class: 'Black Belt', spriteId: 'blackbelt',
      aiTier: 'basic', reward: 920, isGymLeader: false,
      party: [{ speciesId: 111, level: 42 }, { speciesId: 105, level: 42 }], // Rhyhorn, Marowak
      defeatDialog: ['Your technique is flawless!'] },
    { id: 'viridian_gym_2', name: 'Warren', class: 'Tamer', spriteId: 'tamer',
      aiTier: 'basic', reward: 940, isGymLeader: false,
      party: [{ speciesId: 28, level: 43 }, { speciesId: 51, level: 43 }], // Sandslash, Dugtrio
      defeatDialog: ['The ground shook under me!'] },
    { id: 'viridian_gym_3', name: 'Cole', class: 'Cooltrainer', spriteId: 'cooltrainer',
      aiTier: 'smart', reward: 960, isGymLeader: false,
      party: [{ speciesId: 34, level: 44 }], // Nidoking
      defeatDialog: ['GIOVANNI will avenge me!'] },
  ],
};

// --- Route trainers (sampling) ---

export const routeTrainers: Record<string, TrainerDef[]> = {
  route_3: [
    {
      id: 'bug_catcher_route3_1', name: 'Rick', class: 'Bug Catcher', spriteId: 'bug_catcher',
      aiTier: 'basic', reward: 60, isGymLeader: false,
      party: [
        { speciesId: 13, level: 6 },  // Weedle
        { speciesId: 10, level: 6 },  // Caterpie
      ],
      defeatDialog: ['My bugs lost!'],
    },
    {
      id: 'lass_route3_1', name: 'Janice', class: 'Lass', spriteId: 'lass',
      aiTier: 'basic', reward: 140, isGymLeader: false,
      party: [
        { speciesId: 16, level: 9 },  // Pidgey
        { speciesId: 16, level: 9 },  // Pidgey
      ],
      defeatDialog: ['Oh, you\'re pretty good!'],
    },
  ],
  route_24: [
    {
      id: 'rival_route24', name: 'BLUE', class: 'Rival', spriteId: 'rival',
      aiTier: 'smart', reward: 350, isGymLeader: false,
      party: [
        { speciesId: 16, level: 17 }, // Pidgey
        { speciesId: 63, level: 16 }, // Abra
        { speciesId: 19, level: 15 }, // Rattata
        { speciesId: 8, level: 18 },  // Wartortle
      ],
      defeatDialog: ['What? I lost?!', 'Gramps always did like you better!'],
    },
  ],
};
