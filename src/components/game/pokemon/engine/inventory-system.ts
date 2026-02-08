// ============================================================================
// Pokemon RPG Engine — Inventory / Bag System
// ============================================================================

import type { BagItem, BagCategory, ItemData, Pokemon } from './types';
import { recalculateStats } from './battle-engine';

// --- Item database ---

let itemDatabase: Record<string, ItemData> = {};

export function setItemDatabase(items: ItemData[]) {
  itemDatabase = {};
  for (const item of items) {
    itemDatabase[item.id] = item;
  }
}

export function getItemData(id: string): ItemData | null {
  return itemDatabase[id] ?? null;
}

// --- Bag operations ---

export function addItem(bag: BagItem[], itemId: string, quantity: number = 1): BagItem[] {
  const existing = bag.find(b => b.itemId === itemId);
  if (existing) {
    return bag.map(b =>
      b.itemId === itemId ? { ...b, quantity: b.quantity + quantity } : b
    );
  }
  return [...bag, { itemId, quantity }];
}

export function removeItem(bag: BagItem[], itemId: string, quantity: number = 1): BagItem[] {
  return bag
    .map(b => b.itemId === itemId ? { ...b, quantity: b.quantity - quantity } : b)
    .filter(b => b.quantity > 0);
}

export function hasItem(bag: BagItem[], itemId: string): boolean {
  return bag.some(b => b.itemId === itemId && b.quantity > 0);
}

export function getItemCount(bag: BagItem[], itemId: string): number {
  return bag.find(b => b.itemId === itemId)?.quantity ?? 0;
}

export function getItemsByCategory(bag: BagItem[], category: BagCategory): BagItem[] {
  return bag.filter(b => {
    const data = getItemData(b.itemId);
    return data?.category === category;
  });
}

// --- Item usage ---

export interface UseItemResult {
  success: boolean;
  message: string;
  bag: BagItem[];
}

export function useItem(
  bag: BagItem[],
  itemId: string,
  target: Pokemon
): UseItemResult {
  const data = getItemData(itemId);
  if (!data) return { success: false, message: 'Unknown item!', bag };
  if (!hasItem(bag, itemId)) return { success: false, message: 'No items left!', bag };

  if (!data.effect) {
    return { success: false, message: "This item can't be used here.", bag };
  }

  let message = '';

  switch (data.effect.type) {
    case 'heal_hp': {
      const atFullHp = target.currentHp >= target.stats.hp;
      const hasStatus = target.status !== null;
      const willCureStatus = data.effect.curesStatus && hasStatus;
      if (atFullHp && !willCureStatus) {
        return { success: false, message: "It won't have any effect.", bag };
      }
      if (target.currentHp <= 0) {
        return { success: false, message: "This Pokemon has fainted!", bag };
      }
      const heal = data.effect.value ?? 20;
      target.currentHp = Math.min(target.stats.hp, target.currentHp + heal);
      if (data.effect.curesStatus) {
        target.status = null;
      }
      message = `${target.nickname ?? '#' + target.speciesId} recovered HP!`;
      break;
    }

    case 'heal_status': {
      if (!target.status) {
        return { success: false, message: "It won't have any effect.", bag };
      }
      if (data.effect.status && data.effect.status !== 'all' && target.status !== data.effect.status) {
        return { success: false, message: "It won't have any effect.", bag };
      }
      target.status = null;
      message = `${target.nickname ?? '#' + target.speciesId} was cured!`;
      break;
    }

    case 'revive': {
      if (target.currentHp > 0) {
        return { success: false, message: "This Pokemon hasn't fainted!", bag };
      }
      const ratio = data.effect.value ?? 0.5;
      const reviveHp = Math.max(1, Math.floor(target.stats.hp * ratio));
      target.currentHp = reviveHp;
      target.status = null;
      message = `${target.nickname ?? '#' + target.speciesId} was revived!`;
      break;
    }

    case 'heal_pp': {
      const moveIdx = target.moves.findIndex(m => m.pp < m.maxPp);
      if (moveIdx === -1) {
        return { success: false, message: "It won't have any effect.", bag };
      }
      const restore = data.effect.value ?? 10;
      target.moves[moveIdx].pp = Math.min(target.moves[moveIdx].maxPp, target.moves[moveIdx].pp + restore);
      message = `PP was restored!`;
      break;
    }

    case 'rare_candy': {
      if (target.level >= 100) {
        return { success: false, message: "It won't have any effect.", bag };
      }
      target.level++;
      recalculateStats(target);
      message = `${target.nickname ?? '#' + target.speciesId} grew to Lv. ${target.level}!`;
      break;
    }

    default:
      return { success: false, message: "This item can't be used here.", bag };
  }

  return {
    success: true,
    message,
    bag: removeItem(bag, itemId),
  };
}

// --- Shop ---

export function canAfford(money: number, price: number, quantity: number = 1): boolean {
  return money >= price * quantity;
}

export function buyItem(
  bag: BagItem[],
  money: number,
  itemId: string,
  quantity: number = 1
): { bag: BagItem[]; money: number; success: boolean } {
  const data = getItemData(itemId);
  if (!data) return { bag, money, success: false };

  const cost = data.price * quantity;
  if (money < cost) return { bag, money, success: false };

  return {
    bag: addItem(bag, itemId, quantity),
    money: money - cost,
    success: true,
  };
}

export function sellItem(
  bag: BagItem[],
  money: number,
  itemId: string,
  quantity: number = 1
): { bag: BagItem[]; money: number; success: boolean } {
  const data = getItemData(itemId);
  if (!data || data.isKeyItem) return { bag, money, success: false };
  if (getItemCount(bag, itemId) < quantity) return { bag, money, success: false };

  const value = Math.floor(data.price / 2) * quantity;

  return {
    bag: removeItem(bag, itemId, quantity),
    money: money + value,
    success: true,
  };
}
