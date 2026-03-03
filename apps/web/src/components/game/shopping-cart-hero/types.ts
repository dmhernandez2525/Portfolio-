// ============================================================================
// Shopping Cart Hero — Type Definitions
// ============================================================================

export type GamePhase = 'menu' | 'shop' | 'run' | 'launch' | 'flight' | 'landing' | 'results';

export type UpgradeCategory = 'wheels' | 'rockets' | 'armor' | 'tricks' | 'groupies';

export interface Vec2 {
  x: number;
  y: number;
}

export interface CartState {
  pos: Vec2;
  vel: Vec2;
  angle: number;           // radians
  angularVel: number;
  onGround: boolean;
  crashed: boolean;
  inCart: boolean;          // stickman jumped into cart
  rocketFuel: number;      // remaining rocket frames
  rocketActive: boolean;
  bounceCount: number;
  rolling: boolean;
}

export interface RunnerState {
  pos: Vec2;
  speed: number;
  frame: number;           // animation frame
  passedMarker1: boolean;
  passedMarker2: boolean;
  marker1Power: number;      // 0-1, power achieved at marker 1
  marker2Power: number;      // 0-1, power achieved at marker 2
  inTimingWindow1: boolean;  // currently in marker 1 timing zone
  inTimingWindow2: boolean;  // currently in marker 2 timing zone
  marker1Locked: boolean;    // player already pressed UP for marker 1
  marker2Locked: boolean;    // player already pressed UP for marker 2
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export interface TrickState {
  totalRotation: number;   // accumulated rotation in current direction
  flipsCompleted: number;
  handstandActive: boolean;
  handstandFrames: number;
  supermanActive: boolean;
  supermanFrames: number;
  trickPoints: number;
  comboText: string;
  comboTimer: number;
}

export interface UpgradeTier {
  name: string;
  cost: number;
  description: string;
}

export interface UpgradeDef {
  category: UpgradeCategory;
  tiers: UpgradeTier[];
}

export interface PlayerUpgrades {
  wheels: number;          // tier index (0 = default)
  rockets: number;
  armor: number;
  handstand: boolean;
  superman: boolean;
  backflip: boolean;
  groupies: number;        // 0-3
}

export interface RunResult {
  distance: number;
  maxHeight: number;
  trickPoints: number;
  crashed: boolean;
  groupiesLost: number;
  moneyEarned: number;
  totalScore: number;
}

export interface GameState {
  phase: GamePhase;
  money: number;
  highScore: number;
  totalRuns: number;
  upgrades: PlayerUpgrades;
  cart: CartState;
  runner: RunnerState;
  tricks: TrickState;
  lastResult: RunResult | null;
  cameraX: number;         // horizontal scroll offset
  groundY: number;         // ground level at current camera position
  particles: Particle[];
}

export interface InputKeys {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  space: boolean;
}
