import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  setItemDatabase, getItemData,
  addItem, removeItem, hasItem, getItemCount, getItemsByCategory,
  useItem,
  canAfford, buyItem, sellItem,
} from '../inventory-system';
import type { BagItem, ItemData, Pokemon, PokemonMove } from '../types';

vi.mock('../battle-engine', () => ({
  recalculateStats: vi.fn(),
}));

// --- Fixtures ---

function makeItem(overrides: Partial<ItemData> = {}): ItemData {
  return {
    id: 'potion',
    name: 'Potion',
    category: 'medicine',
    description: 'Restores 20 HP.',
    price: 300,
    isKeyItem: false,
    effect: { type: 'heal_hp', value: 20 },
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
    uid: 'poke-1',
    speciesId: 25,
    nickname: 'Pikachu',
    level: 50,
    exp: 0,
    nature: 'hardy',
    ability: 'static',
    isShiny: false,
    ivs: { hp: 15, attack: 15, defense: 15, spAttack: 15, spDefense: 15, speed: 15 },
    evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
    stats: { hp: 100, attack: 80, defense: 60, spAttack: 80, spDefense: 60, speed: 90 },
    currentHp: 100,
    moves: [makeMove()],
    status: null,
    friendship: 70,
    types: ['electric'],
    ...overrides,
  } as Pokemon;
}

// --- Tests ---

describe('inventory-system', () => {
  beforeEach(() => {
    setItemDatabase([
      makeItem({ id: 'potion', name: 'Potion', category: 'medicine', price: 300, effect: { type: 'heal_hp', value: 20 } }),
      makeItem({ id: 'super-potion', name: 'Super Potion', category: 'medicine', price: 700, effect: { type: 'heal_hp', value: 50 } }),
      makeItem({ id: 'antidote', name: 'Antidote', category: 'medicine', price: 100, effect: { type: 'heal_status', status: 'poison' } }),
      makeItem({ id: 'full-heal', name: 'Full Heal', category: 'medicine', price: 600, effect: { type: 'heal_status', status: 'all' } }),
      makeItem({ id: 'revive', name: 'Revive', category: 'medicine', price: 1500, effect: { type: 'revive', value: 0.5 } }),
      makeItem({ id: 'poke-ball', name: 'Poke Ball', category: 'pokeballs', price: 200, effect: { type: 'pokeball', catchMultiplier: 1 } }),
      makeItem({ id: 'ether', name: 'Ether', category: 'medicine', price: 0, effect: { type: 'heal_pp', value: 10 } }),
      makeItem({ id: 'rare-candy', name: 'Rare Candy', category: 'medicine', price: 0, effect: { type: 'rare_candy' } }),
      makeItem({ id: 'bicycle', name: 'Bicycle', category: 'key_items', price: 1000000, isKeyItem: true }),
      makeItem({ id: 'full-restore', name: 'Full Restore', category: 'medicine', price: 3000, effect: { type: 'heal_hp', value: 999, curesStatus: true } }),
    ]);
  });

  describe('setItemDatabase / getItemData', () => {
    it('retrieves a stored item', () => {
      const item = getItemData('potion');
      expect(item).not.toBeNull();
      expect(item!.name).toBe('Potion');
    });

    it('returns null for unknown items', () => {
      expect(getItemData('nonexistent')).toBeNull();
    });

    it('overwrites database on re-call', () => {
      setItemDatabase([makeItem({ id: 'test-item', name: 'Test' })]);
      expect(getItemData('test-item')).not.toBeNull();
      expect(getItemData('potion')).toBeNull();
    });
  });

  describe('addItem', () => {
    it('adds a new item to empty bag', () => {
      const bag = addItem([], 'potion', 3);
      expect(bag).toHaveLength(1);
      expect(bag[0]).toEqual({ itemId: 'potion', quantity: 3 });
    });

    it('increases quantity of existing item', () => {
      const bag: BagItem[] = [{ itemId: 'potion', quantity: 2 }];
      const result = addItem(bag, 'potion', 3);
      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBe(5);
    });

    it('defaults to quantity 1', () => {
      const bag = addItem([], 'potion');
      expect(bag[0].quantity).toBe(1);
    });
  });

  describe('removeItem', () => {
    it('decreases quantity', () => {
      const bag: BagItem[] = [{ itemId: 'potion', quantity: 5 }];
      const result = removeItem(bag, 'potion', 2);
      expect(result[0].quantity).toBe(3);
    });

    it('removes entry when quantity hits zero', () => {
      const bag: BagItem[] = [{ itemId: 'potion', quantity: 1 }];
      const result = removeItem(bag, 'potion', 1);
      expect(result).toHaveLength(0);
    });

    it('removes entry when quantity goes negative', () => {
      const bag: BagItem[] = [{ itemId: 'potion', quantity: 1 }];
      const result = removeItem(bag, 'potion', 5);
      expect(result).toHaveLength(0);
    });
  });

  describe('hasItem / getItemCount', () => {
    const bag: BagItem[] = [{ itemId: 'potion', quantity: 3 }];

    it('returns true when item exists', () => {
      expect(hasItem(bag, 'potion')).toBe(true);
    });

    it('returns false when item missing', () => {
      expect(hasItem(bag, 'super-potion')).toBe(false);
    });

    it('returns correct count', () => {
      expect(getItemCount(bag, 'potion')).toBe(3);
    });

    it('returns 0 for missing item', () => {
      expect(getItemCount(bag, 'super-potion')).toBe(0);
    });
  });

  describe('getItemsByCategory', () => {
    it('filters by category', () => {
      const bag: BagItem[] = [
        { itemId: 'potion', quantity: 1 },
        { itemId: 'poke-ball', quantity: 5 },
        { itemId: 'antidote', quantity: 2 },
      ];
      const medicine = getItemsByCategory(bag, 'medicine');
      expect(medicine).toHaveLength(2);
      expect(medicine.map(b => b.itemId)).toContain('potion');
      expect(medicine.map(b => b.itemId)).toContain('antidote');
    });

    it('returns empty for no matches', () => {
      const bag: BagItem[] = [{ itemId: 'potion', quantity: 1 }];
      expect(getItemsByCategory(bag, 'tms')).toHaveLength(0);
    });
  });

  describe('useItem', () => {
    it('heals HP with potion', () => {
      const pokemon = makePokemon({ currentHp: 50 });
      const bag: BagItem[] = [{ itemId: 'potion', quantity: 2 }];
      const result = useItem(bag, 'potion', pokemon);
      expect(result.success).toBe(true);
      expect(pokemon.currentHp).toBe(70);
      expect(result.bag[0].quantity).toBe(1);
    });

    it('caps HP at max', () => {
      const pokemon = makePokemon({ currentHp: 95 });
      const bag: BagItem[] = [{ itemId: 'potion', quantity: 1 }];
      useItem(bag, 'potion', pokemon);
      expect(pokemon.currentHp).toBe(100);
    });

    it('fails on full HP pokemon', () => {
      const pokemon = makePokemon({ currentHp: 100 });
      const bag: BagItem[] = [{ itemId: 'potion', quantity: 1 }];
      const result = useItem(bag, 'potion', pokemon);
      expect(result.success).toBe(false);
    });

    it('fails on fainted pokemon for heal', () => {
      const pokemon = makePokemon({ currentHp: 0 });
      const bag: BagItem[] = [{ itemId: 'potion', quantity: 1 }];
      const result = useItem(bag, 'potion', pokemon);
      expect(result.success).toBe(false);
    });

    it('cures status with antidote', () => {
      const pokemon = makePokemon({ status: 'poison' as never });
      const bag: BagItem[] = [{ itemId: 'antidote', quantity: 1 }];
      const result = useItem(bag, 'antidote', pokemon);
      expect(result.success).toBe(true);
      expect(pokemon.status).toBeNull();
    });

    it('fails antidote on wrong status', () => {
      const pokemon = makePokemon({ status: 'burn' as never });
      const bag: BagItem[] = [{ itemId: 'antidote', quantity: 1 }];
      const result = useItem(bag, 'antidote', pokemon);
      expect(result.success).toBe(false);
    });

    it('full heal cures any status', () => {
      const pokemon = makePokemon({ status: 'burn' as never });
      const bag: BagItem[] = [{ itemId: 'full-heal', quantity: 1 }];
      const result = useItem(bag, 'full-heal', pokemon);
      expect(result.success).toBe(true);
      expect(pokemon.status).toBeNull();
    });

    it('fails heal_status on healthy pokemon', () => {
      const pokemon = makePokemon({ status: null });
      const bag: BagItem[] = [{ itemId: 'antidote', quantity: 1 }];
      const result = useItem(bag, 'antidote', pokemon);
      expect(result.success).toBe(false);
    });

    it('revives a fainted pokemon', () => {
      const pokemon = makePokemon({ currentHp: 0 });
      const bag: BagItem[] = [{ itemId: 'revive', quantity: 1 }];
      const result = useItem(bag, 'revive', pokemon);
      expect(result.success).toBe(true);
      expect(pokemon.currentHp).toBe(50); // 50% of 100 HP
    });

    it('fails revive on alive pokemon', () => {
      const pokemon = makePokemon({ currentHp: 50 });
      const bag: BagItem[] = [{ itemId: 'revive', quantity: 1 }];
      const result = useItem(bag, 'revive', pokemon);
      expect(result.success).toBe(false);
    });

    it('restores PP with ether', () => {
      const pokemon = makePokemon({ moves: [makeMove({ pp: 20, maxPp: 35 })] });
      const bag: BagItem[] = [{ itemId: 'ether', quantity: 1 }];
      const result = useItem(bag, 'ether', pokemon);
      expect(result.success).toBe(true);
      expect(pokemon.moves[0].pp).toBe(30);
    });

    it('fails ether when all PP full', () => {
      const pokemon = makePokemon({ moves: [makeMove({ pp: 35, maxPp: 35 })] });
      const bag: BagItem[] = [{ itemId: 'ether', quantity: 1 }];
      const result = useItem(bag, 'ether', pokemon);
      expect(result.success).toBe(false);
    });

    it('levels up with rare candy', () => {
      const pokemon = makePokemon({ level: 50 });
      const bag: BagItem[] = [{ itemId: 'rare-candy', quantity: 1 }];
      const result = useItem(bag, 'rare-candy', pokemon);
      expect(result.success).toBe(true);
      expect(pokemon.level).toBe(51);
      expect(result.message).toContain('Lv. 51');
    });

    it('fails rare candy at level 100', () => {
      const pokemon = makePokemon({ level: 100 });
      const bag: BagItem[] = [{ itemId: 'rare-candy', quantity: 1 }];
      const result = useItem(bag, 'rare-candy', pokemon);
      expect(result.success).toBe(false);
    });

    it('returns error for unknown item', () => {
      const pokemon = makePokemon();
      const result = useItem([], 'nonexistent', pokemon);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Unknown item!');
    });

    it('returns error when bag is empty of item', () => {
      const pokemon = makePokemon({ currentHp: 50 });
      const result = useItem([], 'potion', pokemon);
      expect(result.success).toBe(false);
    });

    it('heals HP and cures status with full-restore', () => {
      const pokemon = makePokemon({ currentHp: 30, status: 'burn' as never });
      const bag: BagItem[] = [{ itemId: 'full-restore', quantity: 1 }];
      const result = useItem(bag, 'full-restore', pokemon);
      expect(result.success).toBe(true);
      expect(pokemon.currentHp).toBe(100);
      expect(pokemon.status).toBeNull();
    });
  });

  describe('canAfford', () => {
    it('returns true when money is sufficient', () => {
      expect(canAfford(1000, 300)).toBe(true);
    });

    it('returns true at exact amount', () => {
      expect(canAfford(300, 300)).toBe(true);
    });

    it('returns false when insufficient', () => {
      expect(canAfford(100, 300)).toBe(false);
    });

    it('accounts for quantity', () => {
      expect(canAfford(600, 300, 2)).toBe(true);
      expect(canAfford(500, 300, 2)).toBe(false);
    });
  });

  describe('buyItem', () => {
    it('buys item successfully', () => {
      const result = buyItem([], 1000, 'potion', 1);
      expect(result.success).toBe(true);
      expect(result.money).toBe(700);
      expect(result.bag).toHaveLength(1);
      expect(result.bag[0].quantity).toBe(1);
    });

    it('fails with insufficient money', () => {
      const result = buyItem([], 100, 'potion', 1);
      expect(result.success).toBe(false);
      expect(result.money).toBe(100);
    });

    it('fails for unknown item', () => {
      const result = buyItem([], 9999, 'nonexistent', 1);
      expect(result.success).toBe(false);
    });

    it('buys multiple at once', () => {
      const result = buyItem([], 1000, 'potion', 3);
      expect(result.success).toBe(true);
      expect(result.money).toBe(100); // 1000 - 300*3
      expect(result.bag[0].quantity).toBe(3);
    });
  });

  describe('sellItem', () => {
    it('sells item for half price', () => {
      const bag: BagItem[] = [{ itemId: 'potion', quantity: 3 }];
      const result = sellItem(bag, 500, 'potion', 1);
      expect(result.success).toBe(true);
      expect(result.money).toBe(650); // 500 + 300/2
      expect(result.bag[0].quantity).toBe(2);
    });

    it('cannot sell key items', () => {
      const bag: BagItem[] = [{ itemId: 'bicycle', quantity: 1 }];
      const result = sellItem(bag, 0, 'bicycle', 1);
      expect(result.success).toBe(false);
    });

    it('fails when not enough quantity', () => {
      const bag: BagItem[] = [{ itemId: 'potion', quantity: 1 }];
      const result = sellItem(bag, 500, 'potion', 5);
      expect(result.success).toBe(false);
    });

    it('fails for unknown item', () => {
      const result = sellItem([], 500, 'nonexistent', 1);
      expect(result.success).toBe(false);
    });
  });
});
