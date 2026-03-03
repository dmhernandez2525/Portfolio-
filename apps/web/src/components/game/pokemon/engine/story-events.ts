// ============================================================================
// Pokemon RPG Engine - Shared Story Event Types & Utilities
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

export function getActiveEvents(
  events: StoryEvent[],
  trigger: StoryEvent['trigger'],
  flags: Record<string, boolean>,
  mapId?: string,
  npcId?: string,
): StoryEvent[] {
  return events.filter(event => {
    if (event.trigger !== trigger) return false;
    if (event.mapId && event.mapId !== mapId) return false;
    if (event.npcId && event.npcId !== npcId) return false;
    if (event.requiredFlags?.some(f => !flags[f])) return false;
    if (event.blockedByFlags?.some(f => flags[f])) return false;
    return true;
  });
}
