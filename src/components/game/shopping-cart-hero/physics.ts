// ============================================================================
// Shopping Cart Hero — Physics Engine
// ============================================================================

import type { CartState, RunnerState, TrickState, PlayerUpgrades, InputKeys } from './types';
import {
  GRAVITY, AIR_DRAG, ROTATION_SPEED, BOUNCE_COEFFICIENT, ROLL_FRICTION,
  MIN_BOUNCE_VEL, RUN_ACCELERATION, MAX_RUN_SPEED,
  HILL_START_X, HILL_START_Y, HILL_END_X, HILL_END_Y,
  RAMP_WIDTH, LAUNCH_ANGLE, LAUNCH_SPEED_MULT, FLAT_GROUND_Y,
  MARKER_1_X, MARKER_2_X,
  WHEEL_MULTIPLIERS, ROCKET_CONFIGS, ARMOR_CRASH_ANGLES,
  FLIP_POINTS, HANDSTAND_POINTS, SUPERMAN_POINTS,
} from './constants';

// --- Hill geometry helpers ---

function getHillY(x: number): number {
  if (x < HILL_START_X) return HILL_START_Y;
  if (x > HILL_END_X) return FLAT_GROUND_Y;
  const t = (x - HILL_START_X) / (HILL_END_X - HILL_START_X);
  return HILL_START_Y + t * (HILL_END_Y - HILL_START_Y);
}

function getGroundY(x: number): number {
  if (x <= HILL_END_X + RAMP_WIDTH) return getHillY(x);
  return FLAT_GROUND_Y;
}

// --- Runner physics ---

export function createRunner(): RunnerState {
  return {
    pos: { x: HILL_START_X + 20, y: getHillY(HILL_START_X + 20) - 20 },
    speed: 0,
    frame: 0,
    passedMarker1: false,
    passedMarker2: false,
  };
}

export function updateRunner(runner: RunnerState, keys: InputKeys): RunnerState {
  const next = { ...runner };

  if (keys.right) {
    next.speed = Math.min(next.speed + RUN_ACCELERATION, MAX_RUN_SPEED);
  } else {
    next.speed = Math.max(0, next.speed - 0.1);
  }

  next.pos = { ...next.pos };
  next.pos.x += next.speed;
  next.pos.y = getHillY(next.pos.x) - 20;

  next.frame = next.speed > 0.5 ? (next.frame + 0.2) % 4 : 0;

  if (next.pos.x >= MARKER_1_X) next.passedMarker1 = true;
  if (next.pos.x >= MARKER_2_X) next.passedMarker2 = true;

  return next;
}

// --- Cart physics ---

export function createCart(): CartState {
  return {
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    angle: 0,
    angularVel: 0,
    onGround: false,
    crashed: false,
    inCart: false,
    rocketFuel: 0,
    rocketActive: false,
    bounceCount: 0,
    rolling: false,
  };
}

export function launchCart(runner: RunnerState, upgrades: PlayerUpgrades): CartState {
  const speed = runner.speed * LAUNCH_SPEED_MULT;
  const rocketConfig = ROCKET_CONFIGS[upgrades.rockets];

  return {
    pos: { x: HILL_END_X + RAMP_WIDTH, y: HILL_END_Y - 10 },
    vel: {
      x: speed * Math.cos(LAUNCH_ANGLE),
      y: speed * Math.sin(LAUNCH_ANGLE),
    },
    angle: LAUNCH_ANGLE * 0.3,
    angularVel: 0,
    onGround: false,
    crashed: false,
    inCart: true,
    rocketFuel: rocketConfig.frames,
    rocketActive: false,
    bounceCount: 0,
    rolling: false,
  };
}

export function updateCartFlight(
  cart: CartState,
  keys: InputKeys,
  upgrades: PlayerUpgrades,
): CartState {
  const next: CartState = {
    ...cart,
    pos: { ...cart.pos },
    vel: { ...cart.vel },
  };

  // Gravity
  next.vel.y += GRAVITY;

  // Air drag
  next.vel.x *= AIR_DRAG;
  next.vel.y *= AIR_DRAG;

  // Rockets
  if (next.rocketFuel > 0) {
    next.rocketActive = true;
    const rocketConfig = ROCKET_CONFIGS[upgrades.rockets];
    next.vel.x += Math.cos(next.angle) * rocketConfig.force * 0.3;
    next.vel.y -= rocketConfig.force * 0.5;
    next.rocketFuel--;
  } else {
    next.rocketActive = false;
  }

  // Rotation from input
  if (keys.left) {
    next.angularVel -= ROTATION_SPEED * 0.3;
  }
  if (keys.right) {
    next.angularVel += ROTATION_SPEED * 0.3;
  }
  next.angularVel *= 0.95; // angular damping
  next.angle += next.angularVel;

  // Position update
  next.pos.x += next.vel.x;
  next.pos.y += next.vel.y;

  // Ground collision
  const ground = getGroundY(next.pos.x);
  if (next.pos.y >= ground - 15) {
    next.pos.y = ground - 15;
    return handleLanding(next, upgrades);
  }

  return next;
}

function handleLanding(cart: CartState, upgrades: PlayerUpgrades): CartState {
  const next = { ...cart };
  const crashAngle = ARMOR_CRASH_ANGLES[upgrades.armor];

  // Normalize angle to [-PI, PI]
  let normalizedAngle = next.angle % (Math.PI * 2);
  if (normalizedAngle > Math.PI) normalizedAngle -= Math.PI * 2;
  if (normalizedAngle < -Math.PI) normalizedAngle += Math.PI * 2;

  const angleFromLevel = Math.abs(normalizedAngle);

  if (angleFromLevel > crashAngle) {
    next.crashed = true;
    next.vel = { x: 0, y: 0 };
    next.angularVel = 0;
    next.onGround = true;
    return next;
  }

  // Bounce
  if (Math.abs(next.vel.y) > MIN_BOUNCE_VEL && next.bounceCount < 3) {
    next.vel.y = -next.vel.y * BOUNCE_COEFFICIENT;
    next.vel.x *= 0.9;
    next.bounceCount++;
    next.angularVel *= 0.5;
    return next;
  }

  // Start rolling
  next.onGround = true;
  next.rolling = true;
  next.vel.y = 0;
  next.angle = 0;
  next.angularVel = 0;

  return next;
}

export function updateCartRolling(cart: CartState, upgrades: PlayerUpgrades): CartState {
  const next: CartState = {
    ...cart,
    pos: { ...cart.pos },
    vel: { ...cart.vel },
  };

  const wheelMult = WHEEL_MULTIPLIERS[upgrades.wheels];
  next.vel.x *= ROLL_FRICTION * (1 + (wheelMult - 1) * 0.1);
  next.pos.x += next.vel.x;

  // Stop when slow enough
  if (Math.abs(next.vel.x) < 0.3) {
    next.vel.x = 0;
  }

  return next;
}

// --- Trick detection ---

export function createTrickState(): TrickState {
  return {
    totalRotation: 0,
    flipsCompleted: 0,
    handstandActive: false,
    handstandFrames: 0,
    supermanActive: false,
    supermanFrames: 0,
    trickPoints: 0,
    comboText: '',
    comboTimer: 0,
  };
}

export function updateTricks(
  tricks: TrickState,
  cart: CartState,
  keys: InputKeys,
  upgrades: PlayerUpgrades,
): TrickState {
  if (cart.onGround || cart.crashed) return tricks;

  const next = { ...tricks };

  // Track rotation for flips
  next.totalRotation += cart.angularVel;
  const newFlips = Math.floor(Math.abs(next.totalRotation) / (Math.PI * 2));
  if (newFlips > next.flipsCompleted) {
    const earned = (newFlips - next.flipsCompleted) * FLIP_POINTS;
    next.trickPoints += earned;
    next.flipsCompleted = newFlips;
    next.comboText = `FLIP! +${earned}`;
    next.comboTimer = 60;
  }

  // Handstand (hold DOWN)
  if (keys.down && upgrades.handstand && !next.supermanActive) {
    if (!next.handstandActive) {
      next.handstandActive = true;
      next.handstandFrames = 0;
    }
    next.handstandFrames++;
    if (next.handstandFrames % 30 === 0) {
      next.trickPoints += HANDSTAND_POINTS;
      next.comboText = `HANDSTAND! +${HANDSTAND_POINTS}`;
      next.comboTimer = 60;
    }
  } else {
    next.handstandActive = false;
    next.handstandFrames = 0;
  }

  // Superman (hold UP)
  if (keys.up && upgrades.superman && !next.handstandActive) {
    if (!next.supermanActive) {
      next.supermanActive = true;
      next.supermanFrames = 0;
    }
    next.supermanFrames++;
    if (next.supermanFrames % 30 === 0) {
      next.trickPoints += SUPERMAN_POINTS;
      next.comboText = `SUPERMAN! +${SUPERMAN_POINTS}`;
      next.comboTimer = 60;
    }
  } else {
    next.supermanActive = false;
    next.supermanFrames = 0;
  }

  // Combo timer
  if (next.comboTimer > 0) next.comboTimer--;

  return next;
}

// --- Distance / height tracking ---

export function getDistance(cart: CartState): number {
  return Math.max(0, Math.floor(cart.pos.x - (HILL_END_X + RAMP_WIDTH)));
}

export function getHeight(cart: CartState): number {
  return Math.max(0, Math.floor(FLAT_GROUND_Y - cart.pos.y));
}
