// ============================================================================
// Pokemon RPG — Save Hook
// ============================================================================

import { useCallback, useRef } from 'react';
import type { GameSave, GameVersion } from '../engine/types';
import { saveGame, loadGame, createNewSave, formatPlayTime } from '../engine/save-manager';

export function useSave() {
  const playTimeRef = useRef(0);
  const lastSaveRef = useRef<number>(0);

  const newGame = useCallback((
    version: GameVersion,
    playerName: string,
    rivalName: string,
    startingMap: string
  ): GameSave => {
    playTimeRef.current = 0;
    const save = createNewSave(version, playerName, rivalName, startingMap);
    saveGame(save);
    return save;
  }, []);

  const load = useCallback((version: GameVersion): GameSave | null => {
    const save = loadGame(version);
    if (save) {
      playTimeRef.current = save.playTime;
    }
    return save;
  }, []);

  const save = useCallback((currentSave: GameSave): boolean => {
    const updated = {
      ...currentSave,
      playTime: playTimeRef.current,
      timestamp: Date.now(),
    };
    return saveGame(updated);
  }, []);

  const updatePlayTime = useCallback((dt: number) => {
    playTimeRef.current += dt;
  }, []);

  const getPlayTime = useCallback(() => {
    return formatPlayTime(playTimeRef.current);
  }, []);

  const autoSave = useCallback((currentSave: GameSave) => {
    const now = Date.now();
    // Auto-save every 60 seconds
    if (now - lastSaveRef.current > 60000) {
      lastSaveRef.current = now;
      save(currentSave);
    }
  }, [save]);

  return { newGame, load, save, updatePlayTime, getPlayTime, autoSave };
}
