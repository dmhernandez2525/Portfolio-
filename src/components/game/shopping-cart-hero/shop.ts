// ============================================================================
// Shopping Cart Hero — Shop System
// ============================================================================

import type { PlayerUpgrades, RunResult } from './types';
import {
  GROUPIE_MULTIPLIERS, DISTANCE_SCORE_DIVISOR, HEIGHT_SCORE_DIVISOR,
  WHEEL_UPGRADES, ROCKET_UPGRADES, ARMOR_UPGRADES,
  TRICK_DEFS, GROUPIE_COSTS,
} from './constants';

// --- Score calculation ---

export function calculateResult(
  distance: number,
  maxHeight: number,
  trickPoints: number,
  crashed: boolean,
  upgrades: PlayerUpgrades,
): RunResult {
  const groupieMultiplier = GROUPIE_MULTIPLIERS[upgrades.groupies];
  const groupiesLost = crashed ? upgrades.groupies : 0;

  const baseScore = Math.floor(distance / DISTANCE_SCORE_DIVISOR)
    + Math.floor(maxHeight / HEIGHT_SCORE_DIVISOR)
    + trickPoints;

  const totalScore = Math.floor(baseScore * (crashed ? 1 : groupieMultiplier));
  const moneyEarned = totalScore;

  return {
    distance: Math.floor(distance),
    maxHeight: Math.floor(maxHeight),
    trickPoints,
    crashed,
    groupiesLost,
    moneyEarned,
    totalScore,
  };
}

// --- Upgrade purchase ---

export function purchaseUpgrade(
  upgrades: PlayerUpgrades,
  money: number,
  upgradeId: string,
): { upgrades: PlayerUpgrades; money: number; success: boolean } {
  const next = { ...upgrades };
  let cost = 0;
  let success = false;

  const [category, indexStr] = upgradeId.split('_');
  const index = parseInt(indexStr, 10);

  const handlers: Record<string, () => void> = {
    wheels: () => {
      if (index > next.wheels && index < WHEEL_UPGRADES.tiers.length) {
        cost = WHEEL_UPGRADES.tiers[index].cost;
        if (money >= cost) { next.wheels = index; success = true; }
      }
    },
    rockets: () => {
      if (index > next.rockets && index < ROCKET_UPGRADES.tiers.length) {
        cost = ROCKET_UPGRADES.tiers[index].cost;
        if (money >= cost) { next.rockets = index; success = true; }
      }
    },
    armor: () => {
      if (index > next.armor && index < ARMOR_UPGRADES.tiers.length) {
        cost = ARMOR_UPGRADES.tiers[index].cost;
        if (money >= cost) { next.armor = index; success = true; }
      }
    },
    trick: () => {
      const trick = TRICK_DEFS[index];
      if (!trick) return;
      const key = trick.id as keyof Pick<PlayerUpgrades, 'handstand' | 'superman' | 'backflip'>;
      if (!next[key]) {
        cost = trick.cost;
        if (money >= cost) { next[key] = true; success = true; }
      }
    },
    groupie: () => {
      if (next.groupies < 3) {
        cost = GROUPIE_COSTS[next.groupies];
        if (money >= cost) { next.groupies++; success = true; }
      }
    },
  };

  handlers[category]?.();

  return {
    upgrades: next,
    money: success ? money - cost : money,
    success,
  };
}
