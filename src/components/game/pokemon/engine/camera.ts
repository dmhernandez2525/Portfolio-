// ============================================================================
// Pokemon RPG Engine — Camera System
// ============================================================================

import type { Camera } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, SCALED_TILE } from './constants';

export function createCamera(): Camera {
  return {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    viewportWidth: CANVAS_WIDTH,
    viewportHeight: CANVAS_HEIGHT,
    smoothing: 0.15,
  };
}

/** Center the camera target on a world position. */
export function setCameraTarget(camera: Camera, worldX: number, worldY: number) {
  camera.targetX = worldX - camera.viewportWidth / 2;
  camera.targetY = worldY - camera.viewportHeight / 2;
}

/** Smoothly interpolate camera toward target, clamped to map bounds. */
export function updateCamera(
  camera: Camera,
  mapWidthTiles: number,
  mapHeightTiles: number
) {
  const mapPixelW = mapWidthTiles * SCALED_TILE;
  const mapPixelH = mapHeightTiles * SCALED_TILE;

  // Clamp target to map bounds
  const maxX = Math.max(0, mapPixelW - camera.viewportWidth);
  const maxY = Math.max(0, mapPixelH - camera.viewportHeight);

  camera.targetX = Math.max(0, Math.min(camera.targetX, maxX));
  camera.targetY = Math.max(0, Math.min(camera.targetY, maxY));

  // If map is smaller than viewport, center it
  if (mapPixelW <= camera.viewportWidth) {
    camera.targetX = -(camera.viewportWidth - mapPixelW) / 2;
  }
  if (mapPixelH <= camera.viewportHeight) {
    camera.targetY = -(camera.viewportHeight - mapPixelH) / 2;
  }

  // Lerp toward target
  camera.x += (camera.targetX - camera.x) * camera.smoothing;
  camera.y += (camera.targetY - camera.y) * camera.smoothing;

  // Snap if very close to avoid sub-pixel jitter
  if (Math.abs(camera.x - camera.targetX) < 0.5) camera.x = camera.targetX;
  if (Math.abs(camera.y - camera.targetY) < 0.5) camera.y = camera.targetY;
}

/** Convert world coordinates to screen coordinates. */
export function worldToScreen(camera: Camera, worldX: number, worldY: number) {
  return {
    x: Math.round(worldX - camera.x),
    y: Math.round(worldY - camera.y),
  };
}

/** Check if a world rect is visible on screen. */
export function isOnScreen(
  camera: Camera,
  worldX: number,
  worldY: number,
  width: number,
  height: number
): boolean {
  return (
    worldX + width > camera.x &&
    worldX < camera.x + camera.viewportWidth &&
    worldY + height > camera.y &&
    worldY < camera.y + camera.viewportHeight
  );
}
