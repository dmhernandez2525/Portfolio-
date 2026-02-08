// ============================================================================
// Shopping Cart Hero — Canvas Renderer
// ============================================================================

import type { CartState, RunnerState, TrickState, PlayerUpgrades, GamePhase } from './types';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, COLORS,
  HILL_START_X, HILL_START_Y, HILL_END_X, HILL_END_Y,
  RAMP_WIDTH, MARKER_1_X, MARKER_2_X, FLAT_GROUND_Y,
} from './constants';
import { getDistance, getHeight } from './physics';

// --- Main render ---

export function render(
  ctx: CanvasRenderingContext2D,
  phase: GamePhase,
  cart: CartState,
  runner: RunnerState,
  tricks: TrickState,
  upgrades: PlayerUpgrades,
  cameraX: number,
  frameCount: number,
  money: number,
) {
  ctx.save();
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawSky(ctx, frameCount);
  drawClouds(ctx, cameraX, frameCount);
  drawBuildings(ctx, cameraX);

  ctx.translate(-cameraX, 0);

  drawGround(ctx, cameraX);
  drawHill(ctx);
  drawRamp(ctx);
  drawMarkers(ctx);

  if (phase === 'run' || phase === 'launch') {
    drawRunner(ctx, runner);
  }

  if (phase === 'flight' || phase === 'landing' || phase === 'results') {
    drawCart(ctx, cart, upgrades, tricks, frameCount);
  }

  ctx.restore();

  // HUD (screen-space)
  if (phase === 'flight' || phase === 'landing') {
    drawHUD(ctx, cart, tricks, money);
  }

  if (phase === 'flight' && tricks.comboTimer > 0) {
    drawComboText(ctx, tricks);
  }

  if (cart.crashed && (phase === 'landing' || phase === 'results')) {
    drawCrashEffect(ctx, frameCount);
  }
}

// --- Sky ---

function drawSky(ctx: CanvasRenderingContext2D, _frame: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, COLORS.sky);
  gradient.addColorStop(0.7, COLORS.skyHorizon);
  gradient.addColorStop(1, COLORS.ground);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

// --- Clouds (parallax) ---

function drawClouds(ctx: CanvasRenderingContext2D, cameraX: number, frame: number) {
  ctx.fillStyle = COLORS.cloud;
  const cloudPositions = [
    { x: 100, y: 40, w: 80, h: 25 },
    { x: 350, y: 60, w: 100, h: 30 },
    { x: 600, y: 30, w: 70, h: 20 },
    { x: 900, y: 50, w: 90, h: 28 },
    { x: 1200, y: 35, w: 110, h: 32 },
    { x: 1600, y: 55, w: 85, h: 24 },
    { x: 2000, y: 42, w: 95, h: 27 },
  ];

  for (const cloud of cloudPositions) {
    const parallaxX = cloud.x - cameraX * 0.15 + Math.sin(frame * 0.005 + cloud.x) * 3;
    const screenX = ((parallaxX % 2400) + 2400) % 2400 - 200;
    drawCloud(ctx, screenX, cloud.y, cloud.w, cloud.h);
  }
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.beginPath();
  ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.ellipse(x - w / 4, y + h / 4, w / 3, h / 3, 0, 0, Math.PI * 2);
  ctx.ellipse(x + w / 4, y + h / 4, w / 3, h / 3, 0, 0, Math.PI * 2);
  ctx.fill();
}

// --- Distant buildings (parallax) ---

function drawBuildings(ctx: CanvasRenderingContext2D, cameraX: number) {
  const buildingDefs = [
    { x: 200, w: 50, h: 80 },
    { x: 310, w: 35, h: 60 },
    { x: 400, w: 60, h: 100 },
    { x: 520, w: 40, h: 70 },
    { x: 650, w: 55, h: 90 },
    { x: 800, w: 45, h: 75 },
    { x: 950, w: 50, h: 85 },
    { x: 1100, w: 60, h: 110 },
    { x: 1300, w: 40, h: 65 },
  ];

  for (const b of buildingDefs) {
    const parallaxX = b.x - cameraX * 0.3;
    const screenX = ((parallaxX % 1600) + 1600) % 1600 - 200;
    const baseY = FLAT_GROUND_Y - 10;

    ctx.fillStyle = COLORS.building;
    ctx.fillRect(screenX, baseY - b.h, b.w, b.h);
    ctx.fillStyle = COLORS.buildingDark;
    ctx.fillRect(screenX, baseY - b.h, b.w, 3);

    // Windows
    ctx.fillStyle = COLORS.window;
    for (let wy = baseY - b.h + 10; wy < baseY - 5; wy += 15) {
      for (let wx = screenX + 6; wx < screenX + b.w - 6; wx += 12) {
        ctx.fillRect(wx, wy, 6, 8);
      }
    }
  }
}

// --- Ground ---

function drawGround(ctx: CanvasRenderingContext2D, cameraX: number) {
  ctx.fillStyle = COLORS.ground;
  ctx.fillRect(cameraX, FLAT_GROUND_Y, CANVAS_WIDTH + 200, CANVAS_HEIGHT - FLAT_GROUND_Y + 100);

  // Ground detail stripes
  ctx.fillStyle = COLORS.groundDark;
  for (let x = Math.floor(cameraX / 40) * 40; x < cameraX + CANVAS_WIDTH + 40; x += 40) {
    ctx.fillRect(x, FLAT_GROUND_Y, 2, 10);
  }

  // Dirt layer
  ctx.fillStyle = COLORS.dirt;
  ctx.fillRect(cameraX, FLAT_GROUND_Y + 10, CANVAS_WIDTH + 200, CANVAS_HEIGHT);
}

// --- Hill ---

function drawHill(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = COLORS.hill;
  ctx.beginPath();
  ctx.moveTo(0, CANVAS_HEIGHT);
  ctx.lineTo(0, HILL_START_Y);
  ctx.lineTo(HILL_START_X, HILL_START_Y);
  ctx.lineTo(HILL_END_X, HILL_END_Y);
  ctx.lineTo(HILL_END_X, CANVAS_HEIGHT);
  ctx.closePath();
  ctx.fill();

  // Hill surface line
  ctx.strokeStyle = COLORS.hillDark;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(HILL_START_X, HILL_START_Y);
  ctx.lineTo(HILL_END_X, HILL_END_Y);
  ctx.stroke();

  // Grass tufts
  ctx.strokeStyle = '#3d7a2a';
  ctx.lineWidth = 2;
  for (let x = HILL_START_X; x < HILL_END_X; x += 25) {
    const t = (x - HILL_START_X) / (HILL_END_X - HILL_START_X);
    const y = HILL_START_Y + t * (HILL_END_Y - HILL_START_Y);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 3, y - 6);
    ctx.moveTo(x, y);
    ctx.lineTo(x + 3, y - 5);
    ctx.stroke();
  }
}

// --- Ramp ---

function drawRamp(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = COLORS.ramp;
  ctx.beginPath();
  ctx.moveTo(HILL_END_X, HILL_END_Y);
  ctx.lineTo(HILL_END_X + RAMP_WIDTH, FLAT_GROUND_Y);
  ctx.lineTo(HILL_END_X + RAMP_WIDTH, FLAT_GROUND_Y + 8);
  ctx.lineTo(HILL_END_X, HILL_END_Y + 8);
  ctx.closePath();
  ctx.fill();

  // Ramp top edge highlight
  ctx.strokeStyle = COLORS.rampLight;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(HILL_END_X, HILL_END_Y);
  ctx.lineTo(HILL_END_X + RAMP_WIDTH, FLAT_GROUND_Y);
  ctx.stroke();
}

// --- Markers ---

function drawMarkers(ctx: CanvasRenderingContext2D) {
  const markers = [MARKER_1_X, MARKER_2_X];
  for (const mx of markers) {
    const t = (mx - HILL_START_X) / (HILL_END_X - HILL_START_X);
    const my = HILL_START_Y + t * (HILL_END_Y - HILL_START_Y);

    // Post
    ctx.strokeStyle = COLORS.marker;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(mx, my - 35);
    ctx.stroke();

    // Flag
    ctx.fillStyle = COLORS.markerFlag;
    ctx.beginPath();
    ctx.moveTo(mx, my - 35);
    ctx.lineTo(mx + 15, my - 30);
    ctx.lineTo(mx, my - 25);
    ctx.closePath();
    ctx.fill();
  }
}

// --- Stickman runner ---

function drawRunner(ctx: CanvasRenderingContext2D, runner: RunnerState) {
  const { x, y } = runner.pos;
  const legPhase = Math.sin(runner.frame * Math.PI);

  ctx.strokeStyle = COLORS.stickman;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  // Head
  ctx.beginPath();
  ctx.arc(x, y - 20, 6, 0, Math.PI * 2);
  ctx.stroke();

  // Body
  ctx.beginPath();
  ctx.moveTo(x, y - 14);
  ctx.lineTo(x, y);
  ctx.stroke();

  // Arms (running animation)
  ctx.beginPath();
  ctx.moveTo(x, y - 10);
  ctx.lineTo(x + 8 * legPhase, y - 5);
  ctx.moveTo(x, y - 10);
  ctx.lineTo(x - 8 * legPhase, y - 5);
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 8 * legPhase, y + 15);
  ctx.moveTo(x, y);
  ctx.lineTo(x - 8 * legPhase, y + 15);
  ctx.stroke();
}

// --- Cart with stickman ---

function drawCart(
  ctx: CanvasRenderingContext2D,
  cart: CartState,
  upgrades: PlayerUpgrades,
  tricks: TrickState,
  frame: number,
) {
  ctx.save();
  ctx.translate(cart.pos.x, cart.pos.y);
  ctx.rotate(cart.angle);

  // Cart body
  ctx.fillStyle = COLORS.cart;
  ctx.strokeStyle = COLORS.cartDark;
  ctx.lineWidth = 2;
  ctx.fillRect(-20, -15, 40, 20);
  ctx.strokeRect(-20, -15, 40, 20);

  // Cart handle
  ctx.strokeStyle = COLORS.cartDark;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-20, -15);
  ctx.lineTo(-25, -30);
  ctx.stroke();

  // Wheels
  ctx.fillStyle = COLORS.cartWheel;
  ctx.beginPath();
  ctx.arc(-12, 7, 5, 0, Math.PI * 2);
  ctx.arc(12, 7, 5, 0, Math.PI * 2);
  ctx.fill();

  // Wheel upgrade visual (bigger wheels)
  if (upgrades.wheels >= 2) {
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(-12, 7, 7, 0, Math.PI * 2);
    ctx.arc(12, 7, 7, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Stickman in cart
  if (!cart.crashed) {
    if (tricks.handstandActive) {
      drawCartStickmanHandstand(ctx);
    } else if (tricks.supermanActive) {
      drawCartStickmanSuperman(ctx);
    } else {
      drawCartStickmanNormal(ctx);
    }
  } else {
    drawCartStickmanCrashed(ctx);
  }

  // Groupies
  for (let i = 0; i < upgrades.groupies; i++) {
    drawGroupie(ctx, i);
  }

  // Rocket flame
  if (cart.rocketActive) {
    drawRocketFlame(ctx, frame);
  }

  ctx.restore();
}

function drawCartStickmanNormal(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = COLORS.stickman;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  // Head
  ctx.beginPath();
  ctx.arc(0, -30, 5, 0, Math.PI * 2);
  ctx.stroke();

  // Body
  ctx.beginPath();
  ctx.moveTo(0, -25);
  ctx.lineTo(0, -15);
  ctx.stroke();

  // Arms (holding cart handle)
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(-10, -18);
  ctx.moveTo(0, -22);
  ctx.lineTo(8, -18);
  ctx.stroke();

  // Legs (sitting)
  ctx.beginPath();
  ctx.moveTo(0, -15);
  ctx.lineTo(-6, -10);
  ctx.moveTo(0, -15);
  ctx.lineTo(6, -10);
  ctx.stroke();
}

function drawCartStickmanHandstand(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = COLORS.stickman;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  // Hands on cart
  ctx.beginPath();
  ctx.moveTo(-5, -15);
  ctx.lineTo(-5, -25);
  ctx.moveTo(5, -15);
  ctx.lineTo(5, -25);
  ctx.stroke();

  // Body (upside down)
  ctx.beginPath();
  ctx.moveTo(0, -25);
  ctx.lineTo(0, -45);
  ctx.stroke();

  // Head (at top)
  ctx.beginPath();
  ctx.arc(0, -50, 5, 0, Math.PI * 2);
  ctx.stroke();

  // Legs (spread)
  ctx.beginPath();
  ctx.moveTo(0, -45);
  ctx.lineTo(-6, -52);
  ctx.moveTo(0, -45);
  ctx.lineTo(6, -52);
  ctx.stroke();
}

function drawCartStickmanSuperman(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = COLORS.stickman;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  // Body stretched out behind cart
  ctx.beginPath();
  ctx.moveTo(0, -15);
  ctx.lineTo(30, -18);
  ctx.stroke();

  // Head
  ctx.beginPath();
  ctx.arc(-5, -22, 5, 0, Math.PI * 2);
  ctx.stroke();

  // Arms stretched forward
  ctx.beginPath();
  ctx.moveTo(-3, -20);
  ctx.lineTo(-18, -25);
  ctx.moveTo(-3, -18);
  ctx.lineTo(-18, -22);
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(30, -18);
  ctx.lineTo(38, -15);
  ctx.moveTo(30, -18);
  ctx.lineTo(38, -21);
  ctx.stroke();
}

function drawCartStickmanCrashed(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = '#cc0000';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  // Ragdoll stickman
  ctx.beginPath();
  ctx.arc(5, -20, 5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(5, -15);
  ctx.lineTo(0, -5);
  ctx.moveTo(5, -15);
  ctx.lineTo(12, -8);
  ctx.moveTo(0, -5);
  ctx.lineTo(-5, 2);
  ctx.moveTo(0, -5);
  ctx.lineTo(8, 3);
  ctx.stroke();

  // X eyes
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(3, -22);
  ctx.lineTo(5, -20);
  ctx.moveTo(5, -22);
  ctx.lineTo(3, -20);
  ctx.moveTo(6, -22);
  ctx.lineTo(8, -20);
  ctx.moveTo(8, -22);
  ctx.lineTo(6, -20);
  ctx.stroke();
}

function drawGroupie(ctx: CanvasRenderingContext2D, index: number) {
  const offsetX = -8 + index * 8;
  ctx.strokeStyle = '#4444cc';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';

  // Small stickman
  ctx.beginPath();
  ctx.arc(offsetX, -26, 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(offsetX, -23);
  ctx.lineTo(offsetX, -17);
  ctx.moveTo(offsetX, -20);
  ctx.lineTo(offsetX - 3, -18);
  ctx.moveTo(offsetX, -20);
  ctx.lineTo(offsetX + 3, -18);
  ctx.stroke();
}

function drawRocketFlame(ctx: CanvasRenderingContext2D, frame: number) {
  const flicker = Math.sin(frame * 0.5) * 5;
  ctx.fillStyle = COLORS.rocketFlame;
  ctx.beginPath();
  ctx.moveTo(20, -5);
  ctx.lineTo(35 + flicker, -2);
  ctx.lineTo(20, 1);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = COLORS.rocket;
  ctx.beginPath();
  ctx.moveTo(20, -3);
  ctx.lineTo(28 + flicker * 0.5, -1);
  ctx.lineTo(20, 0);
  ctx.closePath();
  ctx.fill();
}

// --- HUD ---

function drawHUD(ctx: CanvasRenderingContext2D, cart: CartState, tricks: TrickState, money: number) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  roundRect(ctx, 10, 10, 200, 80, 8);
  ctx.fill();

  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'left';

  const dist = getDistance(cart);
  const height = getHeight(cart);

  ctx.fillText(`Distance: ${dist}m`, 20, 30);
  ctx.fillText(`Height: ${height}m`, 20, 48);
  ctx.fillText(`Tricks: ${tricks.trickPoints} pts`, 20, 66);

  // Money
  ctx.fillStyle = COLORS.money;
  ctx.textAlign = 'right';
  ctx.fillText(`$${money}`, CANVAS_WIDTH - 20, 30);
}

function drawComboText(ctx: CanvasRenderingContext2D, tricks: TrickState) {
  const alpha = tricks.comboTimer / 60;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = COLORS.money;
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(tricks.comboText, CANVAS_WIDTH / 2, 120 - (1 - alpha) * 20);
  ctx.globalAlpha = 1;
}

function drawCrashEffect(ctx: CanvasRenderingContext2D, frame: number) {
  const flash = Math.sin(frame * 0.3) * 0.3;
  if (flash > 0) {
    ctx.fillStyle = `rgba(255, 0, 0, ${flash})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  ctx.fillStyle = COLORS.crash;
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CRASH!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
}

// --- Utility ---

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
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
