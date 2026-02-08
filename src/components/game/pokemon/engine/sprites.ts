// ============================================================================
// Pokemon RPG Engine — Retro Pixel Sprite System
// ============================================================================
// Generates GBC-style pixel art sprites programmatically using offscreen
// canvases. Falls back to procedural rendering if sprites aren't ready.

import { TILE_SIZE, RENDER_SCALE, SCALED_TILE } from './constants';

// --- Sprite cache ---

let tileAtlas: HTMLCanvasElement | null = null;
let playerAtlas: HTMLCanvasElement | null = null;
let npcAtlas: HTMLCanvasElement | null = null;
const pokemonSpriteCache = new Map<string, HTMLImageElement>();

// --- Initialization ---

let initialized = false;

export function initSprites(): void {
  if (initialized) return;
  initialized = true;
  tileAtlas = generateTileAtlas();
  playerAtlas = generatePlayerAtlas();
  npcAtlas = generateNPCAtlas();
}

export function isSpritesReady(): boolean {
  return initialized && tileAtlas !== null;
}

// --- Tile atlas ---
// Each tile is 16x16 in the atlas, drawn at 1:1 then scaled during rendering.
// Tiles arranged in a horizontal strip: tileId → column index.

const TILE_COUNT = 17; // IDs 0-16

function generateTileAtlas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = TILE_SIZE * TILE_COUNT;
  canvas.height = TILE_SIZE;
  const ctx = canvas.getContext('2d')!;

  // Helper to set a single pixel
  const px = (tileIdx: number, x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(tileIdx * TILE_SIZE + x, y, 1, 1);
  };

  // Helper to fill entire tile
  const fill = (tileIdx: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(tileIdx * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE);
  };

  // 0: empty (transparent)

  // 1: Grass - base green with scattered darker dots
  fill(1, '#78c850');
  for (let i = 0; i < 8; i++) {
    px(1, (i * 5 + 3) % 16, (i * 7 + 2) % 16, '#60a838');
    px(1, (i * 3 + 7) % 16, (i * 11 + 5) % 16, '#88d860');
  }

  // 2: Path - brown/tan with pixel texture
  fill(2, '#d4b896');
  for (let i = 0; i < 6; i++) {
    px(2, (i * 7 + 1) % 16, (i * 5 + 3) % 16, '#c0a078');
    px(2, (i * 3 + 8) % 16, (i * 9 + 1) % 16, '#e0c8a8');
  }

  // 3: Tall grass - dark green base with prominent blade shapes
  fill(3, '#4a8530');
  for (let col = 0; col < 4; col++) {
    const bx = col * 4 + 1;
    for (let row = 0; row < 10; row++) {
      px(3, bx, 6 + row, '#60a840');
      px(3, bx + 1, 5 + row, '#68b848');
    }
    px(3, bx, 4, '#68b848');
    px(3, bx + 1, 3, '#70c050');
  }

  // 4: Water - blue with wave pattern
  fill(4, '#5090d0');
  for (let y = 0; y < 16; y += 4) {
    for (let x = 0; x < 16; x++) {
      const wave = Math.sin((x + y) * 0.8) > 0.3;
      if (wave) px(4, x, y, '#68a8e0');
      if (Math.sin((x + y + 2) * 0.8) > 0.3) px(4, x, y + 2, '#3878b0');
    }
  }

  // 5: Tree - trunk center with circular canopy
  fill(5, '#78c850'); // grass base
  // Trunk
  for (let y = 10; y < 16; y++) {
    px(5, 7, y, '#8b6914'); px(5, 8, y, '#7a5a10');
  }
  // Canopy
  for (let dy = -5; dy <= 4; dy++) {
    for (let dx = -5; dx <= 5; dx++) {
      if (dx * dx + dy * dy <= 25) {
        const cx = 8 + dx;
        const cy = 6 + dy;
        if (cx >= 0 && cx < 16 && cy >= 0 && cy < 16) {
          const shade = dx * dx + dy * dy > 16 ? '#1e5a1e' : '#2d6b2d';
          px(5, cx, cy, shade);
        }
      }
    }
  }

  // 6: Building wall - gray/brown bricks
  fill(6, '#d0c0a0');
  for (let y = 0; y < 16; y += 4) {
    for (let x = 0; x < 16; x++) {
      px(6, x, y, '#b0a080');
    }
    const off = (y / 4) % 2 === 0 ? 0 : 4;
    for (let bx = off; bx < 16; bx += 8) {
      for (let by = y; by < Math.min(y + 4, 16); by++) {
        px(6, bx, by, '#b0a080');
      }
    }
  }

  // 7: Roof - red with tiles pattern
  fill(7, '#c04040');
  for (let y = 0; y < 16; y += 3) {
    for (let x = 0; x < 16; x++) {
      px(7, x, y, '#a03030');
    }
  }
  for (let y = 1; y < 16; y += 3) {
    const off = (Math.floor(y / 3) % 2) * 4;
    for (let x = off; x < 16; x += 8) {
      px(7, x, y, '#a03030');
      px(7, x, y + 1 < 16 ? y + 1 : y, '#a03030');
    }
  }

  // 8: Door - brown with frame
  fill(8, '#604020');
  // Frame
  for (let y = 0; y < 16; y++) {
    px(8, 2, y, '#805030'); px(8, 13, y, '#805030');
  }
  for (let x = 2; x <= 13; x++) {
    px(8, x, 0, '#805030'); px(8, x, 1, '#805030');
  }
  // Door panels
  for (let y = 2; y < 16; y++) {
    for (let x = 3; x <= 12; x++) {
      px(8, x, y, '#7a5530');
    }
  }
  // Knob
  px(8, 10, 8, '#c0a000'); px(8, 10, 9, '#c0a000');

  // 9: Wall - light stone
  fill(9, '#e8e0d0');
  for (let y = 0; y < 16; y += 4) {
    for (let x = 0; x < 16; x++) px(9, x, y, '#d0c8b8');
  }

  // 10: Sand - tan with dots
  fill(10, '#e8d8a0');
  for (let i = 0; i < 5; i++) {
    px(10, (i * 7 + 2) % 16, (i * 5 + 1) % 16, '#d8c888');
    px(10, (i * 3 + 9) % 16, (i * 11 + 4) % 16, '#f0e0b0');
  }

  // 11: Rock - gray with cracks
  fill(11, '#808080');
  for (let i = 0; i < 4; i++) {
    px(11, 3 + i * 3, 4 + i * 2, '#606060');
    px(11, 4 + i * 3, 5 + i * 2, '#606060');
  }
  px(11, 8, 8, '#909090'); px(11, 9, 7, '#909090');

  // 12: Fence - brown horizontal bars
  fill(12, '#78c850'); // grass base
  for (let x = 0; x < 16; x++) {
    px(12, x, 4, '#8b7355'); px(12, x, 5, '#7a6244');
    px(12, x, 10, '#8b7355'); px(12, x, 11, '#7a6244');
  }
  // Posts
  for (let y = 2; y < 14; y++) {
    px(12, 1, y, '#8b7355'); px(12, 2, y, '#7a6244');
    px(12, 13, y, '#8b7355'); px(12, 14, y, '#7a6244');
  }

  // 13: Ledge - raised edge
  fill(13, '#a09070');
  for (let x = 0; x < 16; x++) {
    px(13, x, 14, '#807060'); px(13, x, 15, '#706050');
    px(13, x, 0, '#b8a888');
  }

  // 14: Red flower on grass
  fill(14, '#78c850');
  // Petals
  px(14, 7, 5, '#e04040'); px(14, 8, 5, '#e04040');
  px(14, 6, 6, '#e04040'); px(14, 9, 6, '#e04040');
  px(14, 7, 7, '#e04040'); px(14, 8, 7, '#e04040');
  px(14, 7, 6, '#ffff40'); px(14, 8, 6, '#ffff40'); // center

  // 15: Yellow flower on grass
  fill(15, '#78c850');
  px(15, 7, 5, '#e0e040'); px(15, 8, 5, '#e0e040');
  px(15, 6, 6, '#e0e040'); px(15, 9, 6, '#e0e040');
  px(15, 7, 7, '#e0e040'); px(15, 8, 7, '#e0e040');
  px(15, 7, 6, '#e08020'); px(15, 8, 6, '#e08020'); // center

  // 16: Sign post on grass
  fill(16, '#78c850');
  // Post
  for (let y = 8; y < 16; y++) { px(16, 7, y, '#806030'); px(16, 8, y, '#806030'); }
  // Board
  for (let y = 2; y < 9; y++) {
    for (let x = 3; x < 13; x++) {
      px(16, x, y, '#c0b090');
    }
  }
  for (let x = 3; x < 13; x++) { px(16, x, 2, '#a09070'); px(16, x, 8, '#a09070'); }
  for (let y = 2; y < 9; y++) { px(16, 3, y, '#a09070'); px(16, 12, y, '#a09070'); }

  return canvas;
}

/** Draw a tile from the atlas onto the main canvas. */
export function drawTile(
  ctx: CanvasRenderingContext2D,
  tileId: number,
  screenX: number,
  screenY: number
): boolean {
  if (!tileAtlas || tileId <= 0 || tileId >= TILE_COUNT) return false;

  ctx.drawImage(
    tileAtlas,
    tileId * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE,
    screenX, screenY, SCALED_TILE, SCALED_TILE
  );
  return true;
}

// --- Player sprite atlas ---
// Layout: 4 rows (down, up, left, right) × 3 columns (idle, walk1, walk2)
// Each frame is 16×24 pixels (16 wide, 24 tall for RPG proportion)

const PLAYER_FRAME_W = 16;
const PLAYER_FRAME_H = 24;

function generatePlayerAtlas(): HTMLCanvasElement {
  const cols = 3; // idle, walk1, walk2
  const rows = 4; // down, up, left, right
  const canvas = document.createElement('canvas');
  canvas.width = PLAYER_FRAME_W * cols;
  canvas.height = PLAYER_FRAME_H * rows;
  const ctx = canvas.getContext('2d')!;

  const directions = ['down', 'up', 'left', 'right'] as const;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      drawCharacterFrame(ctx, col * PLAYER_FRAME_W, row * PLAYER_FRAME_H,
        directions[row], col, 'player');
    }
  }

  return canvas;
}

// --- NPC sprite atlas ---
// 4 NPC types × 4 directions × 1 frame = 16 frames
// Types: 0=girl (blue), 1=boy (green), 2=elder (purple), 3=trainer (red)

function generateNPCAtlas(): HTMLCanvasElement {
  const npcTypes = 4;
  const dirs = 4; // down, up, left, right
  const canvas = document.createElement('canvas');
  canvas.width = PLAYER_FRAME_W * dirs;
  canvas.height = PLAYER_FRAME_H * npcTypes;
  const ctx = canvas.getContext('2d')!;

  const directions = ['down', 'up', 'left', 'right'] as const;
  const types = ['npc_girl', 'npc_boy', 'npc_elder', 'npc_trainer'] as const;

  for (let t = 0; t < npcTypes; t++) {
    for (let d = 0; d < dirs; d++) {
      drawCharacterFrame(ctx, d * PLAYER_FRAME_W, t * PLAYER_FRAME_H,
        directions[d], 0, types[t]);
    }
  }

  return canvas;
}

/** Draw a single character sprite frame at the given position. */
function drawCharacterFrame(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  direction: 'down' | 'up' | 'left' | 'right',
  frame: number, // 0=idle, 1=walk1, 2=walk2
  type: string
): void {
  const px = (x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(ox + x, oy + y, 1, 1);
  };

  // Color scheme by type
  const colors = getCharacterColors(type);

  // --- Hair/Hat ---
  if (type === 'player') {
    // Red cap
    for (let x = 5; x <= 10; x++) { px(x, 2, colors.hat); px(x, 3, colors.hat); }
    for (let x = 4; x <= 11; x++) px(x, 4, colors.hat);
  } else {
    // Hair
    for (let x = 5; x <= 10; x++) { px(x, 3, colors.hair); px(x, 4, colors.hair); }
    px(4, 4, colors.hair); px(11, 4, colors.hair);
  }

  // --- Face ---
  for (let x = 5; x <= 10; x++) {
    for (let y = 5; y <= 8; y++) {
      px(x, y, colors.skin);
    }
  }

  // Eyes (direction-dependent)
  if (direction === 'down') {
    px(6, 6, '#000000'); px(9, 6, '#000000');
    px(6, 7, '#000000'); px(9, 7, '#000000');
  } else if (direction === 'up') {
    // No eyes visible from behind
  } else if (direction === 'left') {
    px(5, 6, '#000000'); px(5, 7, '#000000');
    px(7, 6, '#000000'); px(7, 7, '#000000');
  } else {
    px(8, 6, '#000000'); px(8, 7, '#000000');
    px(10, 6, '#000000'); px(10, 7, '#000000');
  }

  // --- Body/Shirt ---
  for (let y = 9; y <= 16; y++) {
    for (let x = 4; x <= 11; x++) {
      px(x, y, colors.shirt);
    }
  }
  // Shirt outline
  for (let y = 9; y <= 16; y++) {
    px(4, y, colors.shirtDark);
    px(11, y, colors.shirtDark);
  }

  // --- Arms (based on frame) ---
  if (frame === 1) {
    // Left arm forward
    px(3, 10, colors.skin); px(3, 11, colors.skin);
    px(12, 13, colors.skin); px(12, 14, colors.skin);
  } else if (frame === 2) {
    // Right arm forward
    px(12, 10, colors.skin); px(12, 11, colors.skin);
    px(3, 13, colors.skin); px(3, 14, colors.skin);
  } else {
    // Arms at side
    px(3, 11, colors.skin); px(3, 12, colors.skin);
    px(12, 11, colors.skin); px(12, 12, colors.skin);
  }

  // --- Legs/Pants ---
  for (let y = 17; y <= 21; y++) {
    px(5, y, colors.pants); px(6, y, colors.pants);
    px(9, y, colors.pants); px(10, y, colors.pants);
  }

  // Walking leg offset
  if (frame === 1) {
    px(5, 22, colors.shoe); px(6, 22, colors.shoe);
    px(9, 21, colors.shoe); px(10, 21, colors.shoe);
  } else if (frame === 2) {
    px(5, 21, colors.shoe); px(6, 21, colors.shoe);
    px(9, 22, colors.shoe); px(10, 22, colors.shoe);
  } else {
    px(5, 22, colors.shoe); px(6, 22, colors.shoe);
    px(9, 22, colors.shoe); px(10, 22, colors.shoe);
  }

  // --- Shoes ---
  px(4, 23, colors.shoe); px(5, 23, colors.shoe); px(6, 23, colors.shoe);
  px(9, 23, colors.shoe); px(10, 23, colors.shoe); px(11, 23, colors.shoe);
}

interface CharColors {
  hat: string; hair: string; skin: string;
  shirt: string; shirtDark: string;
  pants: string; shoe: string;
}

function getCharacterColors(type: string): CharColors {
  const base: CharColors = {
    hat: '#c03030', hair: '#604020', skin: '#f0c8a0',
    shirt: '#3070d0', shirtDark: '#2050a0',
    pants: '#3050a0', shoe: '#402010',
  };

  const variants: Record<string, Partial<CharColors>> = {
    player: { hat: '#c03030', shirt: '#3070d0', shirtDark: '#2050a0', pants: '#3050a0' },
    npc_girl: { hair: '#c06020', shirt: '#d04080', shirtDark: '#a03060', pants: '#e08040' },
    npc_boy: { hair: '#402010', shirt: '#40a060', shirtDark: '#308048', pants: '#4060a0' },
    npc_elder: { hair: '#b0b0b0', shirt: '#806080', shirtDark: '#604060', pants: '#505050' },
    npc_trainer: { hair: '#301010', shirt: '#e04040', shirtDark: '#c03030', pants: '#303030' },
  };

  return { ...base, ...(variants[type] ?? {}) };
}

// --- Draw player from atlas ---

const DIR_ROW: Record<string, number> = { down: 0, up: 1, left: 2, right: 3 };

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  direction: string,
  isMoving: boolean,
  frameCount: number
): boolean {
  if (!playerAtlas) return false;

  const row = DIR_ROW[direction] ?? 0;
  const col = isMoving ? ((Math.floor(frameCount / 8) % 2) + 1) : 0;

  // Center the 16×24 sprite in the 16×16 tile space (offset upward)
  const drawW = PLAYER_FRAME_W * RENDER_SCALE;
  const drawH = PLAYER_FRAME_H * RENDER_SCALE;
  const drawX = screenX;
  const drawY = screenY - (drawH - SCALED_TILE);

  ctx.drawImage(
    playerAtlas,
    col * PLAYER_FRAME_W, row * PLAYER_FRAME_H,
    PLAYER_FRAME_W, PLAYER_FRAME_H,
    drawX, drawY, drawW, drawH
  );
  return true;
}

// --- Draw NPC from atlas ---

const NPC_TYPE_ROW: Record<string, number> = {
  girl: 0, boy: 1, elder: 2, trainer: 3,
  default: 1,
};

export function drawNPC(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  direction: string,
  spriteId: string,
  isTrainer: boolean
): boolean {
  if (!npcAtlas) return false;

  const typeRow = isTrainer
    ? NPC_TYPE_ROW['trainer']
    : (NPC_TYPE_ROW[spriteId] ?? NPC_TYPE_ROW['default']);
  const dirCol = DIR_ROW[direction] ?? 0;

  const drawW = PLAYER_FRAME_W * RENDER_SCALE;
  const drawH = PLAYER_FRAME_H * RENDER_SCALE;
  const drawX = screenX;
  const drawY = screenY - (drawH - SCALED_TILE);

  ctx.drawImage(
    npcAtlas,
    dirCol * PLAYER_FRAME_W, typeRow * PLAYER_FRAME_H,
    PLAYER_FRAME_W, PLAYER_FRAME_H,
    drawX, drawY, drawW, drawH
  );
  return true;
}

// --- Pokemon battle sprites (from PokeAPI) ---

const POKEAPI_SPRITE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

export function getPokemonSprite(
  speciesId: number,
  isBack: boolean
): HTMLImageElement | null {
  const key = `${speciesId}-${isBack ? 'back' : 'front'}`;
  const cached = pokemonSpriteCache.get(key);
  if (cached) return cached.complete ? cached : null;

  // Start loading
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = isBack
    ? `${POKEAPI_SPRITE_URL}/back/${speciesId}.png`
    : `${POKEAPI_SPRITE_URL}/${speciesId}.png`;

  pokemonSpriteCache.set(key, img);

  // Return null while loading — caller should use fallback
  return null;
}

export function drawPokemonSprite(
  ctx: CanvasRenderingContext2D,
  speciesId: number,
  x: number,
  y: number,
  size: number,
  isBack: boolean
): boolean {
  const sprite = getPokemonSprite(speciesId, isBack);
  if (!sprite) return false;

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
  ctx.imageSmoothingEnabled = true;
  return true;
}
