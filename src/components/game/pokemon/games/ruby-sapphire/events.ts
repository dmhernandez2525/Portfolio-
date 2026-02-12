// ============================================================================
// Ruby/Sapphire - Story Events & Cutscenes
// ============================================================================

import type { StoryEvent } from '../../engine/story-events';
import { getActiveEvents as filterEvents } from '../../engine/story-events';

export type { StoryEvent };

export const storyEvents: StoryEvent[] = [
  // --- Opening ---
  {
    id: 'birch_rescue',
    trigger: 'map_enter',
    mapId: 'route_101',
    blockedByFlags: ['got_starter'],
    dialog: [
      'BIRCH: H-help me!',
      'In my bag! There\u0027s a POKeBall!',
      'Use it to save me!',
    ],
    starterSelection: true,
    setsFlags: ['got_starter'],
  },

  // --- Birch's Lab ---
  {
    id: 'birch_lab_intro',
    trigger: 'map_enter',
    mapId: 'birchs_lab',
    requiredFlags: ['got_starter'],
    blockedByFlags: ['birch_lab_done'],
    dialog: [
      'BIRCH: Thanks for saving me!',
      'You have talent as a POKeMON TRAINER!',
      'I have a request for you.',
      'I\u0027d like you to go see my son/daughter.',
      'They\u0027re on ROUTE 103.',
    ],
    setsFlags: ['birch_lab_done'],
  },

  // --- Rival battle 1 ---
  {
    id: 'rival_battle_1_rs',
    trigger: 'map_enter',
    mapId: 'route_103',
    requiredFlags: ['birch_lab_done'],
    blockedByFlags: ['rival_1_done_rs'],
    dialog: [
      'MAY/BRENDAN: Oh, hi!',
      'I heard from my dad that you got',
      'a POKeMON. Let\u0027s battle!',
    ],
    battle: { trainerId: 'rival_1_rs' },
    setsFlags: ['rival_1_done_rs'],
  },

  // --- Team Magma/Aqua encounter ---
  {
    id: 'team_magma_petalburg_woods',
    trigger: 'map_enter',
    mapId: 'petalburg_woods',
    requiredFlags: ['got_starter'],
    blockedByFlags: ['saved_researcher'],
    dialog: [
      'TEAM MAGMA GRUNT: Hey! Buzz off!',
      'We\u0027re conducting important research!',
    ],
    battle: { trainerId: 'magma_grunt_1' },
    setsFlags: ['saved_researcher'],
  },

  // --- Gym hints ---
  {
    id: 'rustboro_gym_hint',
    trigger: 'interact',
    npcId: 'rustboro_guide',
    blockedByFlags: ['badge_stone'],
    dialog: [
      'The GYM LEADER here is ROXANNE.',
      'She\u0027s a bit bookish but strong!',
      'WATER and GRASS moves are super',
      'effective against ROCK!',
    ],
  },

  // --- Weather trio ---
  {
    id: 'groudon_encounter',
    trigger: 'map_enter',
    mapId: 'cave_of_origin',
    requiredFlags: ['badge_rain', 'magma_hideout_clear'],
    blockedByFlags: ['caught_groudon'],
    dialog: [
      'The ground trembles...',
      'GROUDON has awakened!',
      'The intense sunlight burns!',
    ],
  },

  // --- Champion victory ---
  {
    id: 'champion_victory_rs',
    trigger: 'flag_check',
    requiredFlags: ['defeated_champion_rs'],
    dialog: [
      'STEVEN: I, the CHAMPION, fall in defeat...',
      'Congratulations! You\u0027re the new CHAMPION!',
      'Your POKeMON team will be recorded',
      'in the HALL OF FAME!',
    ],
    setsFlags: ['hall_of_fame_rs'],
  },

  // --- Post-Game: Legendary Encounters ---
  {
    id: 'groudon_static_encounter',
    trigger: 'interact',
    npcId: 'groudon_static',
    requiredFlags: ['defeated_champion_rs'],
    blockedByFlags: ['caught_groudon'],
    dialog: ['The ground trembles violently...', 'GROUDON appeared!'],
    givesPokemon: { speciesId: 383, level: 45 },
    setsFlags: ['caught_groudon'],
  },
  {
    id: 'kyogre_encounter',
    trigger: 'interact',
    npcId: 'kyogre_static',
    requiredFlags: ['defeated_champion_rs'],
    blockedByFlags: ['caught_kyogre'],
    dialog: ['A massive wave of energy surges...', 'KYOGRE appeared!'],
    givesPokemon: { speciesId: 382, level: 45 },
    setsFlags: ['caught_kyogre'],
  },
  {
    id: 'rayquaza_encounter',
    trigger: 'interact',
    npcId: 'rayquaza_static',
    requiredFlags: ['defeated_champion_rs'],
    blockedByFlags: ['caught_rayquaza'],
    dialog: ['An immense dragon descends from the clouds...', 'RAYQUAZA appeared!'],
    givesPokemon: { speciesId: 384, level: 70 },
    setsFlags: ['caught_rayquaza'],
  },

  // --- Post-Game: Battle Tower ---
  {
    id: 'battle_tower_open',
    trigger: 'map_enter',
    mapId: 'battle_tower',
    requiredFlags: ['defeated_champion_rs'],
    blockedByFlags: [],
    dialog: [
      'Welcome to the BATTLE TOWER!',
      'Challenge trainers in consecutive battles!',
      'Your POKeMON will be set to Level 50.',
    ],
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
