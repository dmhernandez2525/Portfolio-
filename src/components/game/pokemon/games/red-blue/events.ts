// ============================================================================
// Red/Blue - Story Events & Cutscenes
// ============================================================================

import type { StoryEvent } from '../../engine/story-events';
import { getActiveEvents as filterEvents } from '../../engine/story-events';

export type { StoryEvent };

export const storyEvents: StoryEvent[] = [
  // --- Opening sequence ---
  {
    id: 'oak_intro',
    trigger: 'map_enter',
    mapId: 'pallet_town',
    blockedByFlags: ['got_starter'],
    dialog: [
      'OAK: Hello there! Welcome to the',
      'world of POKeMON!',
      'My name is OAK! People call me',
      'the POKeMON PROF!',
      'This world is inhabited by creatures',
      'called POKeMON!',
      'For some people, POKeMON are pets.',
      'Others use them for fights.',
      'Myself... I study POKeMON as a',
      'profession.',
      'First, tell me about yourself.',
    ],
    setsFlags: ['intro_complete'],
  },

  // --- Starter selection ---
  {
    id: 'oak_lab_starters',
    trigger: 'map_enter',
    mapId: 'oaks_lab',
    requiredFlags: ['intro_complete'],
    blockedByFlags: ['got_starter'],
    dialog: [
      'OAK: Ah, you\'re here!',
      'There are 3 POKeMON on the table.',
      'They are for you and your rival.',
      'Go ahead, choose one!',
    ],
    starterSelection: true,
    setsFlags: ['got_starter'],
  },

  // --- Rival battle at Route 22 ---
  {
    id: 'rival_battle_1',
    trigger: 'map_enter',
    mapId: 'route_22',
    requiredFlags: ['got_starter'],
    blockedByFlags: ['rival_battle_1_done'],
    dialog: [
      'BLUE: Hey! Wait up!',
      'Let me see how tough you are!',
    ],
    battle: { trainerId: 'rival_1' },
    setsFlags: ['rival_battle_1_done'],
  },

  // --- Brock rematch gate ---
  {
    id: 'pewter_gym_hint',
    trigger: 'interact',
    npcId: 'pewter_guide',
    blockedByFlags: ['badge_boulder'],
    dialog: [
      'You should challenge BROCK!',
      'He\'s the GYM LEADER here.',
      'His POKeMON are all ROCK type.',
      'WATER and GRASS moves work great!',
    ],
  },

  // --- SS Anne ticket ---
  {
    id: 'bill_gives_ticket',
    trigger: 'interact',
    npcId: 'bill',
    requiredFlags: ['bill_transformed_back'],
    blockedByFlags: ['has_ss_ticket'],
    dialog: [
      'BILL: Thanks for helping me out!',
      'Here, take this as thanks!',
      'Obtained SS TICKET!',
    ],
    givesItem: { itemId: 'ss_ticket', quantity: 1 },
    setsFlags: ['has_ss_ticket'],
  },

  // --- Legendary bird hints ---
  {
    id: 'power_plant_hint',
    trigger: 'interact',
    npcId: 'power_plant_scientist',
    dialog: [
      'They say a legendary bird POKeMON',
      'roosts in the abandoned POWER PLANT.',
      'It controls ELECTRICITY!',
    ],
  },

  // --- Champion victory ---
  {
    id: 'champion_victory',
    trigger: 'flag_check',
    requiredFlags: ['defeated_champion'],
    dialog: [
      'OAK: Congratulations!',
      'You are the new POKeMON CHAMPION!',
      'Your POKeMON team is recorded in',
      'the HALL OF FAME!',
    ],
    setsFlags: ['hall_of_fame'],
  },
  // --- Post-Game: Cerulean Cave Unlock ---
  {
    id: 'cerulean_cave_open',
    trigger: 'map_enter',
    mapId: 'cerulean_city',
    requiredFlags: ['defeated_champion'],
    blockedByFlags: ['cerulean_cave_noticed'],
    dialog: [
      'The guard blocking Cerulean Cave has left!',
      'A mysterious Pokemon is said to lurk within...',
    ],
    setsFlags: ['cerulean_cave_noticed'],
  },

  // --- Legendary encounters ---
  {
    id: 'mewtwo_encounter',
    trigger: 'interact',
    npcId: 'mewtwo_static',
    requiredFlags: ['defeated_champion'],
    blockedByFlags: ['caught_mewtwo'],
    dialog: ['A powerful psychic presence...', 'MEWTWO appeared!'],
    givesPokemon: { speciesId: 150, level: 70 },
    setsFlags: ['caught_mewtwo'],
  },
  {
    id: 'articuno_encounter',
    trigger: 'interact',
    npcId: 'articuno_static',
    requiredFlags: ['defeated_champion'],
    blockedByFlags: ['caught_articuno'],
    dialog: ['A majestic icy bird...', 'ARTICUNO appeared!'],
    givesPokemon: { speciesId: 144, level: 50 },
    setsFlags: ['caught_articuno'],
  },
  {
    id: 'zapdos_encounter',
    trigger: 'interact',
    npcId: 'zapdos_static',
    requiredFlags: ['defeated_champion'],
    blockedByFlags: ['caught_zapdos'],
    dialog: ['Electric energy crackles in the air...', 'ZAPDOS appeared!'],
    givesPokemon: { speciesId: 145, level: 50 },
    setsFlags: ['caught_zapdos'],
  },
  {
    id: 'moltres_encounter',
    trigger: 'interact',
    npcId: 'moltres_static',
    requiredFlags: ['defeated_champion'],
    blockedByFlags: ['caught_moltres'],
    dialog: ['Intense heat radiates from within...', 'MOLTRES appeared!'],
    givesPokemon: { speciesId: 146, level: 50 },
    setsFlags: ['caught_moltres'],
  },
];

export function getActiveEvents(
  trigger: StoryEvent['trigger'],
  flags: Record<string, boolean>,
  mapId?: string,
  npcId?: string,
): StoryEvent[] {
  return filterEvents(storyEvents, trigger, flags, mapId, npcId);
}
