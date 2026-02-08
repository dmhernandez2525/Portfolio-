// ============================================================================
// Pokemon RPG Engine — Text / Dialog Engine
// ============================================================================
// Handles typewriter-style text rendering for RPG dialogs.

import { TEXT_SPEED } from './constants';

export interface TextState {
  lines: string[];
  currentLine: number;
  charIndex: number;
  speed: number;
  isComplete: boolean;
  waitingForInput: boolean;
}

export function createTextState(lines: string[]): TextState {
  return {
    lines,
    currentLine: 0,
    charIndex: 0,
    speed: TEXT_SPEED,
    isComplete: lines.length === 0,
    waitingForInput: false,
  };
}

export function updateText(state: TextState): TextState {
  if (state.isComplete) return state;

  const currentLine = state.lines[state.currentLine];
  if (!currentLine) return { ...state, isComplete: true };

  if (state.waitingForInput) return state;

  const newCharIndex = state.charIndex + state.speed;

  if (newCharIndex >= currentLine.length) {
    return {
      ...state,
      charIndex: currentLine.length,
      waitingForInput: true,
    };
  }

  return { ...state, charIndex: newCharIndex };
}

export function advanceText(state: TextState): TextState {
  if (state.isComplete) return state;

  const currentLine = state.lines[state.currentLine];

  // If still typing, show full line
  if (state.charIndex < currentLine.length) {
    return { ...state, charIndex: currentLine.length, waitingForInput: true };
  }

  // Move to next line
  const nextLine = state.currentLine + 1;
  if (nextLine >= state.lines.length) {
    return { ...state, isComplete: true, waitingForInput: false };
  }

  return {
    ...state,
    currentLine: nextLine,
    charIndex: 0,
    waitingForInput: false,
  };
}

export function getCurrentDisplayText(state: TextState): string {
  const line = state.lines[state.currentLine];
  if (!line) return '';
  return line.substring(0, Math.floor(state.charIndex));
}

export function isTextComplete(state: TextState): boolean {
  return state.isComplete;
}

export function isWaitingForInput(state: TextState): boolean {
  return state.waitingForInput;
}
