// ============================================================================
// Red/Blue — Trainer Definitions
// ============================================================================

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
