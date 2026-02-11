// ============================================================================
// Pokemon RPG — Battle UI Component
// ============================================================================

import { useEffect, useRef } from 'react';
import type { BattleState, BagItem, InputState } from '../engine/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from '../engine/constants';
import { renderBattle } from '../engine/renderer';
import { getItemData } from '../engine/inventory-system';

interface BattleUIProps {
  state: BattleState;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  frameCount: number;
  bag: BagItem[];
  onFight: () => void;
  onItem: () => void;
  onSwitch: () => void;
  onRun: () => void;
  onChooseMove: (index: number) => void;
  onChooseSwitch: (index: number) => void;
  onUseItem: (itemId: string, targetIndex?: number) => void;
  onAdvance: () => void;
  onCancel: () => void;
  isHeld: (button: keyof InputState) => boolean;
  isJustPressed: (button: keyof InputState) => boolean;
}

// Battle-usable item categories
type ItemTab = 'pokeballs' | 'medicine';
const ITEM_TABS: { key: ItemTab; label: string }[] = [
  { key: 'pokeballs', label: 'BALLS' },
  { key: 'medicine', label: 'MEDICINE' },
];

export default function BattleUI({
  state,
  canvasRef,
  frameCount,
  bag,
  onFight,
  onItem,
  onSwitch,
  onRun,
  onChooseMove,
  onChooseSwitch,
  onUseItem,
  onAdvance,
  onCancel,
  isJustPressed,
}: BattleUIProps) {
  const menuIndex = useRef(0);
  const itemTab = useRef<ItemTab>('pokeballs');
  const itemSelectMode = useRef<'list' | 'target'>('list');
  const selectedItemId = useRef<string | null>(null);

  useEffect(() => {
    menuIndex.current = 0;
    itemSelectMode.current = 'list';
    selectedItemId.current = null;
  }, [state.phase]);

  // Get items for current tab
  const getTabItems = (): BagItem[] => {
    return bag.filter(b => {
      const data = getItemData(b.itemId);
      if (!data) return false;
      if (itemTab.current === 'pokeballs') return data.category === 'pokeballs';
      return data.category === 'medicine';
    });
  };

  // Render battle scene to canvas
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    renderBattle(ctx, state, frameCount);

    if (state.phase === 'action_select') {
      drawActionMenu(ctx, menuIndex.current);
    }

    if (state.phase === 'move_select') {
      drawMoveMenu(ctx, state, menuIndex.current);
    }

    if (state.phase === 'item_select') {
      if (itemSelectMode.current === 'target') {
        drawItemTargetMenu(ctx, state, menuIndex.current);
      } else {
        const tabItems = getTabItems();
        drawItemMenu(ctx, tabItems, menuIndex.current, itemTab.current);
      }
    }

    if (state.phase === 'switch_select') {
      drawSwitchMenu(ctx, state, menuIndex.current);
    }
  }, [state, frameCount, canvasRef, bag]);

  // Handle input
  useEffect(() => {
    const handlePhaseInput = () => {
      // --- Action select: 2x2 grid [FIGHT, BAG / POKEMON, RUN] ---
      if (state.phase === 'action_select') {
        if (isJustPressed('up') && menuIndex.current >= 2) menuIndex.current -= 2;
        if (isJustPressed('down') && menuIndex.current < 2) menuIndex.current += 2;
        if (isJustPressed('left') && menuIndex.current % 2 !== 0) menuIndex.current--;
        if (isJustPressed('right') && menuIndex.current % 2 === 0) menuIndex.current++;

        if (isJustPressed('a')) {
          const actions = [onFight, onItem, onSwitch, onRun];
          actions[menuIndex.current]();
          menuIndex.current = 0;
        }
        return;
      }

      // --- Move select: 2x2 grid ---
      if (state.phase === 'move_select') {
        const moveCount = state.playerActive.pokemon.moves.length;
        if (isJustPressed('up') && menuIndex.current >= 2) menuIndex.current -= 2;
        if (isJustPressed('down') && menuIndex.current + 2 < moveCount) menuIndex.current += 2;
        if (isJustPressed('left') && menuIndex.current % 2 !== 0) menuIndex.current--;
        if (isJustPressed('right') && menuIndex.current % 2 === 0 && menuIndex.current + 1 < moveCount) menuIndex.current++;

        if (isJustPressed('a')) {
          const idx = menuIndex.current;
          menuIndex.current = 0;
          onChooseMove(idx);
        }
        if (isJustPressed('b')) {
          menuIndex.current = 0;
          onCancel();
        }
        return;
      }

      // --- Item select ---
      if (state.phase === 'item_select') {
        handleItemInput();
        return;
      }

      // --- Switch prompt: text then auto-transition to switch_select ---
      if (state.phase === 'switch_prompt') {
        if (isJustPressed('a') || isJustPressed('b')) {
          onAdvance();
        }
        return;
      }

      // --- Switch select: vertical list ---
      if (state.phase === 'switch_select') {
        const available = state.playerParty.filter(p =>
          p.uid !== state.playerActive.pokemon.uid && p.currentHp > 0
        );
        if (isJustPressed('up') && menuIndex.current > 0) menuIndex.current--;
        if (isJustPressed('down') && menuIndex.current < available.length - 1) menuIndex.current++;

        if (isJustPressed('a') && available[menuIndex.current]) {
          const partyIdx = state.playerParty.indexOf(available[menuIndex.current]);
          menuIndex.current = 0;
          onChooseSwitch(partyIdx);
        }
        if (isJustPressed('b')) {
          menuIndex.current = 0;
          onCancel();
        }
        return;
      }

      // --- All other phases: text advancement ---
      if (isJustPressed('a') || isJustPressed('b')) {
        onAdvance();
      }
    };

    handlePhaseInput();
  }, [state.phase, isJustPressed, onFight, onItem, onSwitch, onRun,
      onChooseMove, onChooseSwitch, onCancel, onAdvance, onUseItem,
      state.playerActive.pokemon.moves, state.playerParty, bag]);

  const handleItemInput = () => {
    // Target selection sub-mode (choosing which Pokemon to heal)
    if (itemSelectMode.current === 'target') {
      const partyCount = state.playerParty.length;
      if (isJustPressed('up') && menuIndex.current > 0) menuIndex.current--;
      if (isJustPressed('down') && menuIndex.current < partyCount - 1) menuIndex.current++;

      if (isJustPressed('a') && selectedItemId.current) {
        const itemId = selectedItemId.current;
        const targetIdx = menuIndex.current;
        menuIndex.current = 0;
        itemSelectMode.current = 'list';
        selectedItemId.current = null;
        onUseItem(itemId, targetIdx);
      }
      if (isJustPressed('b')) {
        menuIndex.current = 0;
        itemSelectMode.current = 'list';
        selectedItemId.current = null;
      }
      return;
    }

    // Item list mode
    const tabItems = getTabItems();

    // Tab switching with left/right
    if (isJustPressed('left') || isJustPressed('right')) {
      const currentIdx = ITEM_TABS.findIndex(t => t.key === itemTab.current);
      const nextIdx = isJustPressed('left')
        ? (currentIdx - 1 + ITEM_TABS.length) % ITEM_TABS.length
        : (currentIdx + 1) % ITEM_TABS.length;
      itemTab.current = ITEM_TABS[nextIdx].key;
      menuIndex.current = 0;
      return;
    }

    if (isJustPressed('up') && menuIndex.current > 0) menuIndex.current--;
    if (isJustPressed('down') && menuIndex.current < tabItems.length - 1) menuIndex.current++;

    if (isJustPressed('a') && tabItems.length > 0) {
      const item = tabItems[menuIndex.current];
      if (!item) return;

      const data = getItemData(item.itemId);
      if (!data) return;

      // Pokeballs go straight to catch
      if (data.category === 'pokeballs') {
        const itemId = item.itemId;
        menuIndex.current = 0;
        onUseItem(itemId);
        return;
      }

      // Healing/medicine items need a target
      selectedItemId.current = item.itemId;
      itemSelectMode.current = 'target';
      menuIndex.current = 0;
    }

    if (isJustPressed('b')) {
      menuIndex.current = 0;
      onCancel();
    }
  };

  return null; // All rendering is done on the shared canvas
}

// --- Canvas menu drawing ---

function drawActionMenu(ctx: CanvasRenderingContext2D, selected: number) {
  const x = CANVAS_WIDTH - 170;
  const y = CANVAS_HEIGHT - 70;
  const w = 160;
  const h = 60;

  ctx.fillStyle = COLORS.menuBg;
  ctx.strokeStyle = COLORS.menuBorder;
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, w, h, 6);
  ctx.fill();
  ctx.stroke();

  const labels = ['FIGHT', 'BAG', 'POKEMON', 'RUN'];
  const positions = [
    { x: x + 15, y: y + 22 },
    { x: x + 90, y: y + 22 },
    { x: x + 15, y: y + 46 },
    { x: x + 90, y: y + 46 },
  ];

  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'left';

  labels.forEach((label, i) => {
    ctx.fillStyle = i === selected ? '#e04040' : '#000000';
    const prefix = i === selected ? '> ' : '  ';
    ctx.fillText(prefix + label, positions[i].x, positions[i].y);
  });
}

function drawMoveMenu(ctx: CanvasRenderingContext2D, state: BattleState, selected: number) {
  const x = 10;
  const y = CANVAS_HEIGHT - 70;
  const w = CANVAS_WIDTH - 20;
  const h = 60;

  ctx.fillStyle = COLORS.menuBg;
  ctx.strokeStyle = COLORS.menuBorder;
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, w, h, 6);
  ctx.fill();
  ctx.stroke();

  const moves = state.playerActive.pokemon.moves;
  const positions = [
    { x: x + 15, y: y + 22 },
    { x: x + w / 2 + 5, y: y + 22 },
    { x: x + 15, y: y + 46 },
    { x: x + w / 2 + 5, y: y + 46 },
  ];

  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'left';

  moves.forEach((move, i) => {
    if (i >= 4) return;
    const name = move.moveId.replace(/_/g, ' ').toUpperCase();
    ctx.fillStyle = i === selected ? '#e04040' : '#000000';
    const prefix = i === selected ? '> ' : '  ';
    ctx.fillText(`${prefix}${name}`, positions[i].x, positions[i].y);

    // PP display
    ctx.fillStyle = move.pp <= 0 ? '#e04040' : '#666666';
    ctx.font = '9px monospace';
    ctx.fillText(`${move.pp}/${move.maxPp}`, positions[i].x + 100, positions[i].y);
    ctx.font = 'bold 11px monospace';
  });
}

function drawItemMenu(
  ctx: CanvasRenderingContext2D,
  items: BagItem[],
  selected: number,
  activeTab: string,
) {
  const rowH = 20;
  const maxVisible = 4;
  const visibleCount = Math.min(items.length, maxVisible);
  const h = Math.max(70, visibleCount * rowH + 36);
  const x = 10;
  const y = CANVAS_HEIGHT - h - 10;
  const w = CANVAS_WIDTH - 20;

  // Background
  ctx.fillStyle = COLORS.menuBg;
  ctx.strokeStyle = COLORS.menuBorder;
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, w, h, 6);
  ctx.fill();
  ctx.stroke();

  // Tab header
  ctx.font = 'bold 10px monospace';
  ITEM_TABS.forEach((tab, i) => {
    const tabX = x + 10 + i * 80;
    const isActive = tab.key === activeTab;
    ctx.fillStyle = isActive ? '#e04040' : '#999999';
    ctx.fillText(tab.label, tabX, y + 14);
    if (isActive) {
      ctx.fillRect(tabX, y + 16, ctx.measureText(tab.label).width, 2);
    }
  });

  ctx.textAlign = 'left';

  if (items.length === 0) {
    ctx.fillStyle = '#666666';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('No items in this pocket.', x + w / 2, y + h / 2 + 8);
    ctx.font = '9px monospace';
    ctx.fillText('< > Switch tab | B: Back', x + w / 2, y + h - 8);
    ctx.textAlign = 'left';
    return;
  }

  // Scrolling: determine visible range
  const scrollStart = Math.max(0, selected - maxVisible + 1);
  const scrollEnd = Math.min(items.length, scrollStart + maxVisible);

  ctx.font = 'bold 11px monospace';
  for (let vi = scrollStart; vi < scrollEnd; vi++) {
    const item = items[vi];
    const data = getItemData(item.itemId);
    const rowY = y + 30 + (vi - scrollStart) * rowH;
    const name = data?.name ?? item.itemId;
    const prefix = vi === selected ? '> ' : '  ';

    ctx.fillStyle = vi === selected ? '#e04040' : '#000000';
    ctx.fillText(`${prefix}${name}`, x + 10, rowY);

    ctx.fillStyle = '#666666';
    ctx.font = '9px monospace';
    ctx.fillText(`x${item.quantity}`, x + w - 50, rowY);
    ctx.font = 'bold 11px monospace';
  }

  // Scroll indicators
  ctx.fillStyle = '#999999';
  ctx.font = '9px monospace';
  if (scrollStart > 0) ctx.fillText('\u25B2', x + w - 20, y + 26);
  if (scrollEnd < items.length) ctx.fillText('\u25BC', x + w - 20, y + h - 6);

  // Footer hint
  ctx.fillStyle = '#888888';
  ctx.font = '9px monospace';
  ctx.fillText('< > Tab | A: Use | B: Back', x + 10, y + h - 4);
}

function drawItemTargetMenu(ctx: CanvasRenderingContext2D, state: BattleState, selected: number) {
  const party = state.playerParty;
  const rowH = 24;
  const h = Math.max(60, party.length * rowH + 30);
  const x = 10;
  const y = CANVAS_HEIGHT - h - 10;
  const w = CANVAS_WIDTH - 20;

  ctx.fillStyle = COLORS.menuBg;
  ctx.strokeStyle = COLORS.menuBorder;
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, w, h, 6);
  ctx.fill();
  ctx.stroke();

  // Header
  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = '#333333';
  ctx.fillText('Use on which POKeMON?', x + 10, y + 14);

  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'left';

  party.forEach((pkmn, i) => {
    const rowY = y + 30 + i * rowH;
    const name = pkmn.nickname ?? `#${pkmn.speciesId}`;
    const prefix = i === selected ? '> ' : '  ';
    const isFainted = pkmn.currentHp <= 0;

    ctx.fillStyle = i === selected ? '#e04040' : isFainted ? '#999999' : '#000000';
    ctx.fillText(`${prefix}${name}  Lv.${pkmn.level}`, x + 10, rowY);

    // HP bar
    const hpPct = pkmn.stats.hp > 0 ? pkmn.currentHp / pkmn.stats.hp : 0;
    const barX = x + w - 110;
    const barW = 80;
    const barH = 6;

    ctx.fillStyle = '#333333';
    ctx.fillRect(barX, rowY - 6, barW, barH);
    ctx.fillStyle = hpPct > 0.5 ? '#30b830' : hpPct > 0.2 ? '#e8c020' : '#e04040';
    ctx.fillRect(barX, rowY - 6, barW * hpPct, barH);

    ctx.fillStyle = '#666666';
    ctx.font = '9px monospace';
    ctx.fillText(`${pkmn.currentHp}/${pkmn.stats.hp}`, barX + barW + 4, rowY);
    ctx.font = 'bold 11px monospace';
  });
}

function drawSwitchMenu(ctx: CanvasRenderingContext2D, state: BattleState, selected: number) {
  const available = state.playerParty.filter(p =>
    p.uid !== state.playerActive.pokemon.uid && p.currentHp > 0
  );

  const rowH = 24;
  const h = Math.max(60, available.length * rowH + 20);
  const x = 10;
  const y = CANVAS_HEIGHT - h - 10;
  const w = CANVAS_WIDTH - 20;

  ctx.fillStyle = COLORS.menuBg;
  ctx.strokeStyle = COLORS.menuBorder;
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, w, h, 6);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'left';

  if (available.length === 0) {
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'center';
    ctx.fillText('No Pokemon available!', x + w / 2, y + h / 2 + 4);
    ctx.textAlign = 'left';
    return;
  }

  available.forEach((pkmn, i) => {
    const rowY = y + 16 + i * rowH;
    const name = pkmn.nickname ?? `#${pkmn.speciesId}`;
    const prefix = i === selected ? '> ' : '  ';

    ctx.fillStyle = i === selected ? '#e04040' : '#000000';
    ctx.fillText(`${prefix}${name}  Lv.${pkmn.level}`, x + 10, rowY);

    // HP bar
    const hpPct = pkmn.currentHp / pkmn.stats.hp;
    const barX = x + w - 110;
    const barW = 80;
    const barH = 6;

    ctx.fillStyle = '#333333';
    ctx.fillRect(barX, rowY - 6, barW, barH);
    ctx.fillStyle = hpPct > 0.5 ? '#30b830' : hpPct > 0.2 ? '#e8c020' : '#e04040';
    ctx.fillRect(barX, rowY - 6, barW * hpPct, barH);

    ctx.fillStyle = '#666666';
    ctx.font = '9px monospace';
    ctx.fillText(`${pkmn.currentHp}/${pkmn.stats.hp}`, barX + barW + 4, rowY);
    ctx.font = 'bold 11px monospace';
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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
