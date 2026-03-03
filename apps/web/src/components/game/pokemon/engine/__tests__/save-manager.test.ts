// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import type { GameSave } from '../types';
import {
  saveGame,
  loadGame,
  deleteSave,
  hasSave,
  getAllSaves,
  createNewSave,
  formatPlayTime,
} from '../save-manager';

function makeSave(overrides: Partial<GameSave> = {}): GameSave {
  return {
    version: 'red-blue',
    playerName: 'RED',
    rivalName: 'BLUE',
    player: {
      x: 0, y: 0, tileX: 10, tileY: 9,
      direction: 'down', isMoving: false, moveProgress: 0,
      spriteFrame: 0, speed: 2, isSurfing: false, isBiking: false,
    },
    party: [],
    pcBoxes: [],
    bag: [],
    money: 3000,
    badges: [],
    pokedex: {},
    storyFlags: {},
    currentMap: 'pallet_town',
    playTime: 0,
    timestamp: Date.now(),
    ...overrides,
  } as GameSave;
}

describe('save-manager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ---- saveGame / loadGame ----

  describe('saveGame / loadGame', () => {
    it('round-trips a save: save then load returns the same data', () => {
      const save = makeSave({ playerName: 'ASH', money: 5000 });
      saveGame(save);
      const loaded = loadGame('red-blue');
      expect(loaded).toEqual(save);
    });

    it('saveGame returns true on success', () => {
      const save = makeSave();
      expect(saveGame(save)).toBe(true);
    });

    it('loadGame returns null when no save exists', () => {
      expect(loadGame('gold-silver')).toBeNull();
    });

    it('loadGame returns null for corrupted data', () => {
      localStorage.setItem('pokemon_rpg_save_red-blue', '{{{not valid json');
      expect(loadGame('red-blue')).toBeNull();
    });
  });

  // ---- deleteSave ----

  describe('deleteSave', () => {
    it('removes the save from localStorage', () => {
      const save = makeSave();
      saveGame(save);
      expect(hasSave('red-blue')).toBe(true);

      deleteSave('red-blue');
      expect(hasSave('red-blue')).toBe(false);
      expect(loadGame('red-blue')).toBeNull();
    });
  });

  // ---- hasSave ----

  describe('hasSave', () => {
    it('returns true when a save exists', () => {
      saveGame(makeSave());
      expect(hasSave('red-blue')).toBe(true);
    });

    it('returns false when no save exists', () => {
      expect(hasSave('ruby-sapphire')).toBe(false);
    });
  });

  // ---- getAllSaves ----

  describe('getAllSaves', () => {
    it('returns an empty array when no saves exist', () => {
      expect(getAllSaves()).toEqual([]);
    });

    it('returns all existing saves across versions', () => {
      const redSave = makeSave({ version: 'red-blue' });
      const goldSave = makeSave({ version: 'gold-silver', playerName: 'GOLD' });
      const rubySave = makeSave({ version: 'ruby-sapphire', playerName: 'BRENDAN' });

      saveGame(redSave);
      saveGame(goldSave);
      saveGame(rubySave);

      const all = getAllSaves();
      expect(all).toHaveLength(3);

      const versions = all.map((entry) => entry.version);
      expect(versions).toContain('red-blue');
      expect(versions).toContain('gold-silver');
      expect(versions).toContain('ruby-sapphire');

      const goldEntry = all.find((e) => e.version === 'gold-silver');
      expect(goldEntry?.save.playerName).toBe('GOLD');
    });
  });

  // ---- createNewSave ----

  describe('createNewSave', () => {
    it('returns a save with all required fields and correct values', () => {
      const save = createNewSave('red-blue', 'RED', 'BLUE', 'pallet_town');

      expect(save.version).toBe('red-blue');
      expect(save.playerName).toBe('RED');
      expect(save.rivalName).toBe('BLUE');
      expect(save.currentMap).toBe('pallet_town');
      expect(save.party).toEqual([]);
      expect(save.badges).toEqual([]);
      expect(save.pokedex).toEqual({});
      expect(save.storyFlags).toEqual({});
      expect(save.playTime).toBe(0);
      expect(save.timestamp).toBeGreaterThan(0);
      expect(save.player.direction).toBe('down');
    });

    it('creates 14 PC boxes with 30 slots each', () => {
      const save = createNewSave('gold-silver', 'GOLD', 'SILVER', 'new_bark_town');
      expect(save.pcBoxes).toHaveLength(14);

      for (const box of save.pcBoxes) {
        expect(box.pokemon).toHaveLength(30);
        expect(box.pokemon.every((slot) => slot === null)).toBe(true);
      }
    });

    it('includes starter items: 5 potions and 5 poke-balls', () => {
      const save = createNewSave('ruby-sapphire', 'BRENDAN', 'MAY', 'littleroot_town');
      expect(save.bag).toHaveLength(2);

      const potion = save.bag.find((item) => item.itemId === 'potion');
      const pokeball = save.bag.find((item) => item.itemId === 'poke-ball');

      expect(potion).toBeDefined();
      expect(potion?.quantity).toBe(5);
      expect(pokeball).toBeDefined();
      expect(pokeball?.quantity).toBe(5);
    });

    it('sets starting money to 3000', () => {
      const save = createNewSave('red-blue', 'RED', 'BLUE', 'pallet_town');
      expect(save.money).toBe(3000);
    });
  });

  // ---- formatPlayTime ----

  describe('formatPlayTime', () => {
    it('formats 0 seconds as "0:00"', () => {
      expect(formatPlayTime(0)).toBe('0:00');
    });

    it('formats 3661 seconds as "1:01"', () => {
      expect(formatPlayTime(3661)).toBe('1:01');
    });

    it('formats 7200 seconds as "2:00"', () => {
      expect(formatPlayTime(7200)).toBe('2:00');
    });
  });
});
