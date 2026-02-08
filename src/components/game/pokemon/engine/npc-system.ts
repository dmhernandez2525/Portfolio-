// ============================================================================
// Pokemon RPG Engine — NPC System
// ============================================================================
// Handles NPC movement, dialog trees, and trainer line-of-sight.

import type { NPCDef, Direction, GameMap } from './types';
import { isTileWalkable } from './collision';

// --- NPC runtime state ---

export interface NPCState {
  npcId: string;
  x: number;
  y: number;
  direction: Direction;
  isMoving: boolean;
  moveProgress: number;
  targetX: number;
  targetY: number;
  moveCooldown: number;
  patrolIndex: number;
  defeated: boolean;        // for trainers
  dialogIndex: number;
}

export function createNPCState(npc: NPCDef): NPCState {
  return {
    npcId: npc.id,
    x: npc.x,
    y: npc.y,
    direction: npc.direction,
    isMoving: false,
    moveProgress: 0,
    targetX: npc.x,
    targetY: npc.y,
    moveCooldown: 60 + Math.floor(Math.random() * 120),
    patrolIndex: 0,
    defeated: false,
    dialogIndex: 0,
  };
}

export function createNPCStates(npcs: NPCDef[]): Map<string, NPCState> {
  const states = new Map<string, NPCState>();
  for (const npc of npcs) {
    states.set(npc.id, createNPCState(npc));
  }
  return states;
}

// --- NPC movement update ---

const WANDER_DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right'];

const DIRECTION_OFFSETS: Record<Direction, { dx: number; dy: number }> = {
  up:    { dx: 0,  dy: -1 },
  down:  { dx: 0,  dy: 1 },
  left:  { dx: -1, dy: 0 },
  right: { dx: 1,  dy: 0 },
};

export function updateNPC(
  npc: NPCDef,
  state: NPCState,
  map: GameMap,
  playerTileX: number,
  playerTileY: number,
  allNPCStates: Map<string, NPCState>
): NPCState {
  // Currently moving — animate
  if (state.isMoving) {
    const newProgress = state.moveProgress + 0.05;
    if (newProgress >= 1) {
      return {
        ...state,
        x: state.targetX,
        y: state.targetY,
        isMoving: false,
        moveProgress: 0,
        moveCooldown: 60 + Math.floor(Math.random() * 180),
      };
    }
    return { ...state, moveProgress: newProgress };
  }

  // Cooldown
  if (state.moveCooldown > 0) {
    return { ...state, moveCooldown: state.moveCooldown - 1 };
  }

  // Static NPCs don't move
  if (npc.movement === 'static') {
    return { ...state, moveCooldown: 120 };
  }

  // Wander
  if (npc.movement === 'wander') {
    const dir = WANDER_DIRECTIONS[Math.floor(Math.random() * 4)];
    const offset = DIRECTION_OFFSETS[dir];
    const newX = state.x + offset.dx;
    const newY = state.y + offset.dy;

    // Check walkable and not occupied by player or other NPC
    if (
      isTileWalkable(map, newX, newY, false) &&
      !(newX === playerTileX && newY === playerTileY) &&
      !isNPCOccupied(allNPCStates, state.npcId, newX, newY)
    ) {
      return {
        ...state,
        direction: dir,
        targetX: newX,
        targetY: newY,
        isMoving: true,
        moveProgress: 0,
      };
    }

    // Just turn to face that direction
    return { ...state, direction: dir, moveCooldown: 30 + Math.floor(Math.random() * 60) };
  }

  // Patrol
  if (npc.movement === 'patrol' && npc.patrolPath && npc.patrolPath.length > 0) {
    const nextIdx = (state.patrolIndex + 1) % npc.patrolPath.length;
    const target = npc.patrolPath[nextIdx];

    const dx = Math.sign(target.x - state.x);
    const dy = Math.sign(target.y - state.y);

    let dir: Direction = state.direction;
    if (dx > 0) dir = 'right';
    else if (dx < 0) dir = 'left';
    else if (dy > 0) dir = 'down';
    else if (dy < 0) dir = 'up';

    const offset = DIRECTION_OFFSETS[dir];
    const newX = state.x + offset.dx;
    const newY = state.y + offset.dy;

    if (newX === target.x && newY === target.y) {
      return {
        ...state,
        direction: dir,
        targetX: newX,
        targetY: newY,
        isMoving: true,
        moveProgress: 0,
        patrolIndex: nextIdx,
      };
    }

    if (isTileWalkable(map, newX, newY, false)) {
      return {
        ...state,
        direction: dir,
        targetX: newX,
        targetY: newY,
        isMoving: true,
        moveProgress: 0,
      };
    }

    return { ...state, moveCooldown: 60 };
  }

  return { ...state, moveCooldown: 120 };
}

function isNPCOccupied(states: Map<string, NPCState>, excludeId: string, x: number, y: number): boolean {
  for (const [id, s] of states) {
    if (id === excludeId) continue;
    if (s.x === x && s.y === y) return true;
    if (s.isMoving && s.targetX === x && s.targetY === y) return true;
  }
  return false;
}

// --- Dialog ---

export function getNPCDialog(npc: NPCDef, state: NPCState): string[] {
  if (npc.isTrainer && state.defeated && npc.trainerData?.defeatDialog) {
    return npc.trainerData.defeatDialog;
  }
  return npc.dialog;
}

export function markTrainerDefeated(states: Map<string, NPCState>, npcId: string) {
  const state = states.get(npcId);
  if (state) {
    states.set(npcId, { ...state, defeated: true });
  }
}
