// ============================================================================
// Pokemon RPG Engine - Save/Load Manager
// ============================================================================

import type { GameSave, GameVersion } from './types';

const SAVE_KEY_PREFIX = 'pokemon_rpg_save_';

function getKey(version: GameVersion): string {
  return `${SAVE_KEY_PREFIX}${version}`;
}

export function saveGame(save: GameSave): boolean {
  try {
    const key = getKey(save.version);
    const data = JSON.stringify(save);
    localStorage.setItem(key, data);
    return true;
  } catch {
    console.error('[SaveManager] Failed to save game');
    return false;
  }
}

export function loadGame(version: GameVersion): GameSave | null {
  try {
    const key = getKey(version);
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data) as GameSave;
  } catch {
    console.error('[SaveManager] Failed to load game');
    return null;
  }
}

export function deleteSave(version: GameVersion): void {
  localStorage.removeItem(getKey(version));
}

export function hasSave(version: GameVersion): boolean {
  return localStorage.getItem(getKey(version)) !== null;
}

export function getAllSaves(): { version: GameVersion; save: GameSave }[] {
  const versions: GameVersion[] = ['red-blue', 'gold-silver', 'ruby-sapphire'];
  const saves: { version: GameVersion; save: GameSave }[] = [];

  for (const v of versions) {
    const save = loadGame(v);
    if (save) saves.push({ version: v, save });
  }

  return saves;
}

export function createNewSave(
  version: GameVersion,
  playerName: string,
  rivalName: string,
  startingMap: string
): GameSave {
  return {
    version,
    playerName,
    rivalName,
    player: {
      x: 0, y: 0, tileX: 10, tileY: 9,
      direction: 'down', isMoving: false, moveProgress: 0,
      spriteFrame: 0, speed: 2, isSurfing: false, isBiking: false,
    },
    party: [],
    pcBoxes: Array.from({ length: 14 }, (_, i) => ({
      name: `BOX ${i + 1}`,
      pokemon: new Array(30).fill(null),
    })),
    bag: [
      { itemId: 'potion', quantity: 5 },
      { itemId: 'poke-ball', quantity: 5 },
    ],
    money: 3000,
    badges: [],
    pokedex: {},
    storyFlags: {},
    currentMap: startingMap,
    playTime: 0,
    timestamp: Date.now(),
  };
}

export function formatPlayTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}:${m.toString().padStart(2, '0')}`;
}
