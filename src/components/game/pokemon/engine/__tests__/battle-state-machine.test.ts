import { describe, it, expect, beforeEach, vi } from 'vitest';
import type {
  Pokemon,
  PokemonStats,
  PokemonMove,
  MoveData,
  BattlePokemon,
  BattleState,
  PokemonType,
  TrainerDef,
  Weather,
} from '../types';

// ============================================================================
// Mock dependencies
// ============================================================================

vi.mock('../battle-engine', () => ({
  createBattlePokemon: vi.fn((pokemon: Pokemon): BattlePokemon => ({
    pokemon,
    types: ['normal'] as PokemonType[],
    statStages: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
    accuracyStage: 0,
    evasionStage: 0,
    volatileStatuses: new Set(),
    isProtected: false,
    protectCount: 0,
    sleepTurns: 0,
    confusionTurns: 0,
    toxicCounter: 0,
    chargingMove: null,
    semiInvulnerable: null,
  })),
  executeTurn: vi.fn(() => ({
    messages: ['Bulba used Tackle!', 'It hit!'],
    playerFirst: true,
    playerDamageDealt: 20,
    opponentDamageDealt: 15,
    playerFainted: false,
    opponentFainted: false,
    expGained: 50,
    caughtPokemon: null,
    ranAway: false,
  })),
  checkLevelUp: vi.fn(() => ({ leveled: false, newLevel: 50 })),
  attemptCatch: vi.fn(() => ({
    shakes: 3,
    caught: true,
    messages: ['The ball shook three times...', 'Gotcha!'],
  })),
  getMoveData: vi.fn((moveId: string) => {
    const db: Record<string, MoveData> = {
      tackle: {
        id: 'tackle', name: 'Tackle', type: 'normal' as PokemonType,
        category: 'physical', power: 40, accuracy: 100, pp: 35, priority: 0,
        description: 'A physical attack.',
      },
      ember: {
        id: 'ember', name: 'Ember', type: 'fire' as PokemonType,
        category: 'special', power: 40, accuracy: 100, pp: 25, priority: 0,
        description: 'A fire attack.',
      },
      scratch: {
        id: 'scratch', name: 'Scratch', type: 'normal' as PokemonType,
        category: 'physical', power: 40, accuracy: 100, pp: 35, priority: 0,
        description: 'Scratches with claws.',
      },
      vine_whip: {
        id: 'vine_whip', name: 'Vine Whip', type: 'grass' as PokemonType,
        category: 'physical', power: 45, accuracy: 100, pp: 25, priority: 0,
        description: 'Strikes with vines.',
      },
      razor_leaf: {
        id: 'razor_leaf', name: 'Razor Leaf', type: 'grass' as PokemonType,
        category: 'physical', power: 55, accuracy: 95, pp: 25, priority: 0,
        description: 'Fires sharp leaves.',
      },
    };
    return db[moveId] ?? null;
  }),
}));

vi.mock('../evolution-system', () => ({
  checkEvolution: vi.fn(() => ({ canEvolve: false, evolvesTo: null, condition: null })),
  evolvePokemon: vi.fn((pokemon: Pokemon, newSpeciesId: number) => ({
    ...pokemon,
    speciesId: newSpeciesId,
  })),
  getMovesForLevel: vi.fn(() => []),
  getSpeciesName: vi.fn((id: number) => {
    const names: Record<number, string> = {
      1: 'Bulbasaur', 2: 'Ivysaur', 4: 'Charmander',
      7: 'Squirtle', 25: 'Pikachu',
    };
    return names[id] ?? `Species #${id}`;
  }),
}));

// Import the module under test AFTER mocking
import {
  createBattleState,
  advanceBattle,
  selectFight,
  selectItem,
  selectSwitch,
  selectRun,
  executePlayerMove,
  executeSwitchPokemon,
  useItemInBattle,
  getPlayerMoves,
  getAvailableSwitches,
  learnMove,
  skipMoveLearn,
  applyEvolution,
  cancelEvolution,
} from '../battle-state-machine';
import { createBattlePokemon, executeTurn, checkLevelUp, attemptCatch, getMoveData } from '../battle-engine';
import { checkEvolution, evolvePokemon } from '../evolution-system';

// ============================================================================
// Helper factories
// ============================================================================

function makeStats(overrides: Partial<PokemonStats> = {}): PokemonStats {
  return {
    hp: 100, attack: 80, defense: 70,
    spAttack: 60, spDefense: 65, speed: 75,
    ...overrides,
  };
}

function makeMove(overrides: Partial<PokemonMove> = {}): PokemonMove {
  return { moveId: 'tackle', pp: 35, maxPp: 35, ...overrides };
}

function makePokemon(overrides: Partial<Pokemon> = {}): Pokemon {
  return {
    uid: 'test-uid-001',
    speciesId: 1,
    nickname: 'Bulba',
    level: 50,
    exp: 0,
    nature: 'hardy',
    ivs: makeStats({ hp: 15, attack: 15, defense: 15, spAttack: 15, spDefense: 15, speed: 15 }),
    evs: makeStats({ hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 }),
    stats: makeStats(),
    currentHp: 100,
    moves: [makeMove()],
    status: null,
    friendship: 70,
    isShiny: false,
    originalTrainer: 'Ash',
    caughtBall: 'pokeball',
    ...overrides,
  };
}

function makeBattleState(overrides: Partial<BattleState> = {}): BattleState {
  const playerPokemon = makePokemon({ uid: 'player-001', nickname: 'Bulba' });
  const opponentPokemon = makePokemon({ uid: 'opp-001', speciesId: 4, nickname: 'Charmy' });

  return {
    type: 'wild',
    phase: 'action_select',
    playerParty: [playerPokemon],
    playerActive: vi.mocked(createBattlePokemon)(playerPokemon),
    opponentParty: [opponentPokemon],
    opponentActive: vi.mocked(createBattlePokemon)(opponentPokemon),
    weather: 'clear' as Weather,
    weatherTurns: 0,
    turnNumber: 1,
    textQueue: [],
    currentText: '',
    playerAction: null,
    opponentAction: null,
    canRun: true,
    catchAttempts: 0,
    runAttempts: 0,
    expGained: 0,
    pendingLevelUps: [],
    pendingEvolution: null,
    battleResult: 'ongoing',
    ...overrides,
  } as BattleState;
}

function makeTrainerDef(overrides: Partial<TrainerDef> = {}): TrainerDef {
  return {
    id: 'trainer-01',
    name: 'Brock',
    class: 'Gym Leader',
    spriteId: 'brock',
    party: [{ speciesId: 74, level: 12 }],
    aiTier: 'smart',
    reward: 1200,
    defeatDialog: ['You beat me!'],
    isGymLeader: true,
    badge: 'boulder',
    ...overrides,
  };
}

// ============================================================================
// Reset mocks before each test
// ============================================================================

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================================
// createBattleState
// ============================================================================

describe('createBattleState', () => {
  it('creates a wild battle state with correct defaults', () => {
    const player = makePokemon({ uid: 'p1', nickname: 'Bulba' });
    const opponent = makePokemon({ uid: 'o1', speciesId: 4, nickname: 'Charmy' });

    const state = createBattleState({
      type: 'wild',
      playerParty: [player],
      opponentParty: [opponent],
    });

    expect(state.type).toBe('wild');
    expect(state.phase).toBe('intro');
    expect(state.canRun).toBe(true);
    expect(state.battleResult).toBe('ongoing');
    expect(state.weather).toBe('clear');
    expect(state.turnNumber).toBe(0);
    expect(state.catchAttempts).toBe(0);
    expect(state.runAttempts).toBe(0);
    expect(state.pendingLevelUps).toEqual([]);
    expect(state.pendingEvolution).toBeNull();
  });

  it('sets intro text for a wild battle', () => {
    const player = makePokemon({ uid: 'p1', nickname: 'Bulba' });
    const opponent = makePokemon({ uid: 'o1', speciesId: 4, nickname: 'Charmy' });

    const state = createBattleState({
      type: 'wild',
      playerParty: [player],
      opponentParty: [opponent],
    });

    expect(state.textQueue[0]).toBe('A wild Charmy appeared!');
    expect(state.textQueue[1]).toBe('Go! Bulba!');
    expect(state.currentText).toBe('A wild Charmy appeared!');
  });

  it('sets intro text for a trainer battle', () => {
    const player = makePokemon({ uid: 'p1', nickname: 'Bulba' });
    const opponent = makePokemon({ uid: 'o1', speciesId: 74, nickname: 'Onix' });
    const trainer = makeTrainerDef();

    const state = createBattleState({
      type: 'trainer',
      playerParty: [player],
      opponentParty: [opponent],
      trainerDef: trainer,
    });

    expect(state.type).toBe('trainer');
    expect(state.canRun).toBe(false);
    expect(state.currentText).toBe('Gym Leader Brock wants to battle!');
  });

  it('uses speciesId fallback when pokemon has no nickname', () => {
    const player = makePokemon({ uid: 'p1', nickname: undefined });
    const opponent = makePokemon({ uid: 'o1', speciesId: 4, nickname: undefined });

    const state = createBattleState({
      type: 'wild',
      playerParty: [player],
      opponentParty: [opponent],
    });

    expect(state.textQueue[0]).toBe('A wild Pokemon #4 appeared!');
    expect(state.textQueue[1]).toBe('Go! Pokemon #1!');
  });

  it('calls createBattlePokemon for both active pokemon', () => {
    const player = makePokemon({ uid: 'p1' });
    const opponent = makePokemon({ uid: 'o1' });

    createBattleState({ type: 'wild', playerParty: [player], opponentParty: [opponent] });

    expect(createBattlePokemon).toHaveBeenCalledTimes(2);
    expect(createBattlePokemon).toHaveBeenCalledWith(player);
    expect(createBattlePokemon).toHaveBeenCalledWith(opponent);
  });
});

// ============================================================================
// advanceBattle - text queue and phase transitions
// ============================================================================

describe('advanceBattle', () => {
  it('advances through queued text messages one at a time', () => {
    const state = makeBattleState({
      phase: 'intro',
      textQueue: ['Message 1', 'Message 2', 'Message 3'],
      currentText: 'Message 1',
    });

    const next = advanceBattle(state);
    expect(next.currentText).toBe('Message 2');
    expect(next.textQueue).toEqual(['Message 2', 'Message 3']);

    const next2 = advanceBattle(next);
    expect(next2.currentText).toBe('Message 3');
    expect(next2.textQueue).toEqual(['Message 3']);
  });

  it('transitions from intro to action_select when text queue is exhausted', () => {
    const state = makeBattleState({
      phase: 'intro',
      textQueue: ['Last intro message'],
      currentText: 'Last intro message',
    });

    const next = advanceBattle(state);
    expect(next.phase).toBe('action_select');
    expect(next.currentText).toBe('What will you do?');
  });

  it('transitions from battle_end to reward for a winning trainer battle', () => {
    const trainer = makeTrainerDef();
    const state = makeBattleState({
      phase: 'battle_end',
      type: 'trainer',
      battleResult: 'win',
      trainerDef: trainer,
      textQueue: ['single'],
      currentText: 'single',
    });

    const next = advanceBattle(state);
    expect(next.phase).toBe('reward');
    expect(next.currentText).toContain('You defeated Gym Leader Brock!');
    expect(next.textQueue).toContain('Got $1200 for winning!');
  });

  it('stays on battle_end for a wild win (no reward phase)', () => {
    const state = makeBattleState({
      phase: 'battle_end',
      type: 'wild',
      battleResult: 'win',
      textQueue: ['single'],
      currentText: 'single',
    });

    const next = advanceBattle(state);
    // Wild wins with no trainer return the same state
    expect(next.phase).toBe('battle_end');
  });

  it('transitions from exp_gain to level_up when there are pending level ups', () => {
    const pokemon = makePokemon({ uid: 'p1', nickname: 'Bulba' });
    const state = makeBattleState({
      phase: 'exp_gain',
      pendingLevelUps: [{ pokemon, newLevel: 51, newMoves: [] }],
      textQueue: ['single'],
      currentText: 'single',
    });

    const next = advanceBattle(state);
    expect(next.phase).toBe('level_up');
    expect(next.currentText).toContain('grew to Lv. 51');
  });

  it('transitions from exp_gain to battle_end (win) when no level ups pending', () => {
    const state = makeBattleState({
      phase: 'exp_gain',
      pendingLevelUps: [],
      textQueue: ['single'],
      currentText: 'single',
    });

    const next = advanceBattle(state);
    expect(next.phase).toBe('battle_end');
    expect(next.battleResult).toBe('win');
    expect(next.currentText).toBe('You won the battle!');
  });

  it('transitions from switch_prompt to switch_select', () => {
    const state = makeBattleState({
      phase: 'switch_prompt',
      textQueue: ['single'],
      currentText: 'single',
    });

    const next = advanceBattle(state);
    expect(next.phase).toBe('switch_select');
    expect(next.currentText).toBe('Choose a Pokemon!');
  });

  it('transitions from catch_animate to battle_end when caught', () => {
    const state = makeBattleState({
      phase: 'catch_animate',
      battleResult: 'caught',
      textQueue: ['single'],
      currentText: 'single',
    });

    const next = advanceBattle(state);
    expect(next.phase).toBe('battle_end');
    expect(next.battleResult).toBe('caught');
  });

  it('transitions from catch_animate back to action_select when not caught', () => {
    const state = makeBattleState({
      phase: 'catch_animate',
      battleResult: 'ongoing',
      textQueue: ['single'],
      currentText: 'single',
    });

    const next = advanceBattle(state);
    expect(next.phase).toBe('action_select');
    expect(next.currentText).toBe('What will you do?');
  });

  it('returns state unchanged for unhandled phases', () => {
    const state = makeBattleState({
      phase: 'damage_animate',
      textQueue: ['single'],
      currentText: 'single',
    });

    const next = advanceBattle(state);
    expect(next).toBe(state);
  });

  it('evolution_check stays if pendingEvolution exists', () => {
    const pokemon = makePokemon({ uid: 'p1', speciesId: 1 });
    const state = makeBattleState({
      phase: 'evolution_check',
      pendingEvolution: { pokemon, evolvesTo: 2 },
      textQueue: ['single'],
      currentText: 'single',
    });

    const next = advanceBattle(state);
    // Should return state unchanged since pendingEvolution exists
    expect(next).toBe(state);
  });

  it('evolution_check transitions to battle_end (win) when no pending evolution', () => {
    const state = makeBattleState({
      phase: 'evolution_check',
      pendingEvolution: null,
      textQueue: ['single'],
      currentText: 'single',
    });

    const next = advanceBattle(state);
    expect(next.phase).toBe('battle_end');
    expect(next.battleResult).toBe('win');
  });
});

// ============================================================================
// advanceBattle - faint_check transitions
// ============================================================================

describe('advanceBattle - faint_check', () => {
  it('transitions to action_select when neither side fainted', () => {
    const state = makeBattleState({
      phase: 'faint_check',
      textQueue: ['single'],
      currentText: 'single',
    });
    // Both active pokemon have currentHp > 0 by default

    const next = advanceBattle(state);
    expect(next.phase).toBe('action_select');
    expect(next.currentText).toBe('What will you do?');
  });

  it('transitions to exp_gain when opponent faints (wild, last pokemon)', () => {
    const opponent = makePokemon({ uid: 'opp-001', speciesId: 4, currentHp: 0, nickname: 'Charmy' });
    const state = makeBattleState({
      phase: 'faint_check',
      opponentParty: [opponent],
      opponentActive: vi.mocked(createBattlePokemon)(opponent),
      expGained: 100,
      textQueue: ['single'],
      currentText: 'single',
    });

    const next = advanceBattle(state);
    expect(next.phase).toBe('exp_gain');
    expect(next.currentText).toContain('Charmy fainted!');
    expect(checkLevelUp).toHaveBeenCalledWith(state.playerActive.pokemon, 100);
  });

  it('sends out next opponent when current one faints in trainer battle', () => {
    const opp1 = makePokemon({ uid: 'opp-001', speciesId: 4, currentHp: 0, nickname: 'Charmy' });
    const opp2 = makePokemon({ uid: 'opp-002', speciesId: 7, currentHp: 80, nickname: 'Squirt' });
    const state = makeBattleState({
      phase: 'faint_check',
      type: 'trainer',
      opponentParty: [opp1, opp2],
      opponentActive: vi.mocked(createBattlePokemon)(opp1),
      textQueue: ['single'],
      currentText: 'single',
    });

    const next = advanceBattle(state);
    expect(next.phase).toBe('action_select');
    expect(next.currentText).toContain('Foe sent out Squirt!');
    // Should have created a new BattlePokemon for opp2
    expect(createBattlePokemon).toHaveBeenCalledWith(opp2);
  });

  it('transitions to switch_prompt when player faints and has backup', () => {
    const p1 = makePokemon({ uid: 'player-001', currentHp: 0, nickname: 'Bulba' });
    const p2 = makePokemon({ uid: 'player-002', speciesId: 7, currentHp: 90, nickname: 'Squirt' });
    const state = makeBattleState({
      phase: 'faint_check',
      playerParty: [p1, p2],
      playerActive: vi.mocked(createBattlePokemon)(p1),
      textQueue: ['single'],
      currentText: 'single',
    });

    const next = advanceBattle(state);
    expect(next.phase).toBe('switch_prompt');
    expect(next.currentText).toContain('Bulba fainted!');
    // Friendship penalty
    expect(p1.friendship).toBe(69);
  });

  it('transitions to battle_end (lose) when player faints with no backup', () => {
    const p1 = makePokemon({ uid: 'player-001', currentHp: 0, nickname: 'Bulba' });
    const state = makeBattleState({
      phase: 'faint_check',
      playerParty: [p1],
      playerActive: vi.mocked(createBattlePokemon)(p1),
      textQueue: ['single'],
      currentText: 'single',
    });

    const next = advanceBattle(state);
    expect(next.phase).toBe('battle_end');
    expect(next.battleResult).toBe('lose');
    expect(next.textQueue).toContain('You blacked out!');
  });
});

// ============================================================================
// advanceBattle - level_up with new moves and evolution
// ============================================================================

describe('advanceBattle - level_up', () => {
  it('auto-learns a move when pokemon has fewer than 4 moves', () => {
    const pokemon = makePokemon({
      uid: 'p1', nickname: 'Bulba',
      moves: [makeMove({ moveId: 'tackle' }), makeMove({ moveId: 'scratch' })],
    });
    const state = makeBattleState({
      phase: 'level_up',
      pendingLevelUps: [{ pokemon, newLevel: 16, newMoves: ['vine_whip'] }],
      textQueue: ['single'],
      currentText: 'single',
    });

    const next = advanceBattle(state);
    // Should auto-learn vine_whip
    expect(pokemon.moves.length).toBe(3);
    expect(pokemon.moves[2].moveId).toBe('vine_whip');
    expect(next.currentText).toContain('learned Vine Whip');
  });

  it('enters move_learn phase when pokemon already has 4 moves', () => {
    const pokemon = makePokemon({
      uid: 'p1', nickname: 'Bulba',
      moves: [
        makeMove({ moveId: 'tackle' }),
        makeMove({ moveId: 'scratch' }),
        makeMove({ moveId: 'ember' }),
        makeMove({ moveId: 'vine_whip' }),
      ],
    });
    const state = makeBattleState({
      phase: 'level_up',
      pendingLevelUps: [{ pokemon, newLevel: 20, newMoves: ['razor_leaf'] }],
      textQueue: ['single'],
      currentText: 'single',
    });

    const next = advanceBattle(state);
    expect(next.phase).toBe('move_learn');
    expect(next.currentText).toContain('wants to learn Razor Leaf');
  });

  it('checks for evolution when no new moves remain', () => {
    const pokemon = makePokemon({ uid: 'p1', speciesId: 1, nickname: 'Bulba' });
    vi.mocked(checkEvolution).mockReturnValueOnce({
      canEvolve: true,
      evolvesTo: 2,
      condition: { type: 'level', level: 16 },
    });

    const state = makeBattleState({
      phase: 'level_up',
      pendingLevelUps: [{ pokemon, newLevel: 16, newMoves: [] }],
      textQueue: ['single'],
      currentText: 'single',
    });

    const next = advanceBattle(state);
    expect(next.phase).toBe('evolution_check');
    expect(next.pendingEvolution).toEqual({ pokemon, evolvesTo: 2 });
    expect(next.currentText).toContain('Bulba is evolving');
  });

  it('goes to battle_end when no new moves and no evolution', () => {
    const pokemon = makePokemon({ uid: 'p1' });
    vi.mocked(checkEvolution).mockReturnValueOnce({
      canEvolve: false, evolvesTo: null, condition: null,
    });

    const state = makeBattleState({
      phase: 'level_up',
      pendingLevelUps: [{ pokemon, newLevel: 51, newMoves: [] }],
      textQueue: ['single'],
      currentText: 'single',
    });

    const next = advanceBattle(state);
    expect(next.phase).toBe('battle_end');
    expect(next.battleResult).toBe('win');
  });
});

// ============================================================================
// advanceBattle - move_learn (default skip behavior)
// ============================================================================

describe('advanceBattle - move_learn', () => {
  it('skips learning the move by default and returns to level_up', () => {
    const pokemon = makePokemon({ uid: 'p1', nickname: 'Bulba' });
    const state = makeBattleState({
      phase: 'move_learn',
      pendingLevelUps: [{ pokemon, newLevel: 20, newMoves: ['razor_leaf'] }],
      textQueue: ['single'],
      currentText: 'single',
    });

    const next = advanceBattle(state);
    expect(next.phase).toBe('level_up');
    expect(next.currentText).toContain('Bulba did not learn Razor Leaf');
  });
});

// ============================================================================
// selectFight / selectItem / selectSwitch / selectRun
// ============================================================================

describe('selectFight', () => {
  it('transitions from action_select to move_select', () => {
    const state = makeBattleState({ phase: 'action_select' });
    const next = selectFight(state);
    expect(next.phase).toBe('move_select');
    expect(next.currentText).toBe('Choose a move!');
  });

  it('returns state unchanged when not in action_select phase', () => {
    const state = makeBattleState({ phase: 'intro' });
    const next = selectFight(state);
    expect(next).toBe(state);
  });
});

describe('selectItem', () => {
  it('transitions from action_select to item_select', () => {
    const state = makeBattleState({ phase: 'action_select' });
    const next = selectItem(state);
    expect(next.phase).toBe('item_select');
    expect(next.currentText).toBe('Choose an item!');
  });

  it('returns state unchanged when not in action_select', () => {
    const state = makeBattleState({ phase: 'move_select' });
    const next = selectItem(state);
    expect(next).toBe(state);
  });
});

describe('selectSwitch', () => {
  it('transitions from action_select to switch_select', () => {
    const state = makeBattleState({ phase: 'action_select' });
    const next = selectSwitch(state);
    expect(next.phase).toBe('switch_select');
    expect(next.currentText).toBe('Choose a Pokemon!');
  });

  it('transitions from switch_prompt to switch_select', () => {
    const state = makeBattleState({ phase: 'switch_prompt' });
    const next = selectSwitch(state);
    expect(next.phase).toBe('switch_select');
  });

  it('returns state unchanged when in an unrelated phase', () => {
    const state = makeBattleState({ phase: 'intro' });
    const next = selectSwitch(state);
    expect(next).toBe(state);
  });
});

describe('selectRun', () => {
  it('returns state unchanged when not in action_select', () => {
    const state = makeBattleState({ phase: 'move_select' });
    const next = selectRun(state);
    expect(next).toBe(state);
  });

  it('transitions to battle_end with result "run" on successful escape', () => {
    vi.mocked(executeTurn).mockReturnValueOnce({
      messages: ['Got away safely!'],
      playerFirst: true,
      playerDamageDealt: 0,
      opponentDamageDealt: 0,
      playerFainted: false,
      opponentFainted: false,
      expGained: 0,
      caughtPokemon: null,
      ranAway: true,
    });

    const state = makeBattleState({ phase: 'action_select', runAttempts: 0 });
    const next = selectRun(state);
    expect(next.phase).toBe('battle_end');
    expect(next.battleResult).toBe('run');
    expect(next.runAttempts).toBe(1);
  });

  it('transitions to faint_check on failed escape', () => {
    vi.mocked(executeTurn).mockReturnValueOnce({
      messages: ["Can't escape!"],
      playerFirst: true,
      playerDamageDealt: 0,
      opponentDamageDealt: 10,
      playerFainted: false,
      opponentFainted: false,
      expGained: 0,
      caughtPokemon: null,
      ranAway: false,
    });

    const state = makeBattleState({ phase: 'action_select', runAttempts: 1 });
    const next = selectRun(state);
    expect(next.phase).toBe('faint_check');
    expect(next.runAttempts).toBe(2);
    expect(next.currentText).toBe("Can't escape!");
  });
});

// ============================================================================
// executePlayerMove
// ============================================================================

describe('executePlayerMove', () => {
  it('executes a move and transitions to faint_check', () => {
    vi.mocked(executeTurn).mockReturnValueOnce({
      messages: ['Bulba used Tackle!', 'It was effective!'],
      playerFirst: true,
      playerDamageDealt: 30,
      opponentDamageDealt: 20,
      playerFainted: false,
      opponentFainted: false,
      expGained: 55,
      caughtPokemon: null,
      ranAway: false,
      newWeather: 'rain' as Weather,
      newWeatherTurns: 5,
    });

    const state = makeBattleState({ phase: 'move_select', turnNumber: 3 });
    const next = executePlayerMove(state, 0);

    expect(next.phase).toBe('faint_check');
    expect(next.turnNumber).toBe(4);
    expect(next.expGained).toBe(55);
    expect(next.weather).toBe('rain');
    expect(next.weatherTurns).toBe(5);
    expect(next.currentText).toBe('Bulba used Tackle!');
    expect(executeTurn).toHaveBeenCalledWith(state, 0, 'fight');
  });

  it('returns state unchanged when not in move_select phase', () => {
    const state = makeBattleState({ phase: 'action_select' });
    const next = executePlayerMove(state, 0);
    expect(next).toBe(state);
  });
});

// ============================================================================
// executeSwitchPokemon
// ============================================================================

describe('executeSwitchPokemon', () => {
  it('switches to the selected party member and calls executeTurn', () => {
    const p1 = makePokemon({ uid: 'player-001', nickname: 'Bulba', currentHp: 50 });
    const p2 = makePokemon({ uid: 'player-002', speciesId: 7, nickname: 'Squirt', currentHp: 90 });

    vi.mocked(executeTurn).mockReturnValueOnce({
      messages: ['Opponent attacks!'],
      playerFirst: false,
      playerDamageDealt: 0,
      opponentDamageDealt: 10,
      playerFainted: false,
      opponentFainted: false,
      expGained: 0,
      caughtPokemon: null,
      ranAway: false,
    });

    const state = makeBattleState({
      phase: 'switch_select',
      playerParty: [p1, p2],
    });

    const next = executeSwitchPokemon(state, 1);
    expect(next.phase).toBe('faint_check');
    expect(next.currentText).toBe('Go! Squirt!');
    expect(next.playerActive.pokemon.uid).toBe('player-002');
    expect(executeTurn).toHaveBeenCalled();
  });

  it('returns state unchanged when target pokemon has 0 HP', () => {
    const p1 = makePokemon({ uid: 'player-001', currentHp: 50 });
    const fainted = makePokemon({ uid: 'player-002', currentHp: 0 });

    const state = makeBattleState({
      phase: 'switch_select',
      playerParty: [p1, fainted],
    });

    const next = executeSwitchPokemon(state, 1);
    expect(next).toBe(state);
  });

  it('returns state unchanged when party index is out of bounds', () => {
    const state = makeBattleState({ phase: 'switch_select' });
    const next = executeSwitchPokemon(state, 5);
    expect(next).toBe(state);
  });
});

// ============================================================================
// useItemInBattle
// ============================================================================

describe('useItemInBattle', () => {
  it('attempts to catch wild pokemon with a pokeball', () => {
    vi.mocked(attemptCatch).mockReturnValueOnce({
      shakes: 3,
      caught: true,
      messages: ['The ball shook three times...', 'Gotcha!'],
    });

    const state = makeBattleState({ type: 'wild', phase: 'item_select' });
    const next = useItemInBattle(state, 'poke-ball');

    expect(next.phase).toBe('catch_animate');
    expect(next.battleResult).toBe('caught');
    expect(next.currentText).toBe('The ball shook three times...');
    expect(attemptCatch).toHaveBeenCalledWith(state.opponentActive.pokemon, 1);
  });

  it('uses correct multiplier for ultra-ball', () => {
    vi.mocked(attemptCatch).mockReturnValueOnce({
      shakes: 3, caught: true, messages: ['Gotcha!'],
    });

    const state = makeBattleState({ type: 'wild' });
    useItemInBattle(state, 'ultra-ball');

    expect(attemptCatch).toHaveBeenCalledWith(state.opponentActive.pokemon, 2);
  });

  it('uses correct multiplier for great-ball', () => {
    vi.mocked(attemptCatch).mockReturnValueOnce({
      shakes: 3, caught: true, messages: ['Gotcha!'],
    });

    const state = makeBattleState({ type: 'wild' });
    useItemInBattle(state, 'great-ball');

    expect(attemptCatch).toHaveBeenCalledWith(state.opponentActive.pokemon, 1.5);
  });

  it('uses 255 multiplier for master-ball', () => {
    vi.mocked(attemptCatch).mockReturnValueOnce({
      shakes: 3, caught: true, messages: ['Gotcha!'],
    });

    const state = makeBattleState({ type: 'wild' });
    useItemInBattle(state, 'master-ball');

    expect(attemptCatch).toHaveBeenCalledWith(state.opponentActive.pokemon, 255);
  });

  it('goes to faint_check and increments catchAttempts on failed catch', () => {
    vi.mocked(attemptCatch).mockReturnValueOnce({
      shakes: 1,
      caught: false,
      messages: ['It broke free!'],
    });

    const state = makeBattleState({ type: 'wild', catchAttempts: 2 });
    const next = useItemInBattle(state, 'poke-ball');

    expect(next.phase).toBe('faint_check');
    expect(next.catchAttempts).toBe(3);
    expect(next.currentText).toBe('It broke free!');
  });

  it('rejects pokeball use in trainer battles', () => {
    const state = makeBattleState({ type: 'trainer' });
    const next = useItemInBattle(state, 'poke-ball');

    expect(next.phase).toBe('action_select');
    expect(next.currentText).toBe("You can't catch a trainer's Pokemon!");
    expect(attemptCatch).not.toHaveBeenCalled();
  });

  it('handles healing items by transitioning to faint_check', () => {
    const state = makeBattleState({ phase: 'item_select' });
    const next = useItemInBattle(state, 'potion');

    expect(next.phase).toBe('faint_check');
    expect(next.currentText).toBe('Used potion!');
  });
});

// ============================================================================
// getPlayerMoves
// ============================================================================

describe('getPlayerMoves', () => {
  it('returns MoveData for each of the active pokemon moves', () => {
    const state = makeBattleState();
    // Active pokemon has one move: tackle
    const moves = getPlayerMoves(state);

    expect(getMoveData).toHaveBeenCalledWith('tackle');
    expect(moves.length).toBe(1);
    expect(moves[0]?.name).toBe('Tackle');
  });

  it('returns null for unknown moves', () => {
    const pokemon = makePokemon({
      uid: 'p1',
      moves: [makeMove({ moveId: 'unknown_move' })],
    });
    const state = makeBattleState({
      playerActive: vi.mocked(createBattlePokemon)(pokemon),
    });

    const moves = getPlayerMoves(state);
    expect(moves[0]).toBeNull();
  });
});

// ============================================================================
// getAvailableSwitches
// ============================================================================

describe('getAvailableSwitches', () => {
  it('returns party members that are alive and not currently active', () => {
    const p1 = makePokemon({ uid: 'player-001', currentHp: 100 });
    const p2 = makePokemon({ uid: 'player-002', currentHp: 80 });
    const p3 = makePokemon({ uid: 'player-003', currentHp: 0 });

    const state = makeBattleState({
      playerParty: [p1, p2, p3],
      playerActive: vi.mocked(createBattlePokemon)(p1),
    });

    const switches = getAvailableSwitches(state);
    expect(switches).toHaveLength(1);
    expect(switches[0].uid).toBe('player-002');
  });

  it('returns empty array when no valid switches exist', () => {
    const p1 = makePokemon({ uid: 'player-001', currentHp: 100 });
    const state = makeBattleState({
      playerParty: [p1],
      playerActive: vi.mocked(createBattlePokemon)(p1),
    });

    const switches = getAvailableSwitches(state);
    expect(switches).toHaveLength(0);
  });
});

// ============================================================================
// learnMove
// ============================================================================

describe('learnMove', () => {
  it('replaces the move at the given index and transitions to level_up', () => {
    const pokemon = makePokemon({
      uid: 'p1', nickname: 'Bulba',
      moves: [
        makeMove({ moveId: 'tackle' }),
        makeMove({ moveId: 'scratch' }),
        makeMove({ moveId: 'ember' }),
        makeMove({ moveId: 'vine_whip' }),
      ],
    });

    const state = makeBattleState({
      phase: 'move_learn',
      pendingLevelUps: [{ pokemon, newLevel: 20, newMoves: ['razor_leaf'] }],
    });

    const next = learnMove(state, 1);
    expect(next.phase).toBe('level_up');
    // The move at index 1 should now be razor_leaf
    expect(pokemon.moves[1].moveId).toBe('razor_leaf');
    expect(next.currentText).toBe('1, 2, and... Poof!');
    expect(next.textQueue).toContain('And... Bulba learned Razor Leaf!');
  });

  it('declines learning when replaceIndex is -1', () => {
    const pokemon = makePokemon({
      uid: 'p1', nickname: 'Bulba',
      moves: [
        makeMove({ moveId: 'tackle' }),
        makeMove({ moveId: 'scratch' }),
        makeMove({ moveId: 'ember' }),
        makeMove({ moveId: 'vine_whip' }),
      ],
    });

    const state = makeBattleState({
      phase: 'move_learn',
      pendingLevelUps: [{ pokemon, newLevel: 20, newMoves: ['razor_leaf'] }],
    });

    const next = learnMove(state, -1);
    expect(next.phase).toBe('level_up');
    expect(next.currentText).toContain('did not learn Razor Leaf');
    // Original moves should be unchanged
    expect(pokemon.moves.map(m => m.moveId)).toEqual(['tackle', 'scratch', 'ember', 'vine_whip']);
  });

  it('returns state unchanged when not in move_learn phase', () => {
    const state = makeBattleState({ phase: 'action_select' });
    const next = learnMove(state, 0);
    expect(next).toBe(state);
  });

  it('returns state unchanged when no pending level ups', () => {
    const state = makeBattleState({
      phase: 'move_learn',
      pendingLevelUps: [],
    });
    const next = learnMove(state, 0);
    expect(next).toBe(state);
  });
});

// ============================================================================
// skipMoveLearn
// ============================================================================

describe('skipMoveLearn', () => {
  it('delegates to learnMove with -1', () => {
    const pokemon = makePokemon({
      uid: 'p1', nickname: 'Bulba',
      moves: [
        makeMove({ moveId: 'tackle' }),
        makeMove({ moveId: 'scratch' }),
        makeMove({ moveId: 'ember' }),
        makeMove({ moveId: 'vine_whip' }),
      ],
    });

    const state = makeBattleState({
      phase: 'move_learn',
      pendingLevelUps: [{ pokemon, newLevel: 20, newMoves: ['razor_leaf'] }],
    });

    const next = skipMoveLearn(state);
    expect(next.phase).toBe('level_up');
    expect(next.currentText).toContain('did not learn Razor Leaf');
  });
});

// ============================================================================
// applyEvolution
// ============================================================================

describe('applyEvolution', () => {
  it('evolves the pokemon and transitions to battle_end (win)', () => {
    const pokemon = makePokemon({ uid: 'p1', speciesId: 1, nickname: 'Bulba' });

    const state = makeBattleState({
      phase: 'evolution_check',
      pendingEvolution: { pokemon, evolvesTo: 2 },
    });

    const next = applyEvolution(state);
    expect(next.phase).toBe('battle_end');
    expect(next.battleResult).toBe('win');
    expect(next.pendingEvolution).toBeNull();
    expect(next.currentText).toContain('Bulba evolved into Ivysaur');
    expect(evolvePokemon).toHaveBeenCalledWith(pokemon, 2);
  });

  it('returns state unchanged when no pending evolution', () => {
    const state = makeBattleState({
      phase: 'evolution_check',
      pendingEvolution: null,
    });

    const next = applyEvolution(state);
    expect(next).toBe(state);
  });
});

// ============================================================================
// cancelEvolution
// ============================================================================

describe('cancelEvolution', () => {
  it('cancels evolution and transitions to battle_end (win)', () => {
    const pokemon = makePokemon({ uid: 'p1', speciesId: 1, nickname: 'Bulba' });

    const state = makeBattleState({
      phase: 'evolution_check',
      pendingEvolution: { pokemon, evolvesTo: 2 },
    });

    const next = cancelEvolution(state);
    expect(next.phase).toBe('battle_end');
    expect(next.battleResult).toBe('win');
    expect(next.pendingEvolution).toBeNull();
    expect(next.currentText).toContain('Bulba stopped evolving');
  });

  it('uses species name when pokemon has no nickname', () => {
    const pokemon = makePokemon({ uid: 'p1', speciesId: 1, nickname: undefined });

    const state = makeBattleState({
      phase: 'evolution_check',
      pendingEvolution: { pokemon, evolvesTo: 2 },
    });

    const next = cancelEvolution(state);
    expect(next.currentText).toContain('Bulbasaur stopped evolving');
  });
});
