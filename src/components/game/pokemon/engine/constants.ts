// ============================================================================
// Pokemon RPG Engine — Constants & Configuration
// ============================================================================

import type { PokemonType, Nature, StatName } from './types';

// --- Canvas / Viewport ---

export const TILE_SIZE = 16;           // base tile size (GBA native)
export const RENDER_SCALE = 2;         // 2x upscale for crisp pixels
export const SCALED_TILE = TILE_SIZE * RENDER_SCALE;  // 32px rendered
export const VIEWPORT_WIDTH = 240;     // GBA native resolution
export const VIEWPORT_HEIGHT = 160;
export const CANVAS_WIDTH = VIEWPORT_WIDTH * RENDER_SCALE;   // 480
export const CANVAS_HEIGHT = VIEWPORT_HEIGHT * RENDER_SCALE;  // 320

// --- Player movement ---

export const PLAYER_SPEED = 2;         // pixels per frame at RENDER_SCALE
export const MOVE_DURATION = SCALED_TILE / PLAYER_SPEED; // frames to cross one tile
export const ENCOUNTER_RATE = 0.1;     // 10% per tall grass step
export const STEPS_PER_POISON_TICK = 4;

// --- Battle ---

export const MAX_PARTY_SIZE = 6;
export const MAX_MOVES = 4;
export const MAX_PP_UPS = 3;
export const STAT_STAGE_MIN = -6;
export const STAT_STAGE_MAX = 6;
export const MAX_LEVEL = 100;
export const CRIT_STAGE_MULTIPLIERS = [1 / 16, 1 / 8, 1 / 4, 1 / 3, 1 / 2];
export const BASE_CRIT_STAGE = 0;
export const TEXT_SPEED = 2;           // chars per frame in dialog

// Stat stage multipliers: stage → multiplier
export const STAT_STAGE_MULTIPLIERS: Record<number, number> = {
  [-6]: 2 / 8, [-5]: 2 / 7, [-4]: 2 / 6, [-3]: 2 / 5,
  [-2]: 2 / 4, [-1]: 2 / 3, [0]: 1,
  [1]: 3 / 2, [2]: 4 / 2, [3]: 5 / 2,
  [4]: 6 / 2, [5]: 7 / 2, [6]: 8 / 2,
};

export const ACCURACY_STAGE_MULTIPLIERS: Record<number, number> = {
  [-6]: 3 / 9, [-5]: 3 / 8, [-4]: 3 / 7, [-3]: 3 / 6,
  [-2]: 3 / 5, [-1]: 3 / 4, [0]: 1,
  [1]: 4 / 3, [2]: 5 / 3, [3]: 6 / 3,
  [4]: 7 / 3, [5]: 8 / 3, [6]: 9 / 3,
};

// --- Type effectiveness chart ---
// Row = attacking type, Col = defending type
// 0 = immune, 0.5 = not very effective, 1 = normal, 2 = super effective

const TYPES: PokemonType[] = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
];

// Compact chart: only store non-1.0 entries
const EFFECTIVENESS_OVERRIDES: Record<string, number> = {
  // Normal
  'normal>rock': 0.5, 'normal>ghost': 0, 'normal>steel': 0.5,
  // Fire
  'fire>fire': 0.5, 'fire>water': 0.5, 'fire>grass': 2, 'fire>ice': 2,
  'fire>bug': 2, 'fire>rock': 0.5, 'fire>dragon': 0.5, 'fire>steel': 2,
  // Water
  'water>fire': 2, 'water>water': 0.5, 'water>grass': 0.5, 'water>ground': 2,
  'water>rock': 2, 'water>dragon': 0.5,
  // Electric
  'electric>water': 2, 'electric>electric': 0.5, 'electric>grass': 0.5,
  'electric>ground': 0, 'electric>flying': 2, 'electric>dragon': 0.5,
  // Grass
  'grass>fire': 0.5, 'grass>water': 2, 'grass>grass': 0.5, 'grass>poison': 0.5,
  'grass>ground': 2, 'grass>flying': 0.5, 'grass>bug': 0.5, 'grass>rock': 2,
  'grass>dragon': 0.5, 'grass>steel': 0.5,
  // Ice
  'ice>fire': 0.5, 'ice>water': 0.5, 'ice>grass': 2, 'ice>ice': 0.5,
  'ice>ground': 2, 'ice>flying': 2, 'ice>dragon': 2, 'ice>steel': 0.5,
  // Fighting
  'fighting>normal': 2, 'fighting>ice': 2, 'fighting>poison': 0.5,
  'fighting>flying': 0.5, 'fighting>psychic': 0.5, 'fighting>bug': 0.5,
  'fighting>rock': 2, 'fighting>ghost': 0, 'fighting>dark': 2, 'fighting>steel': 2,
  'fighting>fairy': 0.5,
  // Poison
  'poison>grass': 2, 'poison>poison': 0.5, 'poison>ground': 0.5,
  'poison>rock': 0.5, 'poison>ghost': 0.5, 'poison>steel': 0, 'poison>fairy': 2,
  // Ground
  'ground>fire': 2, 'ground>electric': 2, 'ground>grass': 0.5,
  'ground>poison': 2, 'ground>flying': 0, 'ground>bug': 0.5, 'ground>rock': 2,
  'ground>steel': 2,
  // Flying
  'flying>electric': 0.5, 'flying>grass': 2, 'flying>fighting': 2,
  'flying>bug': 2, 'flying>rock': 0.5, 'flying>steel': 0.5,
  // Psychic
  'psychic>fighting': 2, 'psychic>poison': 2, 'psychic>psychic': 0.5,
  'psychic>dark': 0, 'psychic>steel': 0.5,
  // Bug
  'bug>fire': 0.5, 'bug>grass': 2, 'bug>fighting': 0.5, 'bug>poison': 0.5,
  'bug>flying': 0.5, 'bug>psychic': 2, 'bug>ghost': 0.5, 'bug>dark': 2,
  'bug>steel': 0.5, 'bug>fairy': 0.5,
  // Rock
  'rock>fire': 2, 'rock>ice': 2, 'rock>fighting': 0.5, 'rock>ground': 0.5,
  'rock>flying': 2, 'rock>bug': 2, 'rock>steel': 0.5,
  // Ghost
  'ghost>normal': 0, 'ghost>psychic': 2, 'ghost>ghost': 2, 'ghost>dark': 0.5,
  // Dragon
  'dragon>dragon': 2, 'dragon>steel': 0.5, 'dragon>fairy': 0,
  // Dark
  'dark>fighting': 0.5, 'dark>psychic': 2, 'dark>ghost': 2,
  'dark>dark': 0.5, 'dark>fairy': 0.5,
  // Steel
  'steel>fire': 0.5, 'steel>water': 0.5, 'steel>electric': 0.5,
  'steel>ice': 2, 'steel>rock': 2, 'steel>steel': 0.5, 'steel>fairy': 2,
  // Fairy
  'fairy>fire': 0.5, 'fairy>fighting': 2, 'fairy>poison': 0.5,
  'fairy>dragon': 2, 'fairy>dark': 2, 'fairy>steel': 0.5,
};

export function getTypeEffectiveness(attackType: PokemonType, defendType: PokemonType): number {
  return EFFECTIVENESS_OVERRIDES[`${attackType}>${defendType}`] ?? 1;
}

export function getTypeEffectivenessMultiplier(
  attackType: PokemonType,
  defendTypes: PokemonType[]
): number {
  return defendTypes.reduce(
    (mult, dt) => mult * getTypeEffectiveness(attackType, dt),
    1
  );
}

export { TYPES };

// --- Nature stat modifiers ---

const NATURE_MODIFIERS: Record<Nature, { plus?: StatName; minus?: StatName }> = {
  hardy: {}, docile: {}, serious: {}, bashful: {}, quirky: {},
  lonely:  { plus: 'attack',    minus: 'defense' },
  brave:   { plus: 'attack',    minus: 'speed' },
  adamant: { plus: 'attack',    minus: 'spAttack' },
  naughty: { plus: 'attack',    minus: 'spDefense' },
  bold:    { plus: 'defense',   minus: 'attack' },
  relaxed: { plus: 'defense',   minus: 'speed' },
  impish:  { plus: 'defense',   minus: 'spAttack' },
  lax:     { plus: 'defense',   minus: 'spDefense' },
  timid:   { plus: 'speed',     minus: 'attack' },
  hasty:   { plus: 'speed',     minus: 'defense' },
  jolly:   { plus: 'speed',     minus: 'spAttack' },
  naive:   { plus: 'speed',     minus: 'spDefense' },
  modest:  { plus: 'spAttack',  minus: 'attack' },
  mild:    { plus: 'spAttack',  minus: 'defense' },
  quiet:   { plus: 'spAttack',  minus: 'speed' },
  rash:    { plus: 'spAttack',  minus: 'spDefense' },
  calm:    { plus: 'spDefense', minus: 'attack' },
  gentle:  { plus: 'spDefense', minus: 'defense' },
  sassy:   { plus: 'spDefense', minus: 'speed' },
  careful: { plus: 'spDefense', minus: 'spAttack' },
};

export function getNatureModifier(nature: Nature, stat: StatName): number {
  const mod = NATURE_MODIFIERS[nature];
  if (mod.plus === stat) return 1.1;
  if (mod.minus === stat) return 0.9;
  return 1.0;
}

// --- Stat calculation (Gen 3 formula) ---

export function calculateStat(
  base: number,
  iv: number,
  ev: number,
  level: number,
  nature: Nature,
  stat: StatName
): number {
  if (stat === 'hp') {
    if (base === 1) return 1;  // Shedinja
    return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
  }
  const raw = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5;
  return Math.floor(raw * getNatureModifier(nature, stat));
}

// --- EXP calculation ---

export type GrowthRate = 'fast' | 'medium_fast' | 'medium_slow' | 'slow' | 'erratic' | 'fluctuating';

const EXP_FORMULAS: Record<GrowthRate, (n: number) => number> = {
  fast:        (n) => Math.floor(4 * n * n * n / 5),
  medium_fast: (n) => n * n * n,
  medium_slow: (n) => Math.max(0, Math.floor(6 / 5 * n * n * n - 15 * n * n + 100 * n - 140)),
  slow:        (n) => Math.floor(5 * n * n * n / 4),
  erratic: (n) => {
    if (n <= 50) return Math.floor(n * n * n * (100 - n) / 50);
    if (n <= 68) return Math.floor(n * n * n * (150 - n) / 100);
    if (n <= 98) return Math.floor(n * n * n * Math.floor((1911 - 10 * n) / 3) / 500);
    return Math.floor(n * n * n * (160 - n) / 100);
  },
  fluctuating: (n) => {
    if (n <= 15) return Math.floor(n * n * n * (Math.floor((n + 1) / 3) + 24) / 50);
    if (n <= 36) return Math.floor(n * n * n * (n + 14) / 50);
    return Math.floor(n * n * n * (Math.floor(n / 2) + 32) / 50);
  },
};

export function getExpForLevel(growthRate: GrowthRate, level: number): number {
  if (level <= 1) return 0;
  return EXP_FORMULAS[growthRate](level);
}

export function getExpYield(baseExp: number, defeatedLevel: number, isTrainer: boolean): number {
  const a = isTrainer ? 1.5 : 1;
  return Math.floor((a * baseExp * defeatedLevel) / 7);
}

// --- Damage formula (Gen 3) ---

export function calculateDamage(
  level: number,
  power: number,
  attack: number,
  defense: number,
  stab: boolean,
  effectiveness: number,
  critical: boolean,
  random: number            // 0.85 - 1.0
): number {
  const base = Math.floor(
    (Math.floor((2 * level) / 5 + 2) * power * attack) / defense / 50 + 2
  );
  let damage = base;
  if (critical) damage = Math.floor(damage * 1.5);
  if (stab) damage = Math.floor(damage * 1.5);
  damage = Math.floor(damage * effectiveness);
  damage = Math.floor(damage * random);
  return Math.max(1, damage);
}

// --- Catch rate formula (Gen 3) ---

export function calculateCatchRate(
  maxHp: number,
  currentHp: number,
  catchRate: number,
  ballMultiplier: number,
  statusBonus: number       // 2 for sleep/freeze, 1.5 for others, 1 for none
): number {
  const a = Math.floor(
    ((3 * maxHp - 2 * currentHp) * catchRate * ballMultiplier) / (3 * maxHp) * statusBonus
  );
  if (a >= 255) return 4;   // guaranteed catch
  const b = Math.floor(1048560 / Math.floor(Math.sqrt(Math.floor(Math.sqrt(16711680 / a)))));
  let shakes = 0;
  for (let i = 0; i < 4; i++) {
    if (Math.random() * 65536 < b) shakes++;
    else break;
  }
  return shakes;             // 4 = caught, 0-3 = broke free
}

// --- Colors for procedural rendering ---

export const COLORS = {
  grass: '#7ec850',
  grassDark: '#5ea030',
  water: '#5090d0',
  waterDark: '#3870a0',
  path: '#d4b896',
  pathDark: '#b09070',
  sand: '#e8d8a0',
  rock: '#808080',
  tree: '#2d6b2d',
  treeTrunk: '#8b6914',
  building: '#d0c0a0',
  roof: '#c04040',
  roofBlue: '#4060c0',
  wall: '#e8e0d0',
  doorway: '#604020',
  window: '#80c0e0',
  player: '#e04040',
  npc: '#4040e0',
  tallGrass: '#4a8530',
  tallGrassLight: '#60a840',
  black: '#000000',
  white: '#ffffff',
  hpGreen: '#40c040',
  hpYellow: '#e0c020',
  hpRed: '#e04040',
  expBar: '#40a0e0',
  textBox: '#f8f0d0',
  textBoxBorder: '#404040',
  menuBg: '#f8f0d0',
  menuBorder: '#505050',
  menuSelected: '#e8d8a0',
};

// --- PC Box constants ---

export const PC_BOX_COUNT = 14;
export const PC_BOX_SIZE = 30;

// --- Run chance formula ---

export function calculateRunChance(playerSpeed: number, opponentSpeed: number, attempts: number): boolean {
  const f = Math.floor((playerSpeed * 128 / opponentSpeed) + 30 * attempts) % 256;
  return Math.random() * 256 < f;
}
