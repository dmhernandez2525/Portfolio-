export interface PokemonSpecies {
  id: number;
  name: string;
  types: string[];
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
  };
  generation: number;
  abilities: string[];
  spriteId: string;
}

export type CategoryType = 'type' | 'generation' | 'stat' | 'evolution' | 'legendary' | 'monotype';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  value: string | number;
}

export interface GridState {
  [key: string]: number | null; // cell index (0-8) -> pokemon id
}

export interface PokedokuState {
  rowCategories: Category[];
  colCategories: Category[];
  guesses: GridState;
  remainingGuesses: number;
  isComplete: boolean;
  isVictory: boolean;
}
