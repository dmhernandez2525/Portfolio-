// Story Events - Unit Tests
// Tests for getActiveEvents filtering logic.

import { describe, it, expect } from 'vitest';
import { getActiveEvents, type StoryEvent } from '../story-events';

// -- Helpers --

function makeEvent(overrides: Partial<StoryEvent> = {}): StoryEvent {
  return {
    id: overrides.id ?? 'evt-default',
    trigger: overrides.trigger ?? 'map_enter',
    dialog: overrides.dialog ?? ['Hello!'],
    ...overrides,
  };
}

// -- Tests --

describe('getActiveEvents', () => {
  it('filters by trigger type correctly', () => {
    const events: StoryEvent[] = [
      makeEvent({ id: 'a', trigger: 'map_enter' }),
      makeEvent({ id: 'b', trigger: 'interact' }),
      makeEvent({ id: 'c', trigger: 'flag_check' }),
    ];

    const result = getActiveEvents(events, 'interact', {});
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('b');
  });

  it('filters by mapId when event has mapId set', () => {
    const events: StoryEvent[] = [
      makeEvent({ id: 'a', trigger: 'map_enter', mapId: 'pallet_town' }),
      makeEvent({ id: 'b', trigger: 'map_enter', mapId: 'viridian_city' }),
    ];

    const result = getActiveEvents(events, 'map_enter', {}, 'pallet_town');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('a');
  });

  it('filters by npcId when event has npcId set', () => {
    const events: StoryEvent[] = [
      makeEvent({ id: 'a', trigger: 'interact', npcId: 'prof_oak' }),
      makeEvent({ id: 'b', trigger: 'interact', npcId: 'rival' }),
    ];

    const result = getActiveEvents(events, 'interact', {}, undefined, 'rival');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('b');
  });

  it('requires all requiredFlags to be true', () => {
    const events: StoryEvent[] = [
      makeEvent({
        id: 'a',
        trigger: 'flag_check',
        requiredFlags: ['got_starter', 'beat_rival'],
      }),
    ];

    // Missing one flag - should not match
    const noMatch = getActiveEvents(events, 'flag_check', { got_starter: true });
    expect(noMatch).toHaveLength(0);

    // Both flags present - should match
    const match = getActiveEvents(events, 'flag_check', {
      got_starter: true,
      beat_rival: true,
    });
    expect(match).toHaveLength(1);
    expect(match[0].id).toBe('a');
  });

  it('blocks when any blockedByFlags is true', () => {
    const events: StoryEvent[] = [
      makeEvent({
        id: 'a',
        trigger: 'map_enter',
        blockedByFlags: ['already_visited'],
      }),
    ];

    // Blocked flag is set - should not match
    const blocked = getActiveEvents(events, 'map_enter', { already_visited: true });
    expect(blocked).toHaveLength(0);

    // Blocked flag is false - should match
    const notBlocked = getActiveEvents(events, 'map_enter', { already_visited: false });
    expect(notBlocked).toHaveLength(1);

    // Blocked flag absent from record - should match
    const absent = getActiveEvents(events, 'map_enter', {});
    expect(absent).toHaveLength(1);
  });

  it('returns multiple matching events', () => {
    const events: StoryEvent[] = [
      makeEvent({ id: 'a', trigger: 'map_enter' }),
      makeEvent({ id: 'b', trigger: 'map_enter' }),
      makeEvent({ id: 'c', trigger: 'map_enter' }),
    ];

    const result = getActiveEvents(events, 'map_enter', {});
    expect(result).toHaveLength(3);
    expect(result.map(e => e.id)).toEqual(['a', 'b', 'c']);
  });

  it('returns empty array when no events match', () => {
    const events: StoryEvent[] = [
      makeEvent({ id: 'a', trigger: 'interact' }),
    ];

    const result = getActiveEvents(events, 'map_enter', {});
    expect(result).toEqual([]);
  });

  it('events without mapId match any mapId for that trigger', () => {
    const events: StoryEvent[] = [
      makeEvent({ id: 'global', trigger: 'map_enter' }), // no mapId
    ];

    // Should match regardless of which mapId is passed
    expect(getActiveEvents(events, 'map_enter', {}, 'pallet_town')).toHaveLength(1);
    expect(getActiveEvents(events, 'map_enter', {}, 'viridian_city')).toHaveLength(1);
    expect(getActiveEvents(events, 'map_enter', {})).toHaveLength(1);
  });

  it('events without npcId match any npcId for that trigger', () => {
    const events: StoryEvent[] = [
      makeEvent({ id: 'global', trigger: 'interact' }), // no npcId
    ];

    // Should match regardless of which npcId is passed
    expect(getActiveEvents(events, 'interact', {}, undefined, 'prof_oak')).toHaveLength(1);
    expect(getActiveEvents(events, 'interact', {}, undefined, 'rival')).toHaveLength(1);
    expect(getActiveEvents(events, 'interact', {})).toHaveLength(1);
  });
});
