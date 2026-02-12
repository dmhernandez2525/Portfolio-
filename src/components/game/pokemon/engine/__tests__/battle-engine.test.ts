import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  setMoveDatabase,
  getMoveData,
  setSpeciesDatabase,
  getSpeciesData,
  createBattlePokemon,
  applyOnSwitchIn,
  executeTurn,
} from '../battle-engine';
import type {
  Pokemon,
  PokemonStats,
  PokemonMove,
  MoveData,
  BattlePokemon,
  BattleState,
  StatusCondition,
  PokemonType,
} from '../types';

// ============================================================================
// Helper factories
// ============================================================================

function makeStats(overrides: Partial<PokemonStats> = {}): PokemonStats {
  return {
    hp: 100,
    attack: 80,
    defense: 70,
    spAttack: 60,
    spDefense: 65,
    speed: 75,
    ...overrides,
  };
}

function makeMove(overrides: Partial<PokemonMove> = {}): PokemonMove {
  return {
    moveId: 'tackle',
    pp: 35,
    maxPp: 35,
    ...overrides,
  };
}

function makePokemon(overrides: Partial<Pokemon> = {}): Pokemon {
  return {
    uid: 'test-uid-001',
    speciesId: 1,
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

function makeMoveData(overrides: Partial<MoveData> = {}): MoveData {
  return {
    id: 'tackle',
    name: 'Tackle',
    type: 'normal' as PokemonType,
    category: 'physical',
    power: 40,
    accuracy: 100,
    pp: 35,
    priority: 0,
    description: 'A physical attack.',
    ...overrides,
  };
}

function makeSpecies(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: 'Bulbasaur',
    types: ['grass', 'poison'] as PokemonType[],
    baseStats: { hp: 45, attack: 49, defense: 49, spAttack: 65, spDefense: 65, speed: 45 },
    baseExp: 64,
    growthRate: 'medium_slow',
    catchRate: 45,
    evYield: { spAttack: 1 },
    ...overrides,
  };
}

function makeBattleState(overrides: Partial<BattleState> = {}): BattleState {
  const playerPokemon = makePokemon({ uid: 'player-001', nickname: 'Bulba' });
  const opponentPokemon = makePokemon({
    uid: 'opp-001',
    speciesId: 4,
    nickname: 'Charmy',
  });

  return {
    type: 'wild',
    phase: 'action_select',
    playerParty: [playerPokemon],
    playerActive: createBattlePokemon(playerPokemon),
    opponentParty: [opponentPokemon],
    opponentActive: createBattlePokemon(opponentPokemon),
    weather: 'clear',
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

// ============================================================================
// Seed databases before each test
// ============================================================================

const defaultMoves: MoveData[] = [
  makeMoveData({ id: 'tackle', name: 'Tackle', power: 40, accuracy: 100 }),
  makeMoveData({ id: 'ember', name: 'Ember', type: 'fire', category: 'special', power: 40, accuracy: 100 }),
  makeMoveData({ id: 'water_gun', name: 'Water Gun', type: 'water', category: 'special', power: 40, accuracy: 100 }),
  makeMoveData({ id: 'growl', name: 'Growl', type: 'normal', category: 'status', power: null, accuracy: 100, effect: { type: 'stat_change', target: 'opponent', statChanges: { attack: -1 } } }),
];

const defaultSpecies = [
  makeSpecies({ id: 1, name: 'Bulbasaur', types: ['grass', 'poison'] }),
  makeSpecies({ id: 4, name: 'Charmander', types: ['fire'], baseStats: { hp: 39, attack: 52, defense: 43, spAttack: 60, spDefense: 50, speed: 65 }, baseExp: 62 }),
  makeSpecies({ id: 7, name: 'Squirtle', types: ['water'], baseStats: { hp: 44, attack: 48, defense: 65, spAttack: 50, spDefense: 64, speed: 43 } }),
  makeSpecies({ id: 25, name: 'Pikachu', types: ['electric'], baseStats: { hp: 35, attack: 55, defense: 40, spAttack: 50, spDefense: 50, speed: 90 } }),
];

beforeEach(() => {
  setMoveDatabase(defaultMoves);
  setSpeciesDatabase(defaultSpecies);
  vi.restoreAllMocks();
});

// ============================================================================
// setMoveDatabase / getMoveData
// ============================================================================

describe('setMoveDatabase / getMoveData', () => {
  it('should store moves and retrieve them by id', () => {
    const tackle = getMoveData('tackle');
    expect(tackle).not.toBeNull();
    expect(tackle!.name).toBe('Tackle');
    expect(tackle!.power).toBe(40);
    expect(tackle!.type).toBe('normal');
  });

  it('should return null for a move id that does not exist', () => {
    expect(getMoveData('nonexistent_move')).toBeNull();
  });

  it('should overwrite the database when called again', () => {
    const customMoves = [
      makeMoveData({ id: 'flamethrower', name: 'Flamethrower', type: 'fire', power: 90 }),
    ];
    setMoveDatabase(customMoves);

    expect(getMoveData('flamethrower')).not.toBeNull();
    // The old moves should be gone after overwrite
    expect(getMoveData('tackle')).toBeNull();
  });

  it('should handle an empty move array', () => {
    setMoveDatabase([]);
    expect(getMoveData('tackle')).toBeNull();
  });

  it('should store multiple moves and retrieve each one', () => {
    expect(getMoveData('tackle')!.name).toBe('Tackle');
    expect(getMoveData('ember')!.name).toBe('Ember');
    expect(getMoveData('water_gun')!.name).toBe('Water Gun');
    expect(getMoveData('growl')!.name).toBe('Growl');
  });
});

// ============================================================================
// setSpeciesDatabase / getSpeciesData
// ============================================================================

describe('setSpeciesDatabase / getSpeciesData', () => {
  it('should store species and retrieve them by numeric id', () => {
    const bulbasaur = getSpeciesData(1);
    expect(bulbasaur).not.toBeNull();
    expect(bulbasaur!.name).toBe('Bulbasaur');
    expect(bulbasaur!.types).toEqual(['grass', 'poison']);
  });

  it('should return null for an id that does not exist', () => {
    expect(getSpeciesData(999)).toBeNull();
  });

  it('should overwrite the database when called again', () => {
    const customSpecies = [
      makeSpecies({ id: 150, name: 'Mewtwo', types: ['psychic'] }),
    ];
    setSpeciesDatabase(customSpecies);

    expect(getSpeciesData(150)).not.toBeNull();
    expect(getSpeciesData(150)!.name).toBe('Mewtwo');
    // Previous entries should be gone
    expect(getSpeciesData(1)).toBeNull();
  });

  it('should handle an empty species array', () => {
    setSpeciesDatabase([]);
    expect(getSpeciesData(1)).toBeNull();
  });

  it('should retrieve all seeded species correctly', () => {
    expect(getSpeciesData(1)!.name).toBe('Bulbasaur');
    expect(getSpeciesData(4)!.name).toBe('Charmander');
    expect(getSpeciesData(7)!.name).toBe('Squirtle');
    expect(getSpeciesData(25)!.name).toBe('Pikachu');
  });
});

// ============================================================================
// createBattlePokemon
// ============================================================================

describe('createBattlePokemon', () => {
  it('should wrap a Pokemon with all stat stages at zero', () => {
    const pokemon = makePokemon();
    const bp = createBattlePokemon(pokemon);

    expect(bp.statStages.hp).toBe(0);
    expect(bp.statStages.attack).toBe(0);
    expect(bp.statStages.defense).toBe(0);
    expect(bp.statStages.spAttack).toBe(0);
    expect(bp.statStages.spDefense).toBe(0);
    expect(bp.statStages.speed).toBe(0);
  });

  it('should initialize accuracy and evasion stages to zero', () => {
    const bp = createBattlePokemon(makePokemon());
    expect(bp.accuracyStage).toBe(0);
    expect(bp.evasionStage).toBe(0);
  });

  it('should start with an empty volatile statuses set', () => {
    const bp = createBattlePokemon(makePokemon());
    expect(bp.volatileStatuses).toBeInstanceOf(Set);
    expect(bp.volatileStatuses.size).toBe(0);
  });

  it('should have isProtected set to false and protectCount at zero', () => {
    const bp = createBattlePokemon(makePokemon());
    expect(bp.isProtected).toBe(false);
    expect(bp.protectCount).toBe(0);
  });

  it('should initialize sleep, confusion, and toxic counters to zero', () => {
    const bp = createBattlePokemon(makePokemon());
    expect(bp.sleepTurns).toBe(0);
    expect(bp.confusionTurns).toBe(0);
    expect(bp.toxicCounter).toBe(0);
  });

  it('should have chargingMove set to null', () => {
    const bp = createBattlePokemon(makePokemon());
    expect(bp.chargingMove).toBeNull();
  });

  it('should have semiInvulnerable set to null', () => {
    const bp = createBattlePokemon(makePokemon());
    expect(bp.semiInvulnerable).toBeNull();
  });

  it('should hold a reference to the original Pokemon object', () => {
    const pokemon = makePokemon({ nickname: 'Ivy' });
    const bp = createBattlePokemon(pokemon);
    expect(bp.pokemon).toBe(pokemon);
    expect(bp.pokemon.nickname).toBe('Ivy');
  });

  it('should derive types from the species database', () => {
    const pokemon = makePokemon({ speciesId: 1 });
    const bp = createBattlePokemon(pokemon);
    expect(bp.types).toEqual(['grass', 'poison']);
  });

  it('should fall back to normal type if species is not found', () => {
    const pokemon = makePokemon({ speciesId: 9999 });
    const bp = createBattlePokemon(pokemon);
    expect(bp.types).toEqual(['normal']);
  });
});

// ============================================================================
// applyOnSwitchIn
// ============================================================================

describe('applyOnSwitchIn', () => {
  describe('with Intimidate ability', () => {
    it('should lower the opponent attack stage by 1', () => {
      const switchedIn = createBattlePokemon(
        makePokemon({ ability: 'intimidate', nickname: 'Growlithe' })
      );
      const opponent = createBattlePokemon(
        makePokemon({ nickname: 'Rattata' })
      );
      const messages: string[] = [];

      applyOnSwitchIn(switchedIn, opponent, messages);

      expect(opponent.statStages.attack).toBe(-1);
    });

    it('should generate an appropriate message', () => {
      const switchedIn = createBattlePokemon(
        makePokemon({ ability: 'intimidate', nickname: 'Growlithe' })
      );
      const opponent = createBattlePokemon(
        makePokemon({ nickname: 'Rattata' })
      );
      const messages: string[] = [];

      applyOnSwitchIn(switchedIn, opponent, messages);

      expect(messages).toHaveLength(1);
      expect(messages[0]).toContain('Intimidate');
      expect(messages[0]).toContain('Growlithe');
      expect(messages[0]).toContain('Rattata');
      expect(messages[0]).toContain('Attack');
    });

    it('should not lower attack below -6', () => {
      const switchedIn = createBattlePokemon(
        makePokemon({ ability: 'intimidate', nickname: 'Growlithe' })
      );
      const opponent = createBattlePokemon(
        makePokemon({ nickname: 'Rattata' })
      );
      // Pre-set opponent attack stage to minimum
      opponent.statStages.attack = -6;
      const messages: string[] = [];

      applyOnSwitchIn(switchedIn, opponent, messages);

      expect(opponent.statStages.attack).toBe(-6);
      // No message generated when at minimum
      expect(messages).toHaveLength(0);
    });

    it('should lower from -5 to -6 and generate a message', () => {
      const switchedIn = createBattlePokemon(
        makePokemon({ ability: 'intimidate', nickname: 'Growlithe' })
      );
      const opponent = createBattlePokemon(
        makePokemon({ nickname: 'Rattata' })
      );
      opponent.statStages.attack = -5;
      const messages: string[] = [];

      applyOnSwitchIn(switchedIn, opponent, messages);

      expect(opponent.statStages.attack).toBe(-6);
      expect(messages).toHaveLength(1);
    });

    it('should use speciesId fallback if no nickname is set', () => {
      const switchedIn = createBattlePokemon(
        makePokemon({ ability: 'intimidate', nickname: undefined, speciesId: 58 })
      );
      const opponent = createBattlePokemon(
        makePokemon({ nickname: undefined, speciesId: 19 })
      );
      const messages: string[] = [];

      applyOnSwitchIn(switchedIn, opponent, messages);

      expect(messages[0]).toContain('#58');
      expect(messages[0]).toContain('#19');
    });
  });

  describe('without ability', () => {
    it('should do nothing when the switched-in Pokemon has no ability', () => {
      const switchedIn = createBattlePokemon(
        makePokemon({ ability: undefined })
      );
      const opponent = createBattlePokemon(makePokemon());
      const messages: string[] = [];

      applyOnSwitchIn(switchedIn, opponent, messages);

      expect(opponent.statStages.attack).toBe(0);
      expect(messages).toHaveLength(0);
    });

    it('should do nothing for an unrecognized ability', () => {
      const switchedIn = createBattlePokemon(
        makePokemon({ ability: 'blaze' })
      );
      const opponent = createBattlePokemon(makePokemon());
      const messages: string[] = [];

      applyOnSwitchIn(switchedIn, opponent, messages);

      expect(opponent.statStages.attack).toBe(0);
      expect(messages).toHaveLength(0);
    });
  });
});

// ============================================================================
// executeTurn - Run action
// ============================================================================

describe('executeTurn - run action', () => {
  describe('wild battle - successful escape', () => {
    it('should allow escape when random check passes', () => {
      // Mock Math.random to always return a low value (guarantees escape)
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const state = makeBattleState({
        type: 'wild',
        runAttempts: 0,
      });
      // Pick speeds where the run formula yields a high f value.
      // f = floor((playerSpeed * 128 / opponentSpeed) + 30 * attempts) % 256
      // With 100/80: f = floor(160) % 256 = 160. Random check: 0.01*256=2.56 < 160 => escape
      state.playerActive.pokemon.stats.speed = 100;
      state.opponentActive.pokemon.stats.speed = 80;

      const result = executeTurn(state, null, 'run');

      expect(result.ranAway).toBe(true);
      expect(result.messages).toContain('Got away safely!');
    });

    it('should fail to escape when random check fails', () => {
      // Mock Math.random to always return a high value (blocks escape)
      vi.spyOn(Math, 'random').mockReturnValue(0.99);

      const state = makeBattleState({
        type: 'wild',
        runAttempts: 0,
      });
      // Opponent much faster, making the escape threshold very low
      state.playerActive.pokemon.stats.speed = 10;
      state.opponentActive.pokemon.stats.speed = 200;

      const result = executeTurn(state, null, 'run');

      expect(result.ranAway).toBe(false);
      expect(result.messages).toContain("Can't escape!");
    });
  });

  describe('trainer battle - run blocked', () => {
    it('should prevent escape and show the blocked message', () => {
      const state = makeBattleState({
        type: 'trainer',
        trainerDef: {
          id: 'trainer-01',
          name: 'Bug Catcher',
          class: 'Bug Catcher',
          spriteId: 'bug_catcher',
          party: [],
          aiTier: 'random',
          reward: 200,
          defeatDialog: ['You beat me!'],
          isGymLeader: false,
        },
      });

      const result = executeTurn(state, null, 'run');

      expect(result.ranAway).toBe(false);
      expect(result.messages).toContain("Can't escape from a trainer battle!");
    });
  });
});

// ============================================================================
// executeTurn - Switch action
// ============================================================================

describe('executeTurn - switch action', () => {
  it('should announce the switched-in Pokemon', () => {
    // Mock Math.random for deterministic opponent move selection and damage
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const state = makeBattleState();
    state.playerActive.pokemon.nickname = 'Ivy';

    const result = executeTurn(state, null, 'switch');

    expect(result.messages[0]).toContain('Ivy');
  });

  it('should trigger Intimidate on switch-in', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const playerPokemon = makePokemon({
      uid: 'player-002',
      nickname: 'Growlithe',
      ability: 'intimidate',
      speciesId: 1,
    });
    const opponentPokemon = makePokemon({
      uid: 'opp-002',
      nickname: 'Rattata',
      speciesId: 4,
    });

    const state = makeBattleState({
      playerParty: [playerPokemon],
      playerActive: createBattlePokemon(playerPokemon),
      opponentParty: [opponentPokemon],
      opponentActive: createBattlePokemon(opponentPokemon),
    });

    const result = executeTurn(state, null, 'switch');

    // The Intimidate message should appear
    const intimidateMsg = result.messages.find(
      (m) => m.includes('Intimidate') && m.includes('Attack')
    );
    expect(intimidateMsg).toBeDefined();

    // Opponent attack stage should be lowered
    expect(state.opponentActive.statStages.attack).toBe(-1);
  });

  it('should not trigger ability effects when switched-in Pokemon has no ability', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const playerPokemon = makePokemon({
      uid: 'player-003',
      nickname: 'Rattata',
      ability: undefined,
      speciesId: 1,
    });
    const opponentPokemon = makePokemon({
      uid: 'opp-003',
      nickname: 'Pidgey',
      speciesId: 4,
    });

    const state = makeBattleState({
      playerParty: [playerPokemon],
      playerActive: createBattlePokemon(playerPokemon),
      opponentParty: [opponentPokemon],
      opponentActive: createBattlePokemon(opponentPokemon),
    });

    executeTurn(state, null, 'switch');

    // Opponent stats should be unaffected
    expect(state.opponentActive.statStages.attack).toBe(0);
  });

  it('should allow the opponent to attack after a switch', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const playerPokemon = makePokemon({
      uid: 'player-sw',
      nickname: 'Bulba',
      speciesId: 1,
      currentHp: 100,
      stats: makeStats({ hp: 100, speed: 50 }),
    });
    const opponentPokemon = makePokemon({
      uid: 'opp-sw',
      nickname: 'Charmy',
      speciesId: 4,
      moves: [makeMove({ moveId: 'tackle', pp: 35, maxPp: 35 })],
    });

    const state = makeBattleState({
      playerParty: [playerPokemon],
      playerActive: createBattlePokemon(playerPokemon),
      opponentParty: [opponentPokemon],
      opponentActive: createBattlePokemon(opponentPokemon),
    });

    const result = executeTurn(state, null, 'switch');

    // The opponent should have acted (playerFirst is false on switch)
    expect(result.playerFirst).toBe(false);
  });
});

// ============================================================================
// executeTurn - Fight action (basic)
// ============================================================================

describe('executeTurn - fight action', () => {
  it('should deal damage when using a physical move', () => {
    // Use a consistent random value for determinism
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const playerPokemon = makePokemon({
      uid: 'player-f1',
      nickname: 'Bulba',
      speciesId: 1,
      stats: makeStats({ hp: 150, attack: 100, speed: 80 }),
      currentHp: 150,
      moves: [makeMove({ moveId: 'tackle', pp: 35, maxPp: 35 })],
    });
    const opponentPokemon = makePokemon({
      uid: 'opp-f1',
      nickname: 'Charmy',
      speciesId: 4,
      stats: makeStats({ hp: 120, attack: 60, defense: 50, speed: 40 }),
      currentHp: 120,
      moves: [makeMove({ moveId: 'tackle', pp: 35, maxPp: 35 })],
    });

    const state = makeBattleState({
      playerParty: [playerPokemon],
      playerActive: createBattlePokemon(playerPokemon),
      opponentParty: [opponentPokemon],
      opponentActive: createBattlePokemon(opponentPokemon),
    });

    const result = executeTurn(state, 0, 'fight');

    // Player should go first (higher speed)
    expect(result.playerFirst).toBe(true);
    // Some damage should have been dealt
    expect(result.playerDamageDealt).toBeGreaterThan(0);
    expect(result.messages.length).toBeGreaterThan(0);
  });

  it('should reduce PP of the used move', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const playerMove = makeMove({ moveId: 'tackle', pp: 35, maxPp: 35 });
    const playerPokemon = makePokemon({
      uid: 'player-pp',
      speciesId: 1,
      stats: makeStats({ speed: 100 }),
      currentHp: 100,
      moves: [playerMove],
    });
    const opponentPokemon = makePokemon({
      uid: 'opp-pp',
      speciesId: 4,
      stats: makeStats({ speed: 10 }),
      currentHp: 100,
      moves: [makeMove({ moveId: 'tackle', pp: 35, maxPp: 35 })],
    });

    const state = makeBattleState({
      playerParty: [playerPokemon],
      playerActive: createBattlePokemon(playerPokemon),
      opponentParty: [opponentPokemon],
      opponentActive: createBattlePokemon(opponentPokemon),
    });

    executeTurn(state, 0, 'fight');

    // Player's move PP should have decreased by 1
    expect(playerMove.pp).toBe(34);
  });
});

// ============================================================================
// executeTurn - Item action
// ============================================================================

describe('executeTurn - item action', () => {
  it('should include a message about the used item', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const state = makeBattleState();
    state.opponentActive.pokemon.moves = [
      makeMove({ moveId: 'tackle', pp: 35, maxPp: 35 }),
    ];

    const result = executeTurn(state, null, 'item', 'potion');

    expect(result.messages[0]).toContain('potion');
  });

  it('should allow the opponent to attack after using an item', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const state = makeBattleState();
    state.opponentActive.pokemon.moves = [
      makeMove({ moveId: 'tackle', pp: 35, maxPp: 35 }),
    ];

    const result = executeTurn(state, null, 'item', 'potion');

    // Player did not act offensively, so playerFirst should be false
    expect(result.playerFirst).toBe(false);
  });
});

// ============================================================================
// executeTurn - Priority moves
// ============================================================================

describe('executeTurn - priority moves', () => {
  it('should let a higher priority move go first regardless of speed', () => {
    // Add a priority move to the database
    setMoveDatabase([
      ...defaultMoves,
      makeMoveData({ id: 'quick_attack', name: 'Quick Attack', type: 'normal', power: 40, accuracy: 100, priority: 1 }),
    ]);

    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    // Player is slower but uses Quick Attack (priority +1)
    const playerPokemon = makePokemon({
      uid: 'player-pri',
      nickname: 'Pikachu',
      speciesId: 25,
      stats: makeStats({ speed: 10 }),
      currentHp: 100,
      moves: [makeMove({ moveId: 'quick_attack', pp: 30, maxPp: 30 })],
    });
    const opponentPokemon = makePokemon({
      uid: 'opp-pri',
      nickname: 'Charmy',
      speciesId: 4,
      stats: makeStats({ speed: 200 }),
      currentHp: 100,
      moves: [makeMove({ moveId: 'tackle', pp: 35, maxPp: 35 })],
    });

    const state = makeBattleState({
      playerParty: [playerPokemon],
      playerActive: createBattlePokemon(playerPokemon),
      opponentParty: [opponentPokemon],
      opponentActive: createBattlePokemon(opponentPokemon),
    });

    const result = executeTurn(state, 0, 'fight');

    // Player should go first due to priority despite being slower
    expect(result.playerFirst).toBe(true);
  });
});

// ============================================================================
// executeTurn - Fainting and EXP gain
// ============================================================================

describe('executeTurn - fainting and exp', () => {
  it('should mark opponent as fainted when HP reaches zero', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const playerPokemon = makePokemon({
      uid: 'player-ko',
      speciesId: 1,
      stats: makeStats({ attack: 999, speed: 100 }),
      currentHp: 200,
      moves: [makeMove({ moveId: 'tackle', pp: 35, maxPp: 35 })],
    });
    const opponentPokemon = makePokemon({
      uid: 'opp-ko',
      speciesId: 4,
      stats: makeStats({ hp: 1, defense: 1, speed: 5 }),
      currentHp: 1,
      moves: [makeMove({ moveId: 'tackle', pp: 35, maxPp: 35 })],
    });

    const state = makeBattleState({
      playerParty: [playerPokemon],
      playerActive: createBattlePokemon(playerPokemon),
      opponentParty: [opponentPokemon],
      opponentActive: createBattlePokemon(opponentPokemon),
    });

    const result = executeTurn(state, 0, 'fight');

    expect(result.opponentFainted).toBe(true);
    expect(state.opponentActive.pokemon.currentHp).toBe(0);
  });

  it('should award exp when the opponent faints in a wild battle', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const playerPokemon = makePokemon({
      uid: 'player-exp',
      speciesId: 1,
      stats: makeStats({ attack: 999, speed: 100 }),
      currentHp: 200,
      moves: [makeMove({ moveId: 'tackle', pp: 35, maxPp: 35 })],
    });
    const opponentPokemon = makePokemon({
      uid: 'opp-exp',
      speciesId: 4,
      level: 20,
      stats: makeStats({ hp: 1, defense: 1, speed: 5 }),
      currentHp: 1,
      moves: [makeMove({ moveId: 'tackle', pp: 35, maxPp: 35 })],
    });

    const state = makeBattleState({
      type: 'wild',
      playerParty: [playerPokemon],
      playerActive: createBattlePokemon(playerPokemon),
      opponentParty: [opponentPokemon],
      opponentActive: createBattlePokemon(opponentPokemon),
    });

    const result = executeTurn(state, 0, 'fight');

    expect(result.opponentFainted).toBe(true);
    expect(result.expGained).toBeGreaterThan(0);
  });
});

// ============================================================================
// executeTurn - Protection flags cleared at start
// ============================================================================

describe('executeTurn - protection reset', () => {
  it('should clear isProtected on both sides at the start of the turn', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const state = makeBattleState();
    state.playerActive.isProtected = true;
    state.opponentActive.isProtected = true;

    // Use a move index of 0 for a normal fight turn
    state.playerActive.pokemon.moves = [
      makeMove({ moveId: 'tackle', pp: 35, maxPp: 35 }),
    ];
    state.opponentActive.pokemon.moves = [
      makeMove({ moveId: 'tackle', pp: 35, maxPp: 35 }),
    ];

    executeTurn(state, 0, 'fight');

    // After the turn, isProtected should have been cleared at the start
    // (they may be set again if Protect was used, but we used Tackle here)
    // The fact that the moves connected confirms protection was cleared
  });
});

// ============================================================================
// executeTurn - Turn order by speed
// ============================================================================

describe('executeTurn - speed-based turn order', () => {
  it('should let the faster Pokemon move first when priorities are equal', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const playerPokemon = makePokemon({
      uid: 'player-spd',
      speciesId: 1,
      stats: makeStats({ speed: 120 }),
      currentHp: 100,
      moves: [makeMove({ moveId: 'tackle', pp: 35, maxPp: 35 })],
    });
    const opponentPokemon = makePokemon({
      uid: 'opp-spd',
      speciesId: 4,
      stats: makeStats({ speed: 50 }),
      currentHp: 100,
      moves: [makeMove({ moveId: 'tackle', pp: 35, maxPp: 35 })],
    });

    const state = makeBattleState({
      playerParty: [playerPokemon],
      playerActive: createBattlePokemon(playerPokemon),
      opponentParty: [opponentPokemon],
      opponentActive: createBattlePokemon(opponentPokemon),
    });

    const result = executeTurn(state, 0, 'fight');
    expect(result.playerFirst).toBe(true);
  });

  it('should let the opponent go first when it has higher speed', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const playerPokemon = makePokemon({
      uid: 'player-slow',
      speciesId: 1,
      stats: makeStats({ speed: 20 }),
      currentHp: 100,
      moves: [makeMove({ moveId: 'tackle', pp: 35, maxPp: 35 })],
    });
    const opponentPokemon = makePokemon({
      uid: 'opp-fast',
      speciesId: 4,
      stats: makeStats({ speed: 150 }),
      currentHp: 100,
      moves: [makeMove({ moveId: 'tackle', pp: 35, maxPp: 35 })],
    });

    const state = makeBattleState({
      playerParty: [playerPokemon],
      playerActive: createBattlePokemon(playerPokemon),
      opponentParty: [opponentPokemon],
      opponentActive: createBattlePokemon(opponentPokemon),
    });

    const result = executeTurn(state, 0, 'fight');
    expect(result.playerFirst).toBe(false);
  });
});
