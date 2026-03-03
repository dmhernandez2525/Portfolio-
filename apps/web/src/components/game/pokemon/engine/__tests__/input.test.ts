// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InputManager } from '../input';

function pressKey(key: string) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key }));
}

function releaseKey(key: string) {
  window.dispatchEvent(new KeyboardEvent('keyup', { key }));
}

describe('InputManager', () => {
  let input: InputManager;

  beforeEach(() => {
    input = new InputManager();
    input.attach();
  });

  afterEach(() => {
    input.detach();
  });

  // -----------------------------------------------------------------------
  // attach / detach
  // -----------------------------------------------------------------------
  describe('attach / detach', () => {
    it('registers keydown events after attach', () => {
      pressKey('ArrowUp');
      expect(input.isHeld('up')).toBe(true);
    });

    it('no longer registers keydown events after detach', () => {
      input.detach();
      pressKey('ArrowUp');
      expect(input.isHeld('up')).toBe(false);
    });

    it('resets all state on detach', () => {
      pressKey('ArrowUp');
      pressKey('z');
      expect(input.isHeld('up')).toBe(true);
      expect(input.isHeld('a')).toBe(true);

      input.detach();

      expect(input.isHeld('up')).toBe(false);
      expect(input.isHeld('a')).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Key mapping
  // -----------------------------------------------------------------------
  describe('key mapping', () => {
    it('maps arrow keys correctly', () => {
      pressKey('ArrowUp');
      expect(input.isHeld('up')).toBe(true);
      releaseKey('ArrowUp');

      pressKey('ArrowDown');
      expect(input.isHeld('down')).toBe(true);
      releaseKey('ArrowDown');

      pressKey('ArrowLeft');
      expect(input.isHeld('left')).toBe(true);
      releaseKey('ArrowLeft');

      pressKey('ArrowRight');
      expect(input.isHeld('right')).toBe(true);
      releaseKey('ArrowRight');
    });

    it('maps WASD keys correctly (both cases)', () => {
      pressKey('w');
      expect(input.isHeld('up')).toBe(true);
      releaseKey('w');

      pressKey('W');
      expect(input.isHeld('up')).toBe(true);
      releaseKey('W');

      pressKey('s');
      expect(input.isHeld('down')).toBe(true);
      releaseKey('s');

      pressKey('S');
      expect(input.isHeld('down')).toBe(true);
      releaseKey('S');

      pressKey('a');
      expect(input.isHeld('left')).toBe(true);
      releaseKey('a');

      pressKey('A');
      expect(input.isHeld('left')).toBe(true);
      releaseKey('A');

      pressKey('d');
      expect(input.isHeld('right')).toBe(true);
      releaseKey('d');

      pressKey('D');
      expect(input.isHeld('right')).toBe(true);
      releaseKey('D');
    });

    it('maps z, Enter, and Space to the "a" button', () => {
      pressKey('z');
      expect(input.isHeld('a')).toBe(true);
      releaseKey('z');

      pressKey('Z');
      expect(input.isHeld('a')).toBe(true);
      releaseKey('Z');

      pressKey('Enter');
      expect(input.isHeld('a')).toBe(true);
      releaseKey('Enter');

      pressKey(' ');
      expect(input.isHeld('a')).toBe(true);
      releaseKey(' ');
    });

    it('maps x, Backspace, and Escape to the "b" button', () => {
      pressKey('x');
      expect(input.isHeld('b')).toBe(true);
      releaseKey('x');

      pressKey('X');
      expect(input.isHeld('b')).toBe(true);
      releaseKey('X');

      pressKey('Backspace');
      expect(input.isHeld('b')).toBe(true);
      releaseKey('Backspace');

      pressKey('Escape');
      expect(input.isHeld('b')).toBe(true);
      releaseKey('Escape');
    });

    it('maps p to "start" and o to "select"', () => {
      pressKey('p');
      expect(input.isHeld('start')).toBe(true);
      releaseKey('p');

      pressKey('P');
      expect(input.isHeld('start')).toBe(true);
      releaseKey('P');

      pressKey('o');
      expect(input.isHeld('select')).toBe(true);
      releaseKey('o');

      pressKey('O');
      expect(input.isHeld('select')).toBe(true);
      releaseKey('O');
    });

    it('ignores unmapped keys', () => {
      pressKey('q');
      pressKey('Tab');
      pressKey('F1');

      expect(input.isHeld('up')).toBe(false);
      expect(input.isHeld('down')).toBe(false);
      expect(input.isHeld('left')).toBe(false);
      expect(input.isHeld('right')).toBe(false);
      expect(input.isHeld('a')).toBe(false);
      expect(input.isHeld('b')).toBe(false);
      expect(input.isHeld('start')).toBe(false);
      expect(input.isHeld('select')).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // isHeld
  // -----------------------------------------------------------------------
  describe('isHeld', () => {
    it('returns false when the key has not been pressed', () => {
      expect(input.isHeld('up')).toBe(false);
    });

    it('returns true while the key is held down', () => {
      pressKey('ArrowUp');
      expect(input.isHeld('up')).toBe(true);
    });

    it('returns false after keyup', () => {
      pressKey('ArrowUp');
      expect(input.isHeld('up')).toBe(true);

      releaseKey('ArrowUp');
      expect(input.isHeld('up')).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // isJustPressed / update
  // -----------------------------------------------------------------------
  describe('isJustPressed / update', () => {
    it('returns true on the first frame after keydown followed by update()', () => {
      pressKey('z');
      input.update();

      expect(input.isJustPressed('a')).toBe(true);
    });

    it('returns false on the second frame while the key is still held', () => {
      pressKey('z');
      input.update();
      expect(input.isJustPressed('a')).toBe(true);

      // Second frame, key still held
      input.update();
      expect(input.isJustPressed('a')).toBe(false);
    });

    it('returns true again after releasing and re-pressing the key', () => {
      pressKey('z');
      input.update();
      expect(input.isJustPressed('a')).toBe(true);

      input.update();
      expect(input.isJustPressed('a')).toBe(false);

      // Release and press again
      releaseKey('z');
      input.update();

      pressKey('z');
      input.update();
      expect(input.isJustPressed('a')).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // getDirection
  // -----------------------------------------------------------------------
  describe('getDirection', () => {
    it('returns {0, 0} when no directional keys are pressed', () => {
      expect(input.getDirection()).toEqual({ x: 0, y: 0 });
    });

    it('returns {-1, 0} when left is held', () => {
      pressKey('ArrowLeft');
      expect(input.getDirection()).toEqual({ x: -1, y: 0 });
    });

    it('returns {1, 0} when right is held', () => {
      pressKey('ArrowRight');
      expect(input.getDirection()).toEqual({ x: 1, y: 0 });
    });

    it('returns {0, -1} when up is held', () => {
      pressKey('ArrowUp');
      expect(input.getDirection()).toEqual({ x: 0, y: -1 });
    });

    it('returns {0, 1} when down is held', () => {
      pressKey('ArrowDown');
      expect(input.getDirection()).toEqual({ x: 0, y: 1 });
    });

    it('returns {0, 0} when opposing keys cancel each other out', () => {
      pressKey('ArrowLeft');
      pressKey('ArrowRight');
      expect(input.getDirection()).toEqual({ x: 0, y: 0 });

      releaseKey('ArrowLeft');
      releaseKey('ArrowRight');

      pressKey('ArrowUp');
      pressKey('ArrowDown');
      expect(input.getDirection()).toEqual({ x: 0, y: 0 });
    });
  });

  // -----------------------------------------------------------------------
  // setEnabled
  // -----------------------------------------------------------------------
  describe('setEnabled', () => {
    it('causes isHeld to return false even when a key is pressed while disabled', () => {
      pressKey('ArrowUp');
      expect(input.isHeld('up')).toBe(true);

      input.setEnabled(false);
      expect(input.isHeld('up')).toBe(false);
    });

    it('causes getDirection to return {0, 0} while disabled', () => {
      pressKey('ArrowLeft');
      expect(input.getDirection()).toEqual({ x: -1, y: 0 });

      input.setEnabled(false);
      expect(input.getDirection()).toEqual({ x: 0, y: 0 });
    });

    it('allows input again after re-enabling', () => {
      input.setEnabled(false);

      // Keys pressed while disabled are ignored by the handler
      pressKey('ArrowUp');
      expect(input.isHeld('up')).toBe(false);

      input.setEnabled(true);

      // New key presses should register
      pressKey('ArrowDown');
      expect(input.isHeld('down')).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // setButton / reset
  // -----------------------------------------------------------------------
  describe('setButton / reset', () => {
    it('directly sets button state via setButton', () => {
      expect(input.isHeld('a')).toBe(false);

      input.setButton('a', true);
      expect(input.isHeld('a')).toBe(true);

      input.setButton('a', false);
      expect(input.isHeld('a')).toBe(false);
    });

    it('clears all state via reset', () => {
      pressKey('ArrowUp');
      pressKey('z');
      input.update();

      expect(input.isHeld('up')).toBe(true);
      expect(input.isHeld('a')).toBe(true);
      expect(input.isJustPressed('a')).toBe(true);

      input.reset();

      expect(input.isHeld('up')).toBe(false);
      expect(input.isHeld('a')).toBe(false);
      expect(input.isJustPressed('a')).toBe(false);
      expect(input.getDirection()).toEqual({ x: 0, y: 0 });
    });
  });
});
