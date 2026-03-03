// ============================================================================
// Pokemon RPG Engine - Input Manager
// ============================================================================

import type { InputState } from './types';

export type InputCallback = (state: InputState) => void;

// Key mappings: keyboard key → InputState field
const KEY_MAP: Record<string, keyof InputState> = {
  ArrowUp: 'up',    w: 'up',    W: 'up',
  ArrowDown: 'down', s: 'down',  S: 'down',
  ArrowLeft: 'left', a: 'left',  A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right',
  z: 'a',     Z: 'a',     Enter: 'a',  ' ': 'a',
  x: 'b',     X: 'b',     Backspace: 'b', Escape: 'b',
  p: 'start', P: 'start',
  o: 'select', O: 'select',
};

function createEmptyInput(): InputState {
  return {
    up: false, down: false, left: false, right: false,
    a: false, b: false, start: false, select: false,
  };
}

export class InputManager {
  private state: InputState = createEmptyInput();
  private justPressed: InputState = createEmptyInput();
  private prevState: InputState = createEmptyInput();
  private enabled = true;

  private handleKeyDown = (e: KeyboardEvent) => {
    const field = KEY_MAP[e.key];
    if (!field || !this.enabled) return;
    e.preventDefault();
    this.state[field] = true;
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    const field = KEY_MAP[e.key];
    if (!field) return;
    e.preventDefault();
    this.state[field] = false;
  };

  attach() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  detach() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.state = createEmptyInput();
    this.justPressed = createEmptyInput();
    this.prevState = createEmptyInput();
  }

  /** Call once per frame before reading input. Updates justPressed. */
  update() {
    const keys = Object.keys(this.state) as (keyof InputState)[];
    for (const key of keys) {
      this.justPressed[key] = this.state[key] && !this.prevState[key];
      this.prevState[key] = this.state[key];
    }
  }

  /** True while the button is held down. */
  isHeld(button: keyof InputState): boolean {
    return this.enabled && this.state[button];
  }

  /** True only on the first frame the button is pressed. */
  isJustPressed(button: keyof InputState): boolean {
    return this.enabled && this.justPressed[button];
  }

  /** Get a snapshot of currently held directions (for movement). */
  getDirection(): { x: number; y: number } {
    if (!this.enabled) return { x: 0, y: 0 };
    let x = 0, y = 0;
    if (this.state.left) x -= 1;
    if (this.state.right) x += 1;
    if (this.state.up) y -= 1;
    if (this.state.down) y += 1;
    return { x, y };
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.state = createEmptyInput();
      this.justPressed = createEmptyInput();
    }
  }

  /** Touch input: set a button state directly (for mobile d-pad). */
  setButton(button: keyof InputState, pressed: boolean) {
    this.state[button] = pressed;
  }

  /** Reset all inputs. */
  reset() {
    this.state = createEmptyInput();
    this.justPressed = createEmptyInput();
    this.prevState = createEmptyInput();
  }
}
