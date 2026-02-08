// ============================================================================
// Pokemon RPG Engine — Evolution System
// ============================================================================

import type { Pokemon, SpeciesData, EvolutionCondition } from './types';
import { getSpeciesData, recalculateStats } from './battle-engine';

// --- Species data lookup for evolution chains ---

let speciesDataMap: Record<number, SpeciesData> = {};

export function setEvolutionDatabase(species: SpeciesData[]) {
  speciesDataMap = {};
  for (const s of species) {
    speciesDataMap[s.id] = s;
  }
}

function getFullSpeciesData(id: number): SpeciesData | null {
  return speciesDataMap[id] ?? null;
}

// --- Check if a Pokemon can evolve ---

export interface EvolutionCheck {
  canEvolve: boolean;
  evolvesTo: number | null;
  condition: EvolutionCondition | null;
}

export function checkEvolution(pokemon: Pokemon, trigger: 'level_up' | 'item' | 'trade', itemUsed?: string): EvolutionCheck {
  const species = getFullSpeciesData(pokemon.speciesId);
  if (!species?.evolvesTo || species.evolvesTo.length === 0) {
    return { canEvolve: false, evolvesTo: null, condition: null };
  }

  for (const evo of species.evolvesTo) {
    const cond = evo.condition;

    switch (cond.type) {
      case 'level':
        if (trigger === 'level_up' && cond.level && pokemon.level >= cond.level) {
          return { canEvolve: true, evolvesTo: evo.speciesId, condition: cond };
        }
        break;

      case 'item':
        if (trigger === 'item' && cond.item && cond.item === itemUsed) {
          return { canEvolve: true, evolvesTo: evo.speciesId, condition: cond };
        }
        break;

      case 'trade':
        if (trigger === 'trade') {
          return { canEvolve: true, evolvesTo: evo.speciesId, condition: cond };
        }
        break;

      case 'happiness':
        if (trigger === 'level_up' && pokemon.friendship >= 220) {
          return { canEvolve: true, evolvesTo: evo.speciesId, condition: cond };
        }
        break;
    }
  }

  return { canEvolve: false, evolvesTo: null, condition: null };
}

// --- Evolve a Pokemon ---

export function evolvePokemon(pokemon: Pokemon, newSpeciesId: number): Pokemon {
  const oldName = pokemon.nickname ?? getSpeciesData(pokemon.speciesId)?.name;

  const evolved: Pokemon = {
    ...pokemon,
    speciesId: newSpeciesId,
    // Clear nickname if it matched the old species name
    nickname: pokemon.nickname === oldName ? undefined : pokemon.nickname,
  };

  // Recalculate stats with new base stats
  recalculateStats(evolved);

  return evolved;
}

// --- Get species name ---

export function getSpeciesName(speciesId: number): string {
  const species = getFullSpeciesData(speciesId);
  return species?.name ?? `Pokemon #${speciesId}`;
}

// --- Learn moves on level up ---

export function getMovesForLevel(speciesId: number, level: number): string[] {
  const species = getFullSpeciesData(speciesId);
  if (!species) return [];
  return species.learnset
    .filter(entry => entry.level === level)
    .map(entry => entry.moveId);
}

export function getStarterMoves(speciesId: number, level: number): string[] {
  const species = getFullSpeciesData(speciesId);
  if (!species) return [];

  // Get all moves learnable at or below the Pokemon's level
  const available = species.learnset
    .filter(entry => entry.level <= level)
    .sort((a, b) => b.level - a.level);

  // Take the 4 most recent moves
  return available.slice(0, 4).map(entry => entry.moveId);
}
