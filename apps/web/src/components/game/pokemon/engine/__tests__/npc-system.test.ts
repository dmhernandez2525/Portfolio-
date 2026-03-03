// =============================================================================
// Pokemon RPG Engine - NPC System Test Suite
// =============================================================================

import { describe, it, expect, vi } from 'vitest';
import {
  createNPCState,
  createNPCStates,
  updateNPC,
  getNPCDialog,
  markTrainerDefeated,
} from '../npc-system';
import type { NPCState } from '../npc-system';
import type { NPCDef, GameMap, Direction, TrainerDef, TileType } from '../types';

// -- Fixtures --

function makeNPC(overrides: Partial<NPCDef> = {}): NPCDef {
  return {
    id: 'npc-1',
    x: 5,
    y: 5,
    spriteId: 'villager',
    direction: 'down' as Direction,
    movement: 'static',
    dialog: ['Hello there!', 'Nice weather.'],
    isTrainer: false,
    ...overrides,
  };
}

function makeNPCState(overrides: Partial<NPCState> = {}): NPCState {
  return {
    npcId: 'npc-1',
    x: 5,
    y: 5,
    direction: 'down',
    isMoving: false,
    moveProgress: 0,
    targetX: 5,
    targetY: 5,
    moveCooldown: 0,
    patrolIndex: 0,
    defeated: false,
    dialogIndex: 0,
    ...overrides,
  };
}

/** Build a small 10x10 map where all tiles are walkable. */
function makeMap(overrides: Partial<GameMap> = {}): GameMap {
  const width = 10;
  const height = 10;
  const walkableRow: TileType[] = Array(width).fill('walkable');
  const collision: TileType[][] = Array.from({ length: height }, () => [...walkableRow]);
  const emptyLayer = Array.from({ length: height }, () => Array(width).fill(0));

  return {
    id: 'test-map',
    name: 'Test Map',
    width,
    height,
    tilesetId: 'test-tileset',
    layers: {
      ground: emptyLayer,
      objects: emptyLayer,
      above: emptyLayer,
    },
    collision,
    warps: [],
    connections: [],
    encounters: [],
    npcs: [],
    ...overrides,
  };
}

// =============================================================================
// createNPCState
// =============================================================================

describe('createNPCState', () => {
  it('should create state from NPC definition with correct position', () => {
    const npc = makeNPC({ id: 'guard', x: 3, y: 7, direction: 'left' });
    const state = createNPCState(npc);

    expect(state.npcId).toBe('guard');
    expect(state.x).toBe(3);
    expect(state.y).toBe(7);
    expect(state.direction).toBe('left');
    expect(state.targetX).toBe(3);
    expect(state.targetY).toBe(7);
  });

  it('should initialise movement fields to idle defaults', () => {
    const state = createNPCState(makeNPC());
    expect(state.isMoving).toBe(false);
    expect(state.moveProgress).toBe(0);
    expect(state.patrolIndex).toBe(0);
    expect(state.defeated).toBe(false);
    expect(state.dialogIndex).toBe(0);
  });

  it('should assign a random cooldown between 60 and 179', () => {
    // Run several times to verify the range
    for (let i = 0; i < 50; i++) {
      const state = createNPCState(makeNPC());
      expect(state.moveCooldown).toBeGreaterThanOrEqual(60);
      expect(state.moveCooldown).toBeLessThan(180);
    }
  });
});

// =============================================================================
// createNPCStates
// =============================================================================

describe('createNPCStates', () => {
  it('should return a Map keyed by NPC id', () => {
    const npcs = [makeNPC({ id: 'a' }), makeNPC({ id: 'b' })];
    const states = createNPCStates(npcs);

    expect(states).toBeInstanceOf(Map);
    expect(states.size).toBe(2);
    expect(states.has('a')).toBe(true);
    expect(states.has('b')).toBe(true);
  });

  it('should return an empty Map for an empty array', () => {
    const states = createNPCStates([]);
    expect(states.size).toBe(0);
  });

  it('should store the correct state per NPC', () => {
    const npcA = makeNPC({ id: 'a', x: 1, y: 2 });
    const npcB = makeNPC({ id: 'b', x: 8, y: 9 });
    const states = createNPCStates([npcA, npcB]);

    expect(states.get('a')!.x).toBe(1);
    expect(states.get('b')!.x).toBe(8);
  });
});

// =============================================================================
// updateNPC
// =============================================================================

describe('updateNPC', () => {
  const map = makeMap();
  const emptyStates = new Map<string, NPCState>();

  // -- Animation in progress --

  it('should increment moveProgress when the NPC is mid-move', () => {
    const npc = makeNPC();
    const state = makeNPCState({ isMoving: true, moveProgress: 0.5, targetX: 6, targetY: 5 });
    const result = updateNPC(npc, state, map, 0, 0, emptyStates);

    expect(result.moveProgress).toBeCloseTo(0.55);
    expect(result.isMoving).toBe(true);
  });

  it('should snap to target tile when move animation completes', () => {
    const npc = makeNPC();
    const state = makeNPCState({ isMoving: true, moveProgress: 0.97, targetX: 6, targetY: 5 });
    const result = updateNPC(npc, state, map, 0, 0, emptyStates);

    expect(result.x).toBe(6);
    expect(result.y).toBe(5);
    expect(result.isMoving).toBe(false);
    expect(result.moveProgress).toBe(0);
  });

  // -- Cooldown --

  it('should decrement moveCooldown while it is positive', () => {
    const npc = makeNPC();
    const state = makeNPCState({ moveCooldown: 10 });
    const result = updateNPC(npc, state, map, 0, 0, emptyStates);
    expect(result.moveCooldown).toBe(9);
  });

  // -- Static NPCs --

  it('should reset cooldown to 120 for static NPCs once cooldown expires', () => {
    const npc = makeNPC({ movement: 'static' });
    const state = makeNPCState({ moveCooldown: 0 });
    const result = updateNPC(npc, state, map, 0, 0, emptyStates);
    expect(result.moveCooldown).toBe(120);
  });

  // -- Wandering NPCs --

  it('should attempt to move a wandering NPC in a random direction', () => {
    // Seed random so the chosen direction is predictable
    vi.spyOn(Math, 'random').mockReturnValue(0); // picks index 0 = 'up'
    const npc = makeNPC({ movement: 'wander' });
    const state = makeNPCState({ moveCooldown: 0 });
    const result = updateNPC(npc, state, map, 0, 0, emptyStates);

    // Direction should be 'up' (index 0)
    expect(result.direction).toBe('up');
    // Should either start moving or at least set a direction
    expect(['up', 'down', 'left', 'right']).toContain(result.direction);

    vi.restoreAllMocks();
  });

  it('should not move a wandering NPC into the player tile', () => {
    // Force direction = down, so target = (5,6). Place player at (5,6).
    vi.spyOn(Math, 'random').mockReturnValue(0.25); // index 1 = 'down'
    const npc = makeNPC({ movement: 'wander' });
    const state = makeNPCState({ moveCooldown: 0 });
    const result = updateNPC(npc, state, map, 5, 6, emptyStates);

    // Should NOT be moving towards the player tile
    if (result.isMoving) {
      expect(result.targetX !== 5 || result.targetY !== 6).toBe(true);
    }

    vi.restoreAllMocks();
  });

  it('should not move a wandering NPC into a tile occupied by another NPC', () => {
    // Force direction = right, so target = (6,5). Place another NPC at (6,5).
    vi.spyOn(Math, 'random').mockReturnValue(0.75); // index 3 = 'right'
    const npc = makeNPC({ movement: 'wander' });
    const state = makeNPCState({ moveCooldown: 0 });
    const otherState = makeNPCState({ npcId: 'other', x: 6, y: 5 });
    const allStates = new Map<string, NPCState>();
    allStates.set('npc-1', state);
    allStates.set('other', otherState);

    const result = updateNPC(npc, state, map, 0, 0, allStates);

    // NPC should turn but not start moving into the occupied tile
    expect(result.isMoving).toBe(false);
    expect(result.direction).toBe('right');

    vi.restoreAllMocks();
  });

  it('should not move a wandering NPC into a tile another NPC is moving toward', () => {
    // Force direction = right, so target = (6,5). Another NPC is moving toward (6,5).
    vi.spyOn(Math, 'random').mockReturnValue(0.75); // index 3 = 'right'
    const npc = makeNPC({ movement: 'wander' });
    const state = makeNPCState({ moveCooldown: 0 });
    const movingNPC = makeNPCState({
      npcId: 'other',
      x: 7,
      y: 5,
      isMoving: true,
      targetX: 6,
      targetY: 5,
    });
    const allStates = new Map<string, NPCState>();
    allStates.set('npc-1', state);
    allStates.set('other', movingNPC);

    const result = updateNPC(npc, state, map, 0, 0, allStates);

    // NPC should turn but not start moving into the tile another NPC is heading toward
    expect(result.isMoving).toBe(false);
    expect(result.direction).toBe('right');

    vi.restoreAllMocks();
  });

  it('should not move a wandering NPC into an unwalkable tile', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0); // 'up', target = (5,4)
    const blockedMap = makeMap();
    blockedMap.collision[4][5] = 'blocked';

    const npc = makeNPC({ movement: 'wander' });
    const state = makeNPCState({ moveCooldown: 0 });
    const result = updateNPC(npc, state, blockedMap, 0, 0, emptyStates);

    expect(result.isMoving).toBe(false);
    vi.restoreAllMocks();
  });

  // -- Patrol NPCs --

  it('should move a patrol NPC toward the next patrol waypoint', () => {
    const patrolPath = [
      { x: 5, y: 5 },
      { x: 7, y: 5 },
    ];
    const npc = makeNPC({ movement: 'patrol', patrolPath });
    const state = makeNPCState({ moveCooldown: 0, patrolIndex: 0 });
    const result = updateNPC(npc, state, map, 0, 0, emptyStates);

    expect(result.direction).toBe('right');
    expect(result.isMoving).toBe(true);
    expect(result.targetX).toBe(6);
    expect(result.targetY).toBe(5);
  });

  it('should set direction to left when patrol target is to the left', () => {
    const patrolPath = [
      { x: 5, y: 5 },
      { x: 3, y: 5 },
    ];
    const npc = makeNPC({ movement: 'patrol', patrolPath });
    const state = makeNPCState({ moveCooldown: 0, patrolIndex: 0 });
    const result = updateNPC(npc, state, map, 0, 0, emptyStates);

    expect(result.direction).toBe('left');
    expect(result.isMoving).toBe(true);
  });

  it('should set direction to up when patrol target is above', () => {
    const patrolPath = [
      { x: 5, y: 5 },
      { x: 5, y: 3 },
    ];
    const npc = makeNPC({ movement: 'patrol', patrolPath });
    const state = makeNPCState({ moveCooldown: 0, patrolIndex: 0 });
    const result = updateNPC(npc, state, map, 0, 0, emptyStates);

    expect(result.direction).toBe('up');
    expect(result.isMoving).toBe(true);
  });

  it('should set direction to down when patrol target is below (dx === 0, dy > 0)', () => {
    const patrolPath = [
      { x: 5, y: 5 },
      { x: 5, y: 7 },
    ];
    const npc = makeNPC({ movement: 'patrol', patrolPath });
    const state = makeNPCState({ moveCooldown: 0, patrolIndex: 0 });
    const result = updateNPC(npc, state, map, 0, 0, emptyStates);

    expect(result.direction).toBe('down');
    expect(result.isMoving).toBe(true);
  });

  it('should set cooldown when patrol tile is blocked', () => {
    const patrolPath = [
      { x: 5, y: 5 },
      { x: 5, y: 7 },
    ];
    const blockedMap = makeMap();
    // Block the tile the NPC would step into (5,6)
    blockedMap.collision[6][5] = 'blocked';

    const npc = makeNPC({ movement: 'patrol', patrolPath });
    const state = makeNPCState({ moveCooldown: 0, patrolIndex: 0 });
    const result = updateNPC(npc, state, blockedMap, 0, 0, emptyStates);

    expect(result.isMoving).toBe(false);
    expect(result.moveCooldown).toBe(60);
  });

  it('should update patrolIndex when reaching the waypoint tile', () => {
    const patrolPath = [
      { x: 5, y: 5 },
      { x: 6, y: 5 },
    ];
    const npc = makeNPC({ movement: 'patrol', patrolPath });
    // NPC is at (5,5) and next waypoint is (6,5), which is exactly one step away
    const state = makeNPCState({ moveCooldown: 0, patrolIndex: 0, x: 5, y: 5 });
    const result = updateNPC(npc, state, map, 0, 0, emptyStates);

    expect(result.patrolIndex).toBe(1);
    expect(result.targetX).toBe(6);
    expect(result.targetY).toBe(5);
  });

  // -- Fallthrough --

  it('should reset cooldown to 120 for unknown movement types as fallthrough', () => {
    // A patrol NPC with no patrolPath falls through to the default branch
    const npc = makeNPC({ movement: 'patrol' });
    const state = makeNPCState({ moveCooldown: 0, patrolIndex: 0 });
    const result = updateNPC(npc, state, map, 0, 0, emptyStates);
    expect(result.moveCooldown).toBe(120);
  });
});

// =============================================================================
// getNPCDialog
// =============================================================================

describe('getNPCDialog', () => {
  it('should return the default dialog for a regular NPC', () => {
    const npc = makeNPC({ dialog: ['Welcome!', 'Goodbye.'] });
    const state = makeNPCState();
    expect(getNPCDialog(npc, state)).toEqual(['Welcome!', 'Goodbye.']);
  });

  it('should return defeatDialog for a defeated trainer with trainerData', () => {
    const trainerData: TrainerDef = {
      id: 'trainer-1',
      name: 'Bug Catcher',
      class: 'Bug Catcher',
      spriteId: 'bug-catcher',
      party: [],
      aiTier: 'basic',
      reward: 100,
      defeatDialog: ['You beat me!'],
      isGymLeader: false,
    };
    const npc = makeNPC({
      isTrainer: true,
      trainerData,
      dialog: ['Ready to battle?'],
    });
    const state = makeNPCState({ defeated: true });

    expect(getNPCDialog(npc, state)).toEqual(['You beat me!']);
  });

  it('should return default dialog for a trainer that has not been defeated', () => {
    const trainerData: TrainerDef = {
      id: 'trainer-1',
      name: 'Bug Catcher',
      class: 'Bug Catcher',
      spriteId: 'bug-catcher',
      party: [],
      aiTier: 'basic',
      reward: 100,
      defeatDialog: ['You beat me!'],
      isGymLeader: false,
    };
    const npc = makeNPC({
      isTrainer: true,
      trainerData,
      dialog: ['Ready to battle?'],
    });
    const state = makeNPCState({ defeated: false });

    expect(getNPCDialog(npc, state)).toEqual(['Ready to battle?']);
  });

  it('should return default dialog for a trainer with no trainerData', () => {
    const npc = makeNPC({ isTrainer: true, dialog: ['Fight me!'] });
    const state = makeNPCState({ defeated: true });
    expect(getNPCDialog(npc, state)).toEqual(['Fight me!']);
  });
});

// =============================================================================
// markTrainerDefeated
// =============================================================================

describe('markTrainerDefeated', () => {
  it('should set the defeated flag on the matching NPC state', () => {
    const states = new Map<string, NPCState>();
    states.set('npc-1', makeNPCState({ defeated: false }));

    markTrainerDefeated(states, 'npc-1');

    expect(states.get('npc-1')!.defeated).toBe(true);
  });

  it('should not throw or modify others when the npcId does not exist', () => {
    const states = new Map<string, NPCState>();
    states.set('npc-1', makeNPCState({ defeated: false }));

    // Should not throw
    markTrainerDefeated(states, 'nonexistent');

    // Original state untouched
    expect(states.get('npc-1')!.defeated).toBe(false);
  });

  it('should only modify the targeted NPC, leaving others unchanged', () => {
    const states = new Map<string, NPCState>();
    states.set('a', makeNPCState({ npcId: 'a', defeated: false }));
    states.set('b', makeNPCState({ npcId: 'b', defeated: false }));

    markTrainerDefeated(states, 'a');

    expect(states.get('a')!.defeated).toBe(true);
    expect(states.get('b')!.defeated).toBe(false);
  });
});
