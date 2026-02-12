// Evolution System - Unit Tests
// Tests for checkEvolution, evolvePokemon, getMovesForLevel, getSpeciesName,
// and setEvolutionDatabase.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  checkEvolution,
  evolvePokemon,
  getMovesForLevel,
  getSpeciesName,
  setEvolutionDatabase,
} from '../evolution-system';
import type { Pokemon, SpeciesData, PokemonStats } from '../types';

// -- Mock dependencies --

vi.mock('../battle-engine', () => ({
  getSpeciesData: vi.fn((id: number) => {
    // Return minimal species data used by evolvePokemon / recalculateStats
    const speciesMap: Record<number, { name: string; types: string[]; baseStats: PokemonStats }> = {
      1: { name: 'Bulbasaur', types: ['grass', 'poison'], baseStats: { hp: 45, attack: 49, defense: 49, spAttack: 65, spDefense: 65, speed: 45 } },
      2: { name: 'Ivysaur', types: ['grass', 'poison'], baseStats: { hp: 60, attack: 62, defense: 63, spAttack: 80, spDefense: 80, speed: 60 } },
    };
    return speciesMap[id] ?? null;
  }),
  recalculateStats: vi.fn((pokemon: Pokemon) => {
    // Simple mock: just bump all stats by 10 to simulate recalculation
    for (const stat of ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'] as const) {
      pokemon.stats[stat] += 10;
    }
  }),
}));

vi.mock('../time-system', () => ({
  isDaytime: vi.fn(() => true),
  isNighttime: vi.fn(() => false),
}));

// -- Helpers --

function makeBulbasaurSpecies(): SpeciesData {
  return {
    id: 1,
    name: 'Bulbasaur',
    types: ['grass', 'poison'],
    baseStats: { hp: 45, attack: 49, defense: 49, spAttack: 65, spDefense: 65, speed: 45 },
    baseExp: 64,
    catchRate: 45,
    growthRate: 'medium_slow',
    learnset: [
      { level: 1, moveId: 'tackle' },
      { level: 1, moveId: 'growl' },
      { level: 7, moveId: 'leech_seed' },
      { level: 13, moveId: 'vine_whip' },
      { level: 20, moveId: 'razor_leaf' },
    ],
    evolvesTo: [
      { speciesId: 2, condition: { type: 'level', level: 16 } },
    ],
    spriteId: 'bulbasaur',
    generation: 1,
  };
}

function makeIvysaurSpecies(): SpeciesData {
  return {
    id: 2,
    name: 'Ivysaur',
    types: ['grass', 'poison'],
    baseStats: { hp: 60, attack: 62, defense: 63, spAttack: 80, spDefense: 80, speed: 60 },
    baseExp: 142,
    catchRate: 45,
    growthRate: 'medium_slow',
    learnset: [
      { level: 1, moveId: 'tackle' },
      { level: 1, moveId: 'growl' },
      { level: 7, moveId: 'leech_seed' },
      { level: 13, moveId: 'vine_whip' },
      { level: 20, moveId: 'razor_leaf' },
      { level: 28, moveId: 'solar_beam' },
    ],
    evolvesTo: [
      { speciesId: 3, condition: { type: 'level', level: 32 } },
    ],
    spriteId: 'ivysaur',
    generation: 1,
  };
}

function makeEeveeSpecies(): SpeciesData {
  return {
    id: 133,
    name: 'Eevee',
    types: ['normal'],
    baseStats: { hp: 55, attack: 55, defense: 50, spAttack: 45, spDefense: 65, speed: 55 },
    baseExp: 65,
    catchRate: 45,
    growthRate: 'medium_fast',
    learnset: [
      { level: 1, moveId: 'tackle' },
      { level: 8, moveId: 'sand_attack' },
    ],
    evolvesTo: [
      { speciesId: 134, condition: { type: 'item', item: 'water_stone' } },
    ],
    spriteId: 'eevee',
    generation: 1,
  };
}

function makePokemon(overrides: Partial<Pokemon> = {}): Pokemon {
  return {
    uid: 'test-uid-001',
    speciesId: 1,
    nickname: undefined,
    level: 10,
    exp: 1000,
    nature: 'adamant',
    ivs: { hp: 15, attack: 15, defense: 15, spAttack: 15, spDefense: 15, speed: 15 },
    evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
    stats: { hp: 30, attack: 20, defense: 18, spAttack: 22, spDefense: 22, speed: 16 },
    currentHp: 30,
    moves: [{ moveId: 'tackle', pp: 35, maxPp: 35 }],
    status: null,
    friendship: 70,
    isShiny: false,
    originalTrainer: 'Player',
    caughtBall: 'poke-ball',
    ...overrides,
  };
}

// -- Tests --

describe('setEvolutionDatabase', () => {
  beforeEach(() => {
    // Reset the database before each test
    setEvolutionDatabase([]);
  });

  it('populates the database and allows querying by species name', () => {
    const bulbasaur = makeBulbasaurSpecies();
    const ivysaur = makeIvysaurSpecies();
    setEvolutionDatabase([bulbasaur, ivysaur]);

    expect(getSpeciesName(1)).toBe('Bulbasaur');
    expect(getSpeciesName(2)).toBe('Ivysaur');
  });

  it('overwrites previous data when called again', () => {
    setEvolutionDatabase([makeBulbasaurSpecies()]);
    expect(getSpeciesName(1)).toBe('Bulbasaur');

    setEvolutionDatabase([makeIvysaurSpecies()]);
    // Bulbasaur is no longer in the database
    expect(getSpeciesName(1)).toBe('Pokemon #1');
    expect(getSpeciesName(2)).toBe('Ivysaur');
  });
});

describe('checkEvolution', () => {
  beforeEach(() => {
    setEvolutionDatabase([makeBulbasaurSpecies(), makeIvysaurSpecies(), makeEeveeSpecies()]);
  });

  it('returns canEvolve: false when pokemon does not meet level requirement', () => {
    const pokemon = makePokemon({ speciesId: 1, level: 10 });
    const result = checkEvolution(pokemon, 'level_up');

    expect(result.canEvolve).toBe(false);
    expect(result.evolvesTo).toBeNull();
    expect(result.condition).toBeNull();
  });

  it('returns target speciesId when level requirement is met', () => {
    const pokemon = makePokemon({ speciesId: 1, level: 16 });
    const result = checkEvolution(pokemon, 'level_up');

    expect(result.canEvolve).toBe(true);
    expect(result.evolvesTo).toBe(2);
    expect(result.condition).toEqual({ type: 'level', level: 16 });
  });

  it('returns canEvolve: false for wrong trigger type', () => {
    const pokemon = makePokemon({ speciesId: 1, level: 16 });
    const result = checkEvolution(pokemon, 'item');

    expect(result.canEvolve).toBe(false);
  });

  it('handles item-based evolution with correct item', () => {
    const pokemon = makePokemon({ speciesId: 133, level: 10 });
    const result = checkEvolution(pokemon, 'item', 'water_stone');

    expect(result.canEvolve).toBe(true);
    expect(result.evolvesTo).toBe(134);
  });

  it('rejects item-based evolution with wrong item', () => {
    const pokemon = makePokemon({ speciesId: 133, level: 10 });
    const result = checkEvolution(pokemon, 'item', 'fire_stone');

    expect(result.canEvolve).toBe(false);
  });

  it('returns canEvolve: false when species has no evolutions', () => {
    // Add a species with no evolvesTo
    setEvolutionDatabase([
      {
        ...makeBulbasaurSpecies(),
        id: 999,
        name: 'NoEvo',
        evolvesTo: undefined,
      },
    ]);
    const pokemon = makePokemon({ speciesId: 999, level: 100 });
    const result = checkEvolution(pokemon, 'level_up');

    expect(result.canEvolve).toBe(false);
    expect(result.evolvesTo).toBeNull();
  });
});

describe('evolvePokemon', () => {
  it('changes speciesId and recalculates stats', () => {
    const pokemon = makePokemon({ speciesId: 1, level: 16 });
    const originalHp = pokemon.stats.hp;

    const evolved = evolvePokemon(pokemon, 2);

    expect(evolved.speciesId).toBe(2);
    // recalculateStats mock bumps stats by 10
    expect(evolved.stats.hp).toBe(originalHp + 10);
  });

  it('preserves uid and level after evolution', () => {
    const pokemon = makePokemon({ uid: 'my-bulbasaur', speciesId: 1, level: 16 });

    const evolved = evolvePokemon(pokemon, 2);

    expect(evolved.uid).toBe('my-bulbasaur');
    expect(evolved.level).toBe(16);
  });
});

describe('getMovesForLevel', () => {
  beforeEach(() => {
    setEvolutionDatabase([makeBulbasaurSpecies()]);
  });

  it('returns moves learned at the exact level', () => {
    const moves = getMovesForLevel(1, 7);
    expect(moves).toEqual(['leech_seed']);
  });

  it('returns multiple moves if more than one is learned at that level', () => {
    const moves = getMovesForLevel(1, 1);
    expect(moves).toEqual(['tackle', 'growl']);
  });

  it('returns empty array if no moves are learned at that level', () => {
    const moves = getMovesForLevel(1, 5);
    expect(moves).toEqual([]);
  });

  it('returns empty array for unknown species', () => {
    const moves = getMovesForLevel(9999, 1);
    expect(moves).toEqual([]);
  });
});

describe('getSpeciesName', () => {
  beforeEach(() => {
    setEvolutionDatabase([makeBulbasaurSpecies()]);
  });

  it('returns the species name from the database', () => {
    expect(getSpeciesName(1)).toBe('Bulbasaur');
  });

  it('returns a fallback string for unknown species', () => {
    expect(getSpeciesName(9999)).toBe('Pokemon #9999');
  });
});
