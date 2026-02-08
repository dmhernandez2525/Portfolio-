// ============================================================================
// Gold/Silver — Story Events & Cutscenes
// ============================================================================

export interface StoryEvent {
  id: string;
  trigger: 'map_enter' | 'interact' | 'flag_check';
  mapId?: string;
  npcId?: string;
  requiredFlags?: string[];
  blockedByFlags?: string[];
  dialog: string[];
  setsFlags?: string[];
  givesItem?: { itemId: string; quantity: number };
  givesPokemon?: { speciesId: number; level: number };
  starterSelection?: boolean;
  battle?: { trainerId: string };
}

export const storyEvents: StoryEvent[] = [
  // --- Opening ---
  {
    id: 'elm_intro',
    trigger: 'map_enter',
    mapId: 'new_bark_town',
    blockedByFlags: ['got_starter'],
    dialog: [
      'ELM: Oh, there you are!',
      'I have a task for you.',
      'I need you to visit MR. POKeMON.',
      'He lives on ROUTE 30.',
      'But first, pick a POKeMON!',
      'Come to my lab!',
    ],
    setsFlags: ['elm_intro_done'],
  },

  // --- Starter selection ---
  {
    id: 'elm_lab_starters',
    trigger: 'map_enter',
    mapId: 'elms_lab',
    requiredFlags: ['elm_intro_done'],
    blockedByFlags: ['got_starter'],
    dialog: [
      'ELM: Go ahead, choose one!',
      'There are three POKeMON.',
      'CHIKORITA, the leaf POKeMON.',
      'CYNDAQUIL, the fire POKeMON.',
      'TOTODILE, the water POKeMON.',
    ],
    starterSelection: true,
    setsFlags: ['got_starter'],
  },

  // --- Rival encounter ---
  {
    id: 'rival_battle_1',
    trigger: 'map_enter',
    mapId: 'cherrygrove_city',
    requiredFlags: ['got_starter', 'visited_mr_pokemon'],
    blockedByFlags: ['rival_1_done'],
    dialog: [
      '???: Hey, you!',
      'You got a POKeMON at the LAB.',
      'I\u0027m going to show you that',
      'I\u0027m better than you!',
    ],
    battle: { trainerId: 'rival_1' },
    setsFlags: ['rival_1_done'],
  },

  // --- Mr. Pokemon ---
  {
    id: 'mr_pokemon_visit',
    trigger: 'interact',
    npcId: 'mr_pokemon',
    requiredFlags: ['got_starter'],
    blockedByFlags: ['visited_mr_pokemon'],
    dialog: [
      'MR. POKeMON: Oh, you must be',
      'from ELM\u0027s lab!',
      'I found this EGG!',
      'Please take it to PROF. ELM.',
      'Obtained MYSTERY EGG!',
    ],
    givesItem: { itemId: 'mystery_egg', quantity: 1 },
    setsFlags: ['visited_mr_pokemon'],
  },

  // --- Badge hints ---
  {
    id: 'violet_gym_hint',
    trigger: 'interact',
    npcId: 'violet_guide',
    blockedByFlags: ['badge_zephyr'],
    dialog: [
      'The GYM LEADER here is FALKNER.',
      'He uses FLYING type POKeMON.',
      'ELECTRIC or ROCK moves are key!',
    ],
  },

  // --- Red at Mt. Silver ---
  {
    id: 'red_battle',
    trigger: 'map_enter',
    mapId: 'mt_silver_summit',
    requiredFlags: ['all_16_badges'],
    blockedByFlags: ['defeated_red'],
    dialog: [
      '...',
      'RED: ...',
    ],
    battle: { trainerId: 'red' },
    setsFlags: ['defeated_red'],
  },

  // --- Champion victory ---
  {
    id: 'champion_victory_gs',
    trigger: 'flag_check',
    requiredFlags: ['defeated_champion_gs'],
    dialog: [
      'LANCE: Congratulations!',
      'You are the new POKeMON CHAMPION!',
      'Your victory will be recorded',
      'in the HALL OF FAME!',
    ],
    setsFlags: ['hall_of_fame_gs'],
  },
];

export function getActiveEvents(
  trigger: StoryEvent['trigger'],
  flags: Record<string, boolean>,
  mapId?: string,
  npcId?: string,
): StoryEvent[] {
  return storyEvents.filter(event => {
    if (event.trigger !== trigger) return false;
    if (event.mapId && event.mapId !== mapId) return false;
    if (event.npcId && event.npcId !== npcId) return false;
    if (event.requiredFlags?.some(f => !flags[f])) return false;
    if (event.blockedByFlags?.some(f => flags[f])) return false;
    return true;
  });
}
