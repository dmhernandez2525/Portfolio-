// ============================================================================
// Pokemon RPG Engine — Pokemon Factory
// ============================================================================
// Creates Pokemon instances from species data + level.

import type { Pokemon, PokemonStats, PokemonMove, Nature, SpeciesData, StatName } from './types';
import { calculateStat, getExpForLevel, type GrowthRate } from './constants';
import { getMoveData } from './battle-engine';

const NATURES: Nature[] = [
  'hardy', 'lonely', 'brave', 'adamant', 'naughty',
  'bold', 'docile', 'relaxed', 'impish', 'lax',
  'timid', 'hasty', 'serious', 'jolly', 'naive',
  'modest', 'mild', 'quiet', 'bashful', 'rash',
  'calm', 'gentle', 'sassy', 'careful', 'quirky',
];

const STAT_KEYS: StatName[] = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'];

function randomIVs(): PokemonStats {
  return {
    hp: Math.floor(Math.random() * 32),
    attack: Math.floor(Math.random() * 32),
    defense: Math.floor(Math.random() * 32),
    spAttack: Math.floor(Math.random() * 32),
    spDefense: Math.floor(Math.random() * 32),
    speed: Math.floor(Math.random() * 32),
  };
}

function zeroStats(): PokemonStats {
  return { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 };
}

function generateUid(): string {
  return `pkmn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createPokemon(species: SpeciesData, level: number): Pokemon {
  const nature = NATURES[Math.floor(Math.random() * NATURES.length)];
  const ivs = randomIVs();
  const evs = zeroStats();

  const stats: PokemonStats = {} as PokemonStats;
  for (const stat of STAT_KEYS) {
    stats[stat] = calculateStat(
      species.baseStats[stat], ivs[stat], evs[stat],
      level, nature, stat,
    );
  }

  // Pick up to 4 moves: highest-level moves the Pokemon learns at or below current level
  const eligible = species.learnset
    .filter(e => e.level <= level)
    .sort((a, b) => b.level - a.level);

  const moveIds = eligible
    .slice(0, 4)
    .map(e => e.moveId);

  // Fallback: if no moves available, give Tackle
  if (moveIds.length === 0) {
    moveIds.push('tackle');
  }

  const moves: PokemonMove[] = moveIds.map(id => {
    const data = getMoveData(id);
    const pp = data?.pp ?? 35;
    return { moveId: id, pp, maxPp: pp };
  });

  const exp = getExpForLevel(species.growthRate as GrowthRate, level);

  return {
    uid: generateUid(),
    speciesId: species.id,
    nickname: species.name,
    level,
    exp,
    nature,
    ivs,
    evs,
    stats,
    currentHp: stats.hp,
    moves,
    status: null,
    friendship: 70,
    isShiny: Math.random() < 1 / 8192,
    originalTrainer: 'Player',
    caughtBall: 'poke-ball',
  };
}
