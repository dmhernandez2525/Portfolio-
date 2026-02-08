// ============================================================================
// Pokemon RPG Engine — Main Renderer
// ============================================================================

import type { Camera, GameMap, Player, BattleState, BattlePokemon } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from './constants';
import { renderMap, renderAboveLayer, renderNPCs, renderPlayer } from './tilemap';

// --- Overworld rendering ---

export function renderOverworld(
  ctx: CanvasRenderingContext2D,
  map: GameMap,
  player: Player,
  camera: Camera,
  frameCount: number
) {
  // Clear
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Ground + objects
  renderMap(ctx, map, camera);

  // NPCs
  renderNPCs(ctx, map, camera, frameCount);

  // Player — pixel position is already interpolated by the movement system
  const playerPixelX = player.x;
  const playerPixelY = player.y;

  renderPlayer(ctx, playerPixelX, playerPixelY, player.direction, player.isMoving, frameCount, camera);

  // Above layer (renders over player for tree canopy effect, etc)
  renderAboveLayer(ctx, map, camera);

  // Map name overlay (fade in/out)
  renderMapName(ctx, map.name, frameCount);
}

// --- Map name display ---

let mapNameTimer = 0;
let currentMapName = '';

export function showMapName(name: string) {
  currentMapName = name;
  mapNameTimer = 120; // 2 seconds at 60fps
}

function renderMapName(ctx: CanvasRenderingContext2D, _name: string, _frame: number) {
  if (mapNameTimer <= 0) return;
  mapNameTimer--;

  const alpha = mapNameTimer > 90 ? 1 : mapNameTimer / 90;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(CANVAS_WIDTH / 2 - 100, 20, 200, 30);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(currentMapName, CANVAS_WIDTH / 2, 40);
  ctx.globalAlpha = 1;
}

// --- Battle rendering (procedural, no sprites needed) ---

export function renderBattle(
  ctx: CanvasRenderingContext2D,
  battle: BattleState,
  frameCount: number
) {
  // Background
  ctx.fillStyle = '#e8e8e8';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Battle field
  drawBattleBackground(ctx);

  // Opponent Pokemon (top-right)
  drawBattlePokemon(ctx, battle.opponentActive, 340, 50, false, frameCount);

  // Player Pokemon (bottom-left)
  drawBattlePokemon(ctx, battle.playerActive, 100, 150, true, frameCount);

  // Opponent info box (top-left)
  drawPokemonInfoBox(ctx, battle.opponentActive, 10, 10, false);

  // Player info box (bottom-right)
  drawPokemonInfoBox(ctx, battle.playerActive, 250, 175, true);

  // Text box at bottom
  drawTextBox(ctx, battle.currentText);
}

function drawBattleBackground(ctx: CanvasRenderingContext2D) {
  // Grass platform for opponent
  ctx.fillStyle = '#80b050';
  ctx.beginPath();
  ctx.ellipse(360, 110, 80, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#60903a';
  ctx.beginPath();
  ctx.ellipse(360, 115, 80, 15, 0, 0, Math.PI);
  ctx.fill();

  // Grass platform for player
  ctx.fillStyle = '#80b050';
  ctx.beginPath();
  ctx.ellipse(120, 210, 90, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#60903a';
  ctx.beginPath();
  ctx.ellipse(120, 216, 90, 17, 0, 0, Math.PI);
  ctx.fill();
}

function drawBattlePokemon(
  ctx: CanvasRenderingContext2D,
  bp: BattlePokemon,
  x: number,
  y: number,
  isBack: boolean,
  frame: number
) {
  const pokemon = bp.pokemon;
  const size = isBack ? 64 : 48;

  // Idle bounce animation
  const bounceY = Math.sin(frame * 0.05) * 2;

  // Faint animation
  if (pokemon.currentHp <= 0) {
    ctx.globalAlpha = 0.3;
  }

  // Draw a simple colored shape based on type
  const typeColor = TYPE_COLORS[pokemon.moves[0]?.moveId ? 'normal' : 'normal'];
  ctx.fillStyle = typeColor;

  // Body (rounded rectangle)
  const bx = x - size / 2;
  const by = y - size / 2 + bounceY;
  roundRect(ctx, bx, by, size, size, 8);
  ctx.fill();

  // Eyes (if front view)
  if (!isBack) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - size / 5, y - size / 6 + bounceY, 5, 0, Math.PI * 2);
    ctx.arc(x + size / 5, y - size / 6 + bounceY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x - size / 5 + 1, y - size / 6 + bounceY, 3, 0, Math.PI * 2);
    ctx.arc(x + size / 5 + 1, y - size / 6 + bounceY, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Species ID label (placeholder for sprite)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`#${pokemon.speciesId}`, x, y + size / 4 + bounceY);

  ctx.globalAlpha = 1;
}

function drawPokemonInfoBox(
  ctx: CanvasRenderingContext2D,
  bp: BattlePokemon,
  x: number,
  y: number,
  showExp: boolean
) {
  const pokemon = bp.pokemon;
  const w = 220;
  const h = showExp ? 70 : 55;

  // Box background
  ctx.fillStyle = COLORS.textBox;
  ctx.strokeStyle = COLORS.textBoxBorder;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 6);
  ctx.fill();
  ctx.stroke();

  // Name and level
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'left';
  const name = pokemon.nickname ?? `Pokemon #${pokemon.speciesId}`;
  ctx.fillText(name, x + 8, y + 18);
  ctx.font = '11px monospace';
  ctx.fillText(`Lv${pokemon.level}`, x + w - 50, y + 18);

  // HP bar
  const hpRatio = pokemon.currentHp / pokemon.stats.hp;
  const hpBarX = x + 40;
  const hpBarY = y + 28;
  const hpBarW = w - 55;
  const hpBarH = 8;

  ctx.fillStyle = '#404040';
  ctx.fillRect(hpBarX, hpBarY, hpBarW, hpBarH);

  const hpColor = hpRatio > 0.5 ? COLORS.hpGreen : hpRatio > 0.2 ? COLORS.hpYellow : COLORS.hpRed;
  ctx.fillStyle = hpColor;
  ctx.fillRect(hpBarX, hpBarY, hpBarW * hpRatio, hpBarH);

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('HP', x + 8, y + 35);

  // HP numbers (only for player's pokemon)
  if (showExp) {
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${pokemon.currentHp}/${pokemon.stats.hp}`, x + w - 8, y + 50);

    // EXP bar
    const expBarY = y + 56;
    ctx.fillStyle = '#404040';
    ctx.fillRect(x + 8, expBarY, w - 16, 5);
    ctx.fillStyle = COLORS.expBar;
    // Simplified exp display
    const expRatio = 0.5; // placeholder
    ctx.fillRect(x + 8, expBarY, (w - 16) * expRatio, 5);
  }

  // Status condition
  if (pokemon.status) {
    const statusColors: Record<string, string> = {
      burn: '#e07030', freeze: '#70c0e0', paralysis: '#e0c030',
      poison: '#a040a0', bad_poison: '#700070', sleep: '#a0a0a0',
    };
    const statusLabels: Record<string, string> = {
      burn: 'BRN', freeze: 'FRZ', paralysis: 'PAR',
      poison: 'PSN', bad_poison: 'PSN', sleep: 'SLP',
    };
    ctx.fillStyle = statusColors[pokemon.status] || '#808080';
    roundRect(ctx, x + 8, y + (showExp ? 42 : 38), 28, 12, 3);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(statusLabels[pokemon.status] || '???', x + 22, y + (showExp ? 51 : 47));
  }
}

export function drawTextBox(ctx: CanvasRenderingContext2D, text: string) {
  const x = 10;
  const y = CANVAS_HEIGHT - 70;
  const w = CANVAS_WIDTH - 20;
  const h = 60;

  ctx.fillStyle = COLORS.textBox;
  ctx.strokeStyle = COLORS.textBoxBorder;
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#000000';
  ctx.font = '13px monospace';
  ctx.textAlign = 'left';

  // Word-wrap text
  const maxWidth = w - 24;
  const words = text.split(' ');
  let line = '';
  let lineY = y + 22;

  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line !== '') {
      ctx.fillText(line.trim(), x + 12, lineY);
      line = word + ' ';
      lineY += 18;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x + 12, lineY);
}

// --- Battle transition effect ---

export function renderBattleTransition(
  ctx: CanvasRenderingContext2D,
  progress: number // 0 to 1
) {
  if (progress <= 0) return;

  // Spiral/swirl wipe effect
  const cx = CANVAS_WIDTH / 2;
  const cy = CANVAS_HEIGHT / 2;
  const maxRadius = Math.sqrt(cx * cx + cy * cy);

  ctx.fillStyle = '#000000';

  if (progress < 0.5) {
    // Flash white
    const flash = Math.sin(progress * Math.PI * 6);
    if (flash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${flash * 0.8})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  } else {
    // Circle shrink
    const t = (progress - 0.5) * 2;
    const radius = maxRadius * (1 - t);

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (radius > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();
    }
  }
}

// --- Dialog box rendering ---

export function renderDialog(
  ctx: CanvasRenderingContext2D,
  text: string,
  showContinue: boolean
) {
  drawTextBox(ctx, text);

  // Continue arrow
  if (showContinue) {
    const arrowX = CANVAS_WIDTH - 30;
    const arrowY = CANVAS_HEIGHT - 18;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX + 6, arrowY + 6);
    ctx.lineTo(arrowX - 6, arrowY + 6);
    ctx.fill();
  }
}

// --- Utility ---

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

const TYPE_COLORS: Record<string, string> = {
  normal: '#a8a878', fire: '#f08030', water: '#6890f0', electric: '#f8d030',
  grass: '#78c850', ice: '#98d8d8', fighting: '#c03028', poison: '#a040a0',
  ground: '#e0c068', flying: '#a890f0', psychic: '#f85888', bug: '#a8b820',
  rock: '#b8a038', ghost: '#705898', dragon: '#7038f8', dark: '#705848',
  steel: '#b8b8d0', fairy: '#ee99ac',
};
