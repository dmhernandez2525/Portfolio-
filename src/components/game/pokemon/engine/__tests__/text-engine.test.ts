// =============================================================================
// Pokemon RPG Engine - Text / Dialog Engine Test Suite
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  createTextState,
  updateText,
  advanceText,
  getCurrentDisplayText,
  isTextComplete,
  isWaitingForInput,
} from '../text-engine';
import type { TextState } from '../text-engine';
import { TEXT_SPEED } from '../constants';

// -- Fixtures --

function makeState(overrides: Partial<TextState> = {}): TextState {
  return {
    lines: ['Hello world!', 'Second line.'],
    currentLine: 0,
    charIndex: 0,
    speed: TEXT_SPEED,
    isComplete: false,
    waitingForInput: false,
    ...overrides,
  };
}

// =============================================================================
// createTextState
// =============================================================================

describe('createTextState', () => {
  it('should initialise with the given lines and default values', () => {
    const state = createTextState(['Line A', 'Line B']);
    expect(state.lines).toEqual(['Line A', 'Line B']);
    expect(state.currentLine).toBe(0);
    expect(state.charIndex).toBe(0);
    expect(state.speed).toBe(TEXT_SPEED);
    expect(state.isComplete).toBe(false);
    expect(state.waitingForInput).toBe(false);
  });

  it('should mark empty input as immediately complete', () => {
    const state = createTextState([]);
    expect(state.isComplete).toBe(true);
  });

  it('should not mark a single-line input as complete', () => {
    const state = createTextState(['Only line']);
    expect(state.isComplete).toBe(false);
  });
});

// =============================================================================
// updateText
// =============================================================================

describe('updateText', () => {
  it('should return the same state if already complete', () => {
    const state = makeState({ isComplete: true });
    const result = updateText(state);
    expect(result).toBe(state);
  });

  it('should mark complete if the current line is undefined', () => {
    const state = makeState({ lines: [], currentLine: 0 });
    const result = updateText(state);
    expect(result.isComplete).toBe(true);
  });

  it('should return the same state if waiting for input', () => {
    const state = makeState({ waitingForInput: true });
    const result = updateText(state);
    expect(result).toBe(state);
  });

  it('should advance charIndex by speed on each tick', () => {
    const state = makeState({ charIndex: 0 });
    const result = updateText(state);
    expect(result.charIndex).toBe(TEXT_SPEED);
    expect(result.waitingForInput).toBe(false);
  });

  it('should set waitingForInput when the entire line has been typed', () => {
    const line = 'Hello world!';
    const state = makeState({
      lines: [line],
      charIndex: line.length - 1, // one tick away from finishing
    });
    const result = updateText(state);
    expect(result.charIndex).toBe(line.length);
    expect(result.waitingForInput).toBe(true);
  });
});

// =============================================================================
// advanceText
// =============================================================================

describe('advanceText', () => {
  it('should return the same state if already complete', () => {
    const state = makeState({ isComplete: true });
    const result = advanceText(state);
    expect(result).toBe(state);
  });

  it('should skip to end of current line if still typing', () => {
    const line = 'Hello world!';
    const state = makeState({ lines: [line, 'Next'], charIndex: 3 });
    const result = advanceText(state);
    expect(result.charIndex).toBe(line.length);
    expect(result.waitingForInput).toBe(true);
    expect(result.currentLine).toBe(0);
  });

  it('should move to the next line when current line is fully displayed', () => {
    const lines = ['First line', 'Second line'];
    const state = makeState({
      lines,
      currentLine: 0,
      charIndex: lines[0].length,
      waitingForInput: true,
    });
    const result = advanceText(state);
    expect(result.currentLine).toBe(1);
    expect(result.charIndex).toBe(0);
    expect(result.waitingForInput).toBe(false);
    expect(result.isComplete).toBe(false);
  });

  it('should mark complete when advancing past the last line', () => {
    const lines = ['Only line'];
    const state = makeState({
      lines,
      currentLine: 0,
      charIndex: lines[0].length,
      waitingForInput: true,
    });
    const result = advanceText(state);
    expect(result.isComplete).toBe(true);
    expect(result.waitingForInput).toBe(false);
  });
});

// =============================================================================
// getCurrentDisplayText
// =============================================================================

describe('getCurrentDisplayText', () => {
  it('should return an empty string when charIndex is 0', () => {
    const state = makeState({ charIndex: 0 });
    expect(getCurrentDisplayText(state)).toBe('');
  });

  it('should return the correct substring based on charIndex', () => {
    const state = makeState({ lines: ['ABCDEF'], charIndex: 4 });
    expect(getCurrentDisplayText(state)).toBe('ABCD');
  });

  it('should return an empty string when the current line does not exist', () => {
    const state = makeState({ lines: [], currentLine: 0 });
    expect(getCurrentDisplayText(state)).toBe('');
  });

  it('should floor fractional charIndex values', () => {
    const state = makeState({ lines: ['Hello'], charIndex: 2.7 });
    expect(getCurrentDisplayText(state)).toBe('He');
  });
});

// =============================================================================
// isTextComplete / isWaitingForInput
// =============================================================================

describe('isTextComplete', () => {
  it('should return true when state.isComplete is true', () => {
    expect(isTextComplete(makeState({ isComplete: true }))).toBe(true);
  });

  it('should return false when state.isComplete is false', () => {
    expect(isTextComplete(makeState({ isComplete: false }))).toBe(false);
  });
});

describe('isWaitingForInput', () => {
  it('should return true when state.waitingForInput is true', () => {
    expect(isWaitingForInput(makeState({ waitingForInput: true }))).toBe(true);
  });

  it('should return false when state.waitingForInput is false', () => {
    expect(isWaitingForInput(makeState({ waitingForInput: false }))).toBe(false);
  });
});
