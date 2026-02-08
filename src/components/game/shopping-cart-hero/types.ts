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
}

export interface InputKeys {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}
