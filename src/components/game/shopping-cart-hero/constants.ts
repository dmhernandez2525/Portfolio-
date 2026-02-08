// ============================================================================
// Shopping Cart Hero — Game Constants & Upgrade Definitions
// ============================================================================

import type { UpgradeDef, PlayerUpgrades } from './types';

// --- Canvas ---
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 500;

// --- Hill geometry ---
export const HILL_START_X = 50;
export const HILL_START_Y = 80;
export const HILL_END_X = 500;
export const HILL_END_Y = 380;
export const RAMP_WIDTH = 60;

// --- Marker posts ---
export const MARKER_1_X = 300;  // "jump into cart" marker
export const MARKER_2_X = 460;  // ramp approach marker

// --- Physics ---
export const RUN_ACCELERATION = 0.3;
export const MAX_RUN_SPEED = 14;
export const GRAVITY = 0.38;
export const AIR_DRAG = 0.9985;
export const ROTATION_SPEED = 0.07;  // radians per frame
export const BOUNCE_COEFFICIENT = 0.45;
export const ROLL_FRICTION = 0.985;
export const MIN_BOUNCE_VEL = 2;
// --- Launch ---
export const LAUNCH_ANGLE = -Math.PI / 3.5; // ~51 degrees upward
export const LAUNCH_SPEED_MULT = 1.6;        // speed multiplier at launch

// --- Ground ---
export const FLAT_GROUND_Y = HILL_END_Y + 20;

// --- Scoring ---
export const DISTANCE_SCORE_DIVISOR = 10;
export const HEIGHT_SCORE_DIVISOR = 5;
export const FLIP_POINTS = 300;
export const HANDSTAND_POINTS = 200;
export const SUPERMAN_POINTS = 350;
export const BACKFLIP_POINTS = 300;

// --- Upgrades ---

export const WHEEL_UPGRADES: UpgradeDef = {
  category: 'wheels',
  tiers: [
    { name: 'Junk Wheels', cost: 0, description: 'Rusty and barely round' },
    { name: 'Round Wheels', cost: 200, description: '1.3x roll distance' },
    { name: 'Metal Wheels', cost: 800, description: '1.6x roll distance' },
    { name: 'Racing Wheels', cost: 2500, description: '2.0x roll distance' },
  ],
};

export const ROCKET_UPGRADES: UpgradeDef = {
  category: 'rockets',
  tiers: [
    { name: 'No Rockets', cost: 0, description: 'Nothing but gravity' },
    { name: 'Bottle Rocket', cost: 500, description: '30 frames of thrust' },
    { name: 'Medium Rocket', cost: 1500, description: '50 frames of thrust' },
    { name: 'Mega Rocket', cost: 5000, description: '80 frames of thrust' },
  ],
};

export const ARMOR_UPGRADES: UpgradeDef = {
  category: 'armor',
  tiers: [
    { name: 'No Protection', cost: 0, description: 'Hope for the best' },
    { name: 'Padding', cost: 300, description: 'Survive steeper landings' },
    { name: 'Helmet + Pads', cost: 1200, description: 'Much crash resistance' },
    { name: 'Full Armor', cost: 4000, description: 'Nearly uncrashable' },
  ],
};

export const TRICK_DEFS = [
  { id: 'handstand' as const, name: 'Handstand', cost: 400, description: 'Hold DOWN mid-air: 200 pts', points: HANDSTAND_POINTS },
  { id: 'superman' as const, name: 'Superman', cost: 1000, description: 'Hold UP mid-air: 350 pts', points: SUPERMAN_POINTS },
  { id: 'backflip' as const, name: 'Backflip', cost: 600, description: 'Rotate backward: 300 pts', points: BACKFLIP_POINTS },
];

export const GROUPIE_COSTS = [1500, 3000, 6000];

// --- Upgrade effect values ---

export const WHEEL_MULTIPLIERS = [1.0, 1.3, 1.6, 2.0];

export const ROCKET_CONFIGS = [
  { frames: 0, force: 0 },
  { frames: 30, force: 0.8 },
  { frames: 50, force: 1.2 },
  { frames: 80, force: 1.8 },
];

export const ARMOR_CRASH_ANGLES = [
  Math.PI / 4,       // 45°
  Math.PI / 3,       // 60°
  (5 * Math.PI) / 12, // 75°
  Math.PI / 2,       // 90° (basically no crash)
];

export const GROUPIE_MULTIPLIERS = [1, 2, 3, 4];

// --- Default upgrades ---

export const DEFAULT_UPGRADES: PlayerUpgrades = {
  wheels: 0,
  rockets: 0,
  armor: 0,
  handstand: false,
  superman: false,
  backflip: false,
  groupies: 0,
};

// --- Colors ---

export const COLORS = {
  sky: '#87CEEB',
  skyHorizon: '#d4eaf7',
  ground: '#5a9e3e',
  groundDark: '#4a8e2e',
  dirt: '#8B7355',
  hill: '#6aae4e',
  hillDark: '#5a9e3e',
  ramp: '#555555',
  rampLight: '#777777',
  marker: '#ff6600',
  markerFlag: '#ff3300',
  stickman: '#222222',
  cart: '#888888',
  cartDark: '#666666',
  cartWheel: '#333333',
  rocket: '#ff4444',
  rocketFlame: '#ffaa00',
  cloud: 'rgba(255, 255, 255, 0.8)',
  building: '#aaaaaa',
  buildingDark: '#888888',
  window: '#66aacc',
  crash: '#ff0000',
  money: '#ffdd00',
  text: '#ffffff',
  textDark: '#000000',
  ui: '#1a1a2e',
  uiLight: '#16213e',
  uiAccent: '#e94560',
  uiButton: '#0f3460',
};
