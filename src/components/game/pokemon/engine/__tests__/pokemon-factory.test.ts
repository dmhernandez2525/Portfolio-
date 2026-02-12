// Pokemon Factory - Unit Tests
// Tests for createPokemon covering stat generation, IVs, EVs, natures,
// moves, abilities, shininess, and unique IDs.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SpeciesData, Pokemon, StatName } from '../types';
import { calculateStat } from '../constants';

// -- Mock battle-engine's getMoveData --

vi.mock('../battle-engine', () => ({
  getMoveData: vi.fn((id: string) => {
    const moveDb: Record<string, { pp: number }> = {
      tackle: { pp: 35 },
      growl: { pp: 40 },
      vine_whip: { pp: 25 },
      leech_seed: { pp: 10 },
      razor_leaf: { pp: 25 },
    };
    return moveDb[id] ?? null;
  }),
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
    abilities: ['overgrow'],
  };
}

function makeMultiAbilitySpecies(): SpeciesData {
  return {
    ...makeBulbasaurSpecies(),
    id: 25,
    name: 'Pikachu',
    types: ['electric'],
    baseStats: { hp: 35, attack: 55, defense: 40, spAttack: 50, spDefense: 50, speed: 90 },
    abilities: ['static', 'lightning_rod'],
  };
}

function makeNoAbilitySpecies(): SpeciesData {
  const species = makeBulbasaurSpecies();
  species.abilities = undefined;
  return species;
}

// -- Tests --

describe('createPokemon', () => {
  // Import dynamically after mocks are set up
  let createPokemon: (species: SpeciesData, level: number) => Pokemon;

  beforeEach(async () => {
    const mod = await import('../pokemon-factory');
    createPokemon = mod.createPokemon;
  });

  it('creates pokemon with correct speciesId and level', () => {
    const species = makeBulbasaurSpecies();
    const pokemon = createPokemon(species, 10);

    expect(pokemon.speciesId).toBe(1);
    expect(pokemon.level).toBe(10);
  });

  it('generates random IVs between 0 and 31 (inclusive)', () => {
    const species = makeBulbasaurSpecies();
    const pokemon = createPokemon(species, 5);

    const statKeys: StatName[] = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'];
    for (const stat of statKeys) {
      expect(pokemon.ivs[stat]).toBeGreaterThanOrEqual(0);
      expect(pokemon.ivs[stat]).toBeLessThanOrEqual(31);
      // Verify IVs are integers
      expect(Number.isInteger(pokemon.ivs[stat])).toBe(true);
    }
  });

  it('starts with 0 EVs in all stats', () => {
    const species = makeBulbasaurSpecies();
    const pokemon = createPokemon(species, 5);

    const statKeys: StatName[] = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'];
    for (const stat of statKeys) {
      expect(pokemon.evs[stat]).toBe(0);
    }
  });

  it('calculates stats correctly from base stats, IVs, and level', () => {
    const species = makeBulbasaurSpecies();
    const pokemon = createPokemon(species, 10);

    // Verify each stat matches the Gen 3 formula applied to the pokemon's
    // actual IVs, EVs, level, and nature.
    const statKeys: StatName[] = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'];
    for (const stat of statKeys) {
      const expected = calculateStat(
        species.baseStats[stat],
        pokemon.ivs[stat],
        pokemon.evs[stat],
        pokemon.level,
        pokemon.nature,
        stat,
      );
      expect(pokemon.stats[stat]).toBe(expected);
    }
  });

  it('assigns a random nature from the 25 available natures', () => {
    const validNatures = [
      'hardy', 'lonely', 'brave', 'adamant', 'naughty',
      'bold', 'docile', 'relaxed', 'impish', 'lax',
      'timid', 'hasty', 'serious', 'jolly', 'naive',
      'modest', 'mild', 'quiet', 'bashful', 'rash',
      'calm', 'gentle', 'sassy', 'careful', 'quirky',
    ];
    const species = makeBulbasaurSpecies();
    const pokemon = createPokemon(species, 10);

    expect(validNatures).toContain(pokemon.nature);
  });

  it('sets currentHp equal to max HP stat', () => {
    const species = makeBulbasaurSpecies();
    const pokemon = createPokemon(species, 10);

    expect(pokemon.currentHp).toBe(pokemon.stats.hp);
  });

  it('sets friendship to 70 (default)', () => {
    const species = makeBulbasaurSpecies();
    const pokemon = createPokemon(species, 10);

    expect(pokemon.friendship).toBe(70);
  });

  it('generates a unique UID for each pokemon', () => {
    const species = makeBulbasaurSpecies();
    const pokemon1 = createPokemon(species, 10);
    const pokemon2 = createPokemon(species, 10);

    expect(pokemon1.uid).toBeTruthy();
    expect(pokemon2.uid).toBeTruthy();
    expect(pokemon1.uid).not.toBe(pokemon2.uid);
  });

  it('isShiny is a boolean value', () => {
    const species = makeBulbasaurSpecies();
    const pokemon = createPokemon(species, 10);

    expect(typeof pokemon.isShiny).toBe('boolean');
  });

  it('assigns moves from learnset, up to 4, prioritizing highest level moves', () => {
    const species = makeBulbasaurSpecies();

    // At level 15, available moves: tackle(1), growl(1), leech_seed(7), vine_whip(13)
    // Sorted by highest level: vine_whip(13), leech_seed(7), tackle(1), growl(1)
    const pokemon = createPokemon(species, 15);

    expect(pokemon.moves.length).toBeLessThanOrEqual(4);
    expect(pokemon.moves.length).toBeGreaterThan(0);

    const moveIds = pokemon.moves.map(m => m.moveId);
    expect(moveIds).toContain('vine_whip');
    expect(moveIds).toContain('leech_seed');
    // Should pick the 4 highest-level moves available at level 15
    expect(moveIds).toHaveLength(4);
  });

  it('limits moves to 4 even when more are available in learnset', () => {
    const species = makeBulbasaurSpecies();

    // At level 20, all 5 moves are available, but only 4 should be assigned
    const pokemon = createPokemon(species, 20);

    expect(pokemon.moves).toHaveLength(4);
    // The 4 highest-level moves: razor_leaf(20), vine_whip(13), leech_seed(7),
    // then one of tackle/growl (both level 1)
    const moveIds = pokemon.moves.map(m => m.moveId);
    expect(moveIds).toContain('razor_leaf');
    expect(moveIds).toContain('vine_whip');
    expect(moveIds).toContain('leech_seed');
  });

  it('assigns each move with correct pp and maxPp from move data', () => {
    const species = makeBulbasaurSpecies();
    const pokemon = createPokemon(species, 15);

    for (const move of pokemon.moves) {
      expect(move.pp).toBe(move.maxPp);
      expect(move.pp).toBeGreaterThan(0);
    }

    // Check a specific known move
    const vineWhip = pokemon.moves.find(m => m.moveId === 'vine_whip');
    expect(vineWhip).toBeDefined();
    expect(vineWhip!.pp).toBe(25);
    expect(vineWhip!.maxPp).toBe(25);
  });

  it('assigns ability from species abilities array', () => {
    const species = makeBulbasaurSpecies();
    const pokemon = createPokemon(species, 10);

    expect(pokemon.ability).toBe('overgrow');
  });

  it('picks from multiple available abilities', () => {
    const species = makeMultiAbilitySpecies();

    // Create several pokemon and verify all get a valid ability
    const abilities = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const pokemon = createPokemon(species, 10);
      expect(['static', 'lightning_rod']).toContain(pokemon.ability);
      abilities.add(pokemon.ability!);
    }

    // With 50 attempts, we should have seen both abilities
    // (probability of not seeing one: (0.5)^50, effectively zero)
    expect(abilities.size).toBe(2);
  });

  it('sets ability to undefined when species has no abilities', () => {
    const species = makeNoAbilitySpecies();
    const pokemon = createPokemon(species, 10);

    expect(pokemon.ability).toBeUndefined();
  });

  it('sets status to null on newly created pokemon', () => {
    const species = makeBulbasaurSpecies();
    const pokemon = createPokemon(species, 10);

    expect(pokemon.status).toBeNull();
  });

  it('sets nickname to species name', () => {
    const species = makeBulbasaurSpecies();
    const pokemon = createPokemon(species, 10);

    expect(pokemon.nickname).toBe('Bulbasaur');
  });
});
