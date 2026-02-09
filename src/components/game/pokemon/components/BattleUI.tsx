// ============================================================================
// Pokemon RPG — Battle UI Component
// ============================================================================

import { useEffect, useRef } from 'react';
import type { BattleState } from '../engine/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from '../engine/constants';
import { renderBattle } from '../engine/renderer';
import type { InputState } from '../engine/types';

interface BattleUIProps {
  state: BattleState;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  frameCount: number;
  onFight: () => void;
  onItem: () => void;
  onSwitch: () => void;
  onRun: () => void;
  onChooseMove: (index: number) => void;
  onChooseSwitch: (index: number) => void;
  onAdvance: () => void;
  onCancel: () => void;
  isHeld: (button: keyof InputState) => boolean;
  isJustPressed: (button: keyof InputState) => boolean;
}

export default function BattleUI({
  state,
  canvasRef,
  frameCount,
  onFight,
  onItem,
  onSwitch,
  onRun,
  onChooseMove,
  onChooseSwitch,
  onAdvance,
  onCancel,
  isJustPressed,
}: BattleUIProps) {
  const menuIndex = useRef(0);

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
      drawItemMenu(ctx);
    }

    if (state.phase === 'switch_select') {
      drawSwitchMenu(ctx, state, menuIndex.current);
    }
  }, [state, frameCount, canvasRef]);

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

      // --- Item select: no inventory yet, cancel back ---
      if (state.phase === 'item_select') {
        if (isJustPressed('b') || isJustPressed('a')) {
          menuIndex.current = 0;
          onCancel();
        }
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
        // Only allow cancel if this was voluntary (not forced after faint)
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
  }, [state.phase, isJustPressed, onFight, onItem, onSwitch, onRun, onChooseMove, onChooseSwitch, onCancel, onAdvance, state.playerActive.pokemon.moves, state.playerParty]);

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

function drawItemMenu(ctx: CanvasRenderingContext2D) {
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

  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#666666';
  ctx.fillText('No items available', x + w / 2, y + 28);
  ctx.font = '10px monospace';
  ctx.fillText('Press B to go back', x + w / 2, y + 48);
  ctx.textAlign = 'left';
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
