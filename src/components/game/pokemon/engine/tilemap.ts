// ============================================================================
// Pokemon RPG Engine — Tilemap Renderer
// ============================================================================
// Renders maps using retro pixel sprites from the sprite atlas.
// Falls back to procedural colored rectangles if sprites aren't loaded.

import type { GameMap, Camera, TileType } from './types';
import { SCALED_TILE, COLORS } from './constants';
import { worldToScreen, isOnScreen } from './camera';
import { isSpritesReady, drawTile, drawPlayer, drawNPC } from './sprites';

// Map tile IDs to colors for procedural fallback rendering
const TILE_COLORS: Record<number, string> = {
  0: 'transparent',
  1: COLORS.grass,
  2: COLORS.path,
  3: COLORS.tallGrass,
  4: COLORS.water,
  5: COLORS.tree,
  6: COLORS.building,
  7: COLORS.roof,
  8: COLORS.doorway,
  9: COLORS.wall,
  10: COLORS.sand,
  11: COLORS.rock,
  12: '#8b7355',          // fence
  13: '#a09070',          // ledge
  14: '#e04040',          // red flower
  15: '#e0e040',          // yellow flower
  16: '#c0b090',          // sign post
};

/** Render a single tile layer. */
function renderLayer(
  ctx: CanvasRenderingContext2D,
  layer: number[][],
  camera: Camera,
  mapWidth: number,
  mapHeight: number,
  alpha: number = 1
) {
  if (alpha < 1) ctx.globalAlpha = alpha;

  const useSprites = isSpritesReady();

  // Calculate visible tile range for culling
  const startTileX = Math.max(0, Math.floor(camera.x / SCALED_TILE));
  const startTileY = Math.max(0, Math.floor(camera.y / SCALED_TILE));
  const endTileX = Math.min(mapWidth, Math.ceil((camera.x + camera.viewportWidth) / SCALED_TILE) + 1);
  const endTileY = Math.min(mapHeight, Math.ceil((camera.y + camera.viewportHeight) / SCALED_TILE) + 1);

  // Disable image smoothing for crisp pixel art
  if (useSprites) ctx.imageSmoothingEnabled = false;

  for (let y = startTileY; y < endTileY; y++) {
    const row = layer[y];
    if (!row) continue;
    for (let x = startTileX; x < endTileX; x++) {
      const tileId = row[x];
      if (tileId === 0 || tileId === undefined) continue;

      const screen = worldToScreen(camera, x * SCALED_TILE, y * SCALED_TILE);

      // Try sprite first, then fall back to procedural
      if (useSprites && drawTile(ctx, tileId, screen.x, screen.y)) {
        continue;
      }

      // Procedural fallback
      const color = TILE_COLORS[tileId];
      if (!color || color === 'transparent') continue;

      ctx.fillStyle = color;
      ctx.fillRect(screen.x, screen.y, SCALED_TILE, SCALED_TILE);
      renderTileDetail(ctx, tileId, screen.x, screen.y);
    }
  }

  if (useSprites) ctx.imageSmoothingEnabled = true;
  if (alpha < 1) ctx.globalAlpha = 1;
}

/** Add visual detail to specific tile types (procedural fallback). */
function renderTileDetail(
  ctx: CanvasRenderingContext2D,
  tileId: number,
  sx: number,
  sy: number
) {
  const s = SCALED_TILE;

  switch (tileId) {
    case 3: // tall grass — draw grass blade pattern
      ctx.fillStyle = COLORS.tallGrassLight;
      for (let i = 0; i < 4; i++) {
        const gx = sx + 4 + i * 7;
        const gy = sy + 6;
        ctx.fillRect(gx, gy, 2, 10);
        ctx.fillRect(gx - 1, gy + 2, 1, 6);
        ctx.fillRect(gx + 2, gy + 2, 1, 6);
      }
      break;

    case 4: // water — wave lines
      ctx.strokeStyle = COLORS.waterDark;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx + 4, sy + s / 2);
      ctx.quadraticCurveTo(sx + s / 4, sy + s / 2 - 4, sx + s / 2, sy + s / 2);
      ctx.quadraticCurveTo(sx + 3 * s / 4, sy + s / 2 + 4, sx + s - 4, sy + s / 2);
      ctx.stroke();
      break;

    case 5: // tree — trunk + canopy
      ctx.fillStyle = COLORS.treeTrunk;
      ctx.fillRect(sx + s / 2 - 3, sy + s / 2, 6, s / 2);
      ctx.fillStyle = COLORS.tree;
      ctx.beginPath();
      ctx.arc(sx + s / 2, sy + s / 3, s / 3, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 8: // door — dark rectangle with frame
      ctx.strokeStyle = '#402010';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx + 4, sy + 2, s - 8, s - 4);
      ctx.fillStyle = '#805030';
      ctx.fillRect(sx + s - 10, sy + s / 2 - 2, 3, 3);
      break;

    case 16: // sign post
      ctx.fillStyle = '#806030';
      ctx.fillRect(sx + s / 2 - 2, sy + s / 2, 4, s / 2);
      ctx.fillStyle = '#c0b090';
      ctx.fillRect(sx + 4, sy + 4, s - 8, s / 2 - 2);
      ctx.strokeStyle = '#806030';
      ctx.lineWidth = 1;
      ctx.strokeRect(sx + 4, sy + 4, s - 8, s / 2 - 2);
      break;
  }
}

/** Render all layers of a map. */
export function renderMap(
  ctx: CanvasRenderingContext2D,
  map: GameMap,
  camera: Camera
) {
  // Background fill (grass base)
  ctx.fillStyle = COLORS.grass;
  ctx.fillRect(0, 0, camera.viewportWidth, camera.viewportHeight);

  // Ground layer
  renderLayer(ctx, map.layers.ground, camera, map.width, map.height);

  // Object layer
  renderLayer(ctx, map.layers.objects, camera, map.width, map.height);
}

/** Render the above-player layer (roofs, tree canopies, etc). */
export function renderAboveLayer(
  ctx: CanvasRenderingContext2D,
  map: GameMap,
  camera: Camera
) {
  renderLayer(ctx, map.layers.above, camera, map.width, map.height, 0.9);
}

/** Render NPCs on the map. */
export function renderNPCs(
  ctx: CanvasRenderingContext2D,
  map: GameMap,
  camera: Camera,
  _frameCount: number
) {
  const useSprites = isSpritesReady();

  for (const npc of map.npcs) {
    const worldX = npc.x * SCALED_TILE;
    const worldY = npc.y * SCALED_TILE;

    if (!isOnScreen(camera, worldX, worldY, SCALED_TILE, SCALED_TILE)) continue;

    const screen = worldToScreen(camera, worldX, worldY);

    // Try sprite atlas first
    if (useSprites) {
      ctx.imageSmoothingEnabled = false;
      const drawn = drawNPC(ctx, screen.x, screen.y, npc.direction, npc.spriteId, npc.isTrainer);
      ctx.imageSmoothingEnabled = true;
      if (drawn) {
        // Trainer exclamation indicator
        if (npc.isTrainer) {
          ctx.fillStyle = '#e04040';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('!', screen.x + SCALED_TILE / 2, screen.y - 10);
        }
        continue;
      }
    }

    // Procedural fallback
    ctx.fillStyle = npc.isTrainer ? '#e04040' : COLORS.npc;
    const bodyW = SCALED_TILE * 0.6;
    const bodyH = SCALED_TILE * 0.7;
    ctx.fillRect(
      screen.x + (SCALED_TILE - bodyW) / 2,
      screen.y + SCALED_TILE - bodyH,
      bodyW,
      bodyH
    );

    // Head
    const headR = SCALED_TILE * 0.2;
    ctx.fillStyle = '#f0d0b0';
    ctx.beginPath();
    ctx.arc(
      screen.x + SCALED_TILE / 2,
      screen.y + SCALED_TILE - bodyH - headR + 2,
      headR,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Trainer exclamation indicator
    if (npc.isTrainer) {
      ctx.fillStyle = '#e04040';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('!', screen.x + SCALED_TILE / 2, screen.y - 2);
    }
  }
}

/** Render the player character. */
export function renderPlayer(
  ctx: CanvasRenderingContext2D,
  playerX: number,
  playerY: number,
  direction: string,
  isMoving: boolean,
  frameCount: number,
  camera: Camera
) {
  const screen = worldToScreen(camera, playerX, playerY);

  // Try sprite atlas first
  if (isSpritesReady()) {
    ctx.imageSmoothingEnabled = false;
    const drawn = drawPlayer(ctx, screen.x, screen.y, direction, isMoving, frameCount);
    ctx.imageSmoothingEnabled = true;
    if (drawn) return;
  }

  // Procedural fallback
  const s = SCALED_TILE;

  // Walking animation bob
  const bobY = isMoving ? Math.sin(frameCount * 0.3) * 2 : 0;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(screen.x + s / 2, screen.y + s - 2, s / 3, s / 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body
  const bodyW = s * 0.5;
  const bodyH = s * 0.55;
  ctx.fillStyle = COLORS.player;
  ctx.fillRect(
    screen.x + (s - bodyW) / 2,
    screen.y + s - bodyH + bobY,
    bodyW,
    bodyH
  );

  // Head
  const headR = s * 0.22;
  ctx.fillStyle = '#f0d0b0';
  ctx.beginPath();
  ctx.arc(
    screen.x + s / 2,
    screen.y + s - bodyH - headR + 3 + bobY,
    headR,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Hat
  ctx.fillStyle = '#c03030';
  ctx.fillRect(
    screen.x + s / 2 - headR - 2,
    screen.y + s - bodyH - headR * 2 + 3 + bobY,
    headR * 2 + 4,
    headR * 0.7
  );

  // Direction indicator (small triangle showing facing)
  ctx.fillStyle = '#ffffff';
  const cx = screen.x + s / 2;
  const cy = screen.y + s - bodyH / 2 + bobY;
  const arrowSize = 3;

  ctx.beginPath();
  switch (direction) {
    case 'up':
      ctx.moveTo(cx, cy - arrowSize * 2);
      ctx.lineTo(cx - arrowSize, cy - arrowSize);
      ctx.lineTo(cx + arrowSize, cy - arrowSize);
      break;
    case 'down':
      ctx.moveTo(cx, cy + arrowSize * 2);
      ctx.lineTo(cx - arrowSize, cy + arrowSize);
      ctx.lineTo(cx + arrowSize, cy + arrowSize);
      break;
    case 'left':
      ctx.moveTo(cx - bodyW / 2 - arrowSize, cy);
      ctx.lineTo(cx - bodyW / 2, cy - arrowSize);
      ctx.lineTo(cx - bodyW / 2, cy + arrowSize);
      break;
    case 'right':
      ctx.moveTo(cx + bodyW / 2 + arrowSize, cy);
      ctx.lineTo(cx + bodyW / 2, cy - arrowSize);
      ctx.lineTo(cx + bodyW / 2, cy + arrowSize);
      break;
  }
  ctx.fill();
}

/** Get collision type for debugging overlay. */
export function renderCollisionDebug(
  ctx: CanvasRenderingContext2D,
  map: GameMap,
  camera: Camera
) {
  const startTileX = Math.max(0, Math.floor(camera.x / SCALED_TILE));
  const startTileY = Math.max(0, Math.floor(camera.y / SCALED_TILE));
  const endTileX = Math.min(map.width, Math.ceil((camera.x + camera.viewportWidth) / SCALED_TILE) + 1);
  const endTileY = Math.min(map.height, Math.ceil((camera.y + camera.viewportHeight) / SCALED_TILE) + 1);

  const collisionColors: Record<TileType, string> = {
    walkable: 'rgba(0, 255, 0, 0.2)',
    blocked: 'rgba(255, 0, 0, 0.3)',
    surfable: 'rgba(0, 100, 255, 0.3)',
    tall_grass: 'rgba(0, 200, 0, 0.3)',
    ledge_down: 'rgba(200, 200, 0, 0.3)',
    ledge_left: 'rgba(200, 200, 0, 0.3)',
    ledge_right: 'rgba(200, 200, 0, 0.3)',
  };

  ctx.globalAlpha = 0.4;
  for (let y = startTileY; y < endTileY; y++) {
    for (let x = startTileX; x < endTileX; x++) {
      const tile = map.collision[y]?.[x];
      if (!tile) continue;

      const screen = worldToScreen(camera, x * SCALED_TILE, y * SCALED_TILE);
      ctx.fillStyle = collisionColors[tile] || 'rgba(128, 128, 128, 0.3)';
      ctx.fillRect(screen.x, screen.y, SCALED_TILE, SCALED_TILE);
    }
  }
  ctx.globalAlpha = 1;
}
