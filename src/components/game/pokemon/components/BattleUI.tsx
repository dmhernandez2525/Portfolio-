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

    // Draw action menu on canvas for action_select phase
    if (state.phase === 'action_select') {
      drawActionMenu(ctx, menuIndex.current);
    }

    if (state.phase === 'move_select') {
      drawMoveMenu(ctx, state, menuIndex.current);
    }
  }, [state, frameCount, canvasRef]);

  // Handle input
  useEffect(() => {
    const handlePhaseInput = () => {
      if (state.phase === 'action_select') {
        if (isJustPressed('up')) menuIndex.current = (menuIndex.current + 3) % 4;
        if (isJustPressed('down')) menuIndex.current = (menuIndex.current + 1) % 4;
        if (isJustPressed('left')) menuIndex.current = menuIndex.current % 2 === 0 ? menuIndex.current : menuIndex.current - 1;
        if (isJustPressed('right')) menuIndex.current = menuIndex.current % 2 === 1 ? menuIndex.current : menuIndex.current + 1;

        if (isJustPressed('a')) {
          const actions = [onFight, onItem, onSwitch, onRun];
          actions[menuIndex.current]();
          menuIndex.current = 0;
        }
        return;
      }

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
        if (isJustPressed('b') && state.phase === 'switch_select') {
          menuIndex.current = 0;
          onCancel();
        }
        return;
      }

      // Text advancement phases
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
