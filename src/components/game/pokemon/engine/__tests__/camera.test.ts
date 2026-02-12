// =============================================================================
// Pokemon RPG Engine - Camera System Test Suite
// =============================================================================

import { describe, it, expect } from 'vitest';
import type { Camera } from '../types';
import {
  createCamera,
  setCameraTarget,
  updateCamera,
  worldToScreen,
  isOnScreen,
} from '../camera';
import { CANVAS_WIDTH, CANVAS_HEIGHT, SCALED_TILE } from '../constants';

// =============================================================================
// Helpers
// =============================================================================

/** Build a camera with specific overrides for testing. */
function makeCamera(overrides?: Partial<Camera>): Camera {
  return {
    ...createCamera(),
    ...overrides,
  };
}

// =============================================================================
// createCamera
// =============================================================================

describe('createCamera', () => {
  it('initializes position to (0, 0)', () => {
    const cam = createCamera();
    expect(cam.x).toBe(0);
    expect(cam.y).toBe(0);
  });

  it('initializes target to (0, 0)', () => {
    const cam = createCamera();
    expect(cam.targetX).toBe(0);
    expect(cam.targetY).toBe(0);
  });

  it('uses CANVAS_WIDTH and CANVAS_HEIGHT for the viewport', () => {
    const cam = createCamera();
    expect(cam.viewportWidth).toBe(CANVAS_WIDTH);
    expect(cam.viewportHeight).toBe(CANVAS_HEIGHT);
  });

  it('sets smoothing to 0.15', () => {
    const cam = createCamera();
    expect(cam.smoothing).toBeCloseTo(0.15);
  });
});

// =============================================================================
// setCameraTarget
// =============================================================================

describe('setCameraTarget', () => {
  it('centers the target so the given world position is in the middle of the viewport', () => {
    const cam = createCamera();
    setCameraTarget(cam, 500, 400);
    expect(cam.targetX).toBe(500 - CANVAS_WIDTH / 2);
    expect(cam.targetY).toBe(400 - CANVAS_HEIGHT / 2);
  });

  it('produces negative target values when the world position is near the origin', () => {
    const cam = createCamera();
    setCameraTarget(cam, 0, 0);
    expect(cam.targetX).toBe(-CANVAS_WIDTH / 2);
    expect(cam.targetY).toBe(-CANVAS_HEIGHT / 2);
  });

  it('does not modify the current camera position', () => {
    const cam = makeCamera({ x: 100, y: 200 });
    setCameraTarget(cam, 500, 400);
    expect(cam.x).toBe(100);
    expect(cam.y).toBe(200);
  });
});

// =============================================================================
// updateCamera
// =============================================================================

describe('updateCamera', () => {
  it('clamps the target to map bounds (large map)', () => {
    // Map is 50x50 tiles, so 50 * SCALED_TILE = 1600 px at SCALED_TILE = 32
    const cam = makeCamera({ targetX: 9999, targetY: 9999, x: 9999, y: 9999, smoothing: 1 });
    updateCamera(cam, 50, 50);

    const maxX = Math.max(0, 50 * SCALED_TILE - CANVAS_WIDTH);
    const maxY = Math.max(0, 50 * SCALED_TILE - CANVAS_HEIGHT);
    expect(cam.targetX).toBeLessThanOrEqual(maxX);
    expect(cam.targetY).toBeLessThanOrEqual(maxY);
  });

  it('clamps negative targets to 0 on a large map', () => {
    const cam = makeCamera({ targetX: -500, targetY: -300, smoothing: 1 });
    updateCamera(cam, 50, 50);
    expect(cam.targetX).toBe(0);
    expect(cam.targetY).toBe(0);
  });

  it('centers the camera when the map is smaller than the viewport', () => {
    // A tiny 3x3 map: 3 * SCALED_TILE = 96px, which is less than CANVAS_WIDTH (480)
    const cam = makeCamera({ smoothing: 1 });
    updateCamera(cam, 3, 3);

    const mapPixelW = 3 * SCALED_TILE;
    const mapPixelH = 3 * SCALED_TILE;
    const expectedX = -(CANVAS_WIDTH - mapPixelW) / 2;
    const expectedY = -(CANVAS_HEIGHT - mapPixelH) / 2;

    expect(cam.targetX).toBeCloseTo(expectedX);
    expect(cam.targetY).toBeCloseTo(expectedY);
  });

  it('lerps the camera position toward the target', () => {
    const cam = makeCamera({ x: 0, y: 0, targetX: 100, targetY: 200, smoothing: 0.5 });
    updateCamera(cam, 50, 50);
    // After one lerp step with smoothing 0.5, x moves halfway to 100
    expect(cam.x).toBeCloseTo(50, 0);
    expect(cam.y).toBeCloseTo(100, 0);
  });

  it('snaps to target when within 0.5 pixels', () => {
    const cam = makeCamera({ x: 99.8, y: 199.7, targetX: 100, targetY: 200, smoothing: 1 });
    updateCamera(cam, 50, 50);
    expect(cam.x).toBe(100);
    expect(cam.y).toBe(200);
  });

  it('does not overshoot the target with smoothing 1.0', () => {
    const cam = makeCamera({ x: 0, y: 0, targetX: 100, targetY: 100, smoothing: 1 });
    updateCamera(cam, 50, 50);
    // smoothing = 1 means full step, x should reach 100
    expect(cam.x).toBe(100);
    expect(cam.y).toBe(100);
  });
});

// =============================================================================
// worldToScreen
// =============================================================================

describe('worldToScreen', () => {
  it('converts world position to screen position by subtracting camera offset', () => {
    const cam = makeCamera({ x: 100, y: 50 });
    const screen = worldToScreen(cam, 300, 200);
    expect(screen.x).toBe(200);
    expect(screen.y).toBe(150);
  });

  it('returns (0, 0) when world position equals camera position', () => {
    const cam = makeCamera({ x: 42, y: 99 });
    const screen = worldToScreen(cam, 42, 99);
    expect(screen.x).toBe(0);
    expect(screen.y).toBe(0);
  });

  it('returns negative screen values when world position is behind the camera', () => {
    const cam = makeCamera({ x: 200, y: 200 });
    const screen = worldToScreen(cam, 100, 100);
    expect(screen.x).toBe(-100);
    expect(screen.y).toBe(-100);
  });

  it('rounds results to avoid sub-pixel rendering', () => {
    const cam = makeCamera({ x: 10.7, y: 20.3 });
    const screen = worldToScreen(cam, 50, 60);
    expect(screen.x).toBe(Math.round(50 - 10.7));
    expect(screen.y).toBe(Math.round(60 - 20.3));
  });
});

// =============================================================================
// isOnScreen
// =============================================================================

describe('isOnScreen', () => {
  const cam = makeCamera({ x: 100, y: 100 });

  it('returns true for an object fully within the viewport', () => {
    // Object at world (200, 200) with size 32x32, camera at (100, 100)
    // Screen position is (100, 100), well within viewport
    expect(isOnScreen(cam, 200, 200, 32, 32)).toBe(true);
  });

  it('returns true for an object partially visible on the left edge', () => {
    // Object at world (90, 200) with width 20: right edge at 110, camera.x is 100
    // 90 + 20 = 110 > 100, and 90 < 100 + viewportWidth
    expect(isOnScreen(cam, 90, 200, 20, 20)).toBe(true);
  });

  it('returns false for an object completely to the left of the viewport', () => {
    // Object at world (50, 200) with width 30: right edge at 80, camera.x is 100
    expect(isOnScreen(cam, 50, 200, 30, 30)).toBe(false);
  });

  it('returns false for an object completely to the right of the viewport', () => {
    // Object at world (100 + CANVAS_WIDTH + 10, 200)
    expect(isOnScreen(cam, 100 + CANVAS_WIDTH + 10, 200, 32, 32)).toBe(false);
  });

  it('returns false for an object completely above the viewport', () => {
    expect(isOnScreen(cam, 200, 50, 32, 30)).toBe(false);
  });

  it('returns false for an object completely below the viewport', () => {
    expect(isOnScreen(cam, 200, 100 + CANVAS_HEIGHT + 1, 32, 32)).toBe(false);
  });

  it('returns true for a large object that fully encompasses the viewport', () => {
    expect(isOnScreen(cam, 0, 0, 2000, 2000)).toBe(true);
  });
});
