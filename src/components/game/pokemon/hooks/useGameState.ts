// ============================================================================
// Pokemon RPG — Master Game State Hook
// ============================================================================

import { useReducer, useCallback } from 'react';
import type {
  GameState, GameScreen, GameVersion, GameMap, Player,
  BattleState, Pokemon, BagItem, PokedexEntry, PCBox,
} from '../engine/types';
// Constants available if needed for map calculations

// --- Actions ---

type GameAction =
  | { type: 'SET_SCREEN'; screen: GameScreen }
  | { type: 'SET_VERSION'; version: GameVersion }
  | { type: 'SET_MAP'; map: GameMap }
  | { type: 'SET_PLAYER'; player: Player }
  | { type: 'SET_BATTLE'; battle: BattleState | null }
  | { type: 'SET_DIALOG'; lines: string[] | null }
  | { type: 'ADVANCE_DIALOG' }
  | { type: 'TOGGLE_MENU' }
  | { type: 'SET_PAUSED'; paused: boolean }
  | { type: 'TICK'; dt: number }
  | { type: 'INIT_SAVE'; data: {
      playerName: string; party: Pokemon[]; bag: BagItem[];
      money: number; badges: string[]; pokedex: Record<number, PokedexEntry>;
      pcBoxes: PCBox[]; currentMap: string;
    }};

// --- Initial state ---

const initialState: GameState = {
  screen: 'title',
  version: null,
  save: null,
  currentMap: null,
  player: {
    x: 0, y: 0, tileX: 0, tileY: 0,
    direction: 'down', isMoving: false, moveProgress: 0,
    spriteFrame: 0, speed: 2, isSurfing: false, isBiking: false,
  },
  battleState: null,
  dialog: null,
  menuOpen: false,
  paused: false,
  frameCount: 0,
  deltaTime: 0,
};

// --- Reducer ---

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen, menuOpen: false };

    case 'SET_VERSION':
      return { ...state, version: action.version };

    case 'SET_MAP':
      return { ...state, currentMap: action.map };

    case 'SET_PLAYER':
      return { ...state, player: action.player };

    case 'SET_BATTLE':
      return {
        ...state,
        battleState: action.battle,
        screen: action.battle ? 'battle' : 'overworld',
      };

    case 'SET_DIALOG':
      if (action.lines) {
        return {
          ...state,
          dialog: { lines: action.lines, currentLine: 0, charIndex: 0 },
          screen: 'dialog',
        };
      }
      return { ...state, dialog: null, screen: 'overworld' };

    case 'ADVANCE_DIALOG':
      if (!state.dialog) return state;
      if (state.dialog.currentLine < state.dialog.lines.length - 1) {
        return {
          ...state,
          dialog: { ...state.dialog, currentLine: state.dialog.currentLine + 1, charIndex: 0 },
        };
      }
      return { ...state, dialog: null, screen: 'overworld' };

    case 'TOGGLE_MENU':
      return {
        ...state,
        menuOpen: !state.menuOpen,
        screen: state.menuOpen ? 'overworld' : 'menu',
      };

    case 'SET_PAUSED':
      return { ...state, paused: action.paused };

    case 'TICK':
      return {
        ...state,
        frameCount: state.frameCount + 1,
        deltaTime: action.dt,
      };

    default:
      return state;
  }
}

// --- Hook ---

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const setScreen = useCallback((screen: GameScreen) =>
    dispatch({ type: 'SET_SCREEN', screen }), []);

  const setVersion = useCallback((version: GameVersion) =>
    dispatch({ type: 'SET_VERSION', version }), []);

  const setMap = useCallback((map: GameMap) =>
    dispatch({ type: 'SET_MAP', map }), []);

  const setPlayer = useCallback((player: Player) =>
    dispatch({ type: 'SET_PLAYER', player }), []);

  const setBattle = useCallback((battle: BattleState | null) =>
    dispatch({ type: 'SET_BATTLE', battle }), []);

  const setDialog = useCallback((lines: string[] | null) =>
    dispatch({ type: 'SET_DIALOG', lines }), []);

  const advanceDialog = useCallback(() =>
    dispatch({ type: 'ADVANCE_DIALOG' }), []);

  const toggleMenu = useCallback(() =>
    dispatch({ type: 'TOGGLE_MENU' }), []);

  const setPaused = useCallback((paused: boolean) =>
    dispatch({ type: 'SET_PAUSED', paused }), []);

  const tick = useCallback((dt: number) =>
    dispatch({ type: 'TICK', dt }), []);

  return {
    state,
    setScreen, setVersion, setMap, setPlayer,
    setBattle, setDialog, advanceDialog,
    toggleMenu, setPaused, tick,
  };
}
