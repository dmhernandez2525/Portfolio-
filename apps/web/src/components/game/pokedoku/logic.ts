import type { PokemonSpecies, Category } from './types';

// Seeded random for daily grids
export class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }
}

const LEGENDARY_IDS = [
  144, 145, 146, 150, 151, // Gen 1
  243, 244, 245, 249, 250, 251, // Gen 2
  377, 378, 379, 380, 381, 382, 383, 384, 385, 386 // Gen 3
];

export function checkCriteria(pokemon: PokemonSpecies, category: Category): boolean {
  switch (category.type) {
    case 'type':
      return pokemon.types.includes(category.value as string);
    case 'generation':
      return pokemon.generation === category.value as number;
    case 'legendary':
      return LEGENDARY_IDS.includes(pokemon.id);
    case 'monotype':
      return pokemon.types.length === 1;
    case 'evolution':
      return pokemon.id % 2 === 0; // Fallback since evolvesTo isn't in base data
    case 'stat':
      const statName = (category.value as string).split('>')[0] as keyof typeof pokemon.baseStats;
      const threshold = parseInt((category.value as string).split('>')[1]);
      return pokemon.baseStats[statName] >= threshold;
    default:
      return false;
  }
}

export function generateDailyGrid(_pokemonList: PokemonSpecies[]): { rows: Category[], cols: Category[] } {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const rng = new SeededRandom(seed);

  const types = ['grass', 'fire', 'water', 'bug', 'normal', 'poison', 'electric', 'ground', 'fairy', 'fighting', 'psychic', 'rock', 'ghost', 'ice', 'dragon', 'steel', 'dark'];
  const gens = [1, 2, 3];

  const rowCategories: Category[] = [];
  const colCategories: Category[] = [];

  // Logic to ensure intersection exists (simplified for now)
  // In a production version, we'd cross-reference to ensure at least one pokemon fits each intersection
  
  // Row 1: Type
  const t1 = rng.pick(types);
  rowCategories.push({ id: 'r1', name: t1.charAt(0).toUpperCase() + t1.slice(1), type: 'type', value: t1 });
  
  // Row 2: Generation
  const g1 = rng.pick(gens);
  rowCategories.push({ id: 'r2', name: `Gen ${g1}`, type: 'generation', value: g1 });
  
  // Row 3: Special
  const specials: Category[] = [
    { id: 'r3_1', name: 'Legendary', type: 'legendary', value: 'legendary' },
    { id: 'r3_2', name: 'Monotype', type: 'monotype', value: 'monotype' },
    { id: 'r3_3', name: 'Evolves', type: 'evolution', value: 'evolution' }
  ];
  rowCategories.push(rng.pick(specials));

  // Cols: 3 unique types different from row types
  const colTypes = types.filter(t => t !== t1);
  const selectedColTypes: string[] = [];
  for (let i = 0; i < 3; i++) {
    const t = rng.pick(colTypes.filter(ct => !selectedColTypes.includes(ct)));
    selectedColTypes.push(t);
    colCategories.push({ id: `c${i+1}`, name: t.charAt(0).toUpperCase() + t.slice(1), type: 'type', value: t });
  }

  return { rows: rowCategories, cols: colCategories };
}

export function searchPokemon(query: string, pokemonList: PokemonSpecies[]): PokemonSpecies[] {
  const lowerQuery = query.toLowerCase();
  return pokemonList
    .filter(p => p.name.toLowerCase().includes(lowerQuery))
    .slice(0, 10);
}
