// ============================================================================
// Pokemon RPG — Battle Hook
// ============================================================================

import { useState, useCallback, useRef } from 'react';
import type { BattleState, Pokemon, TrainerDef, BattleType } from '../engine/types';
import {
  createBattleState, advanceBattle, selectFight, selectItem,
  selectSwitch, selectRun, executePlayerMove, executeSwitchPokemon,
  useItemInBattle, getPlayerMoves, getAvailableSwitches,
} from '../engine/battle-state-machine';

export function useBattle() {
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const onEndRef = useRef<((result: string) => void) | null>(null);

  const startBattle = useCallback((config: {
    type: BattleType;
    playerParty: Pokemon[];
    opponentParty: Pokemon[];
    trainerDef?: TrainerDef;
  }) => {
    const state = createBattleState(config);
    setBattleState(state);
  }, []);

  const onBattleEnd = useCallback((cb: (result: string) => void) => {
    onEndRef.current = cb;
  }, []);

  const advance = useCallback(() => {
    setBattleState(prev => {
      if (!prev) return null;
      const next = advanceBattle(prev);

      // Check if battle is over
      if (next.phase === 'battle_end' && next.battleResult !== 'ongoing') {
        setTimeout(() => {
          onEndRef.current?.(next.battleResult);
          setBattleState(null);
        }, 500);
      }

      return next;
    });
  }, []);

  const fight = useCallback(() => {
    setBattleState(prev => prev ? selectFight(prev) : null);
  }, []);

  const item = useCallback(() => {
    setBattleState(prev => prev ? selectItem(prev) : null);
  }, []);

  const switchPokemon = useCallback(() => {
    setBattleState(prev => prev ? selectSwitch(prev) : null);
  }, []);

  const run = useCallback(() => {
    setBattleState(prev => prev ? selectRun(prev) : null);
  }, []);

  const chooseMove = useCallback((index: number) => {
    setBattleState(prev => prev ? executePlayerMove(prev, index) : null);
  }, []);

  const chooseSwitch = useCallback((partyIndex: number) => {
    setBattleState(prev => prev ? executeSwitchPokemon(prev, partyIndex) : null);
  }, []);

  const useItem = useCallback((itemId: string, targetIndex?: number) => {
    setBattleState(prev => prev ? useItemInBattle(prev, itemId, targetIndex) : null);
  }, []);

  const getMoves = useCallback(() => {
    if (!battleState) return [];
    return getPlayerMoves(battleState);
  }, [battleState]);

  const getSwitches = useCallback(() => {
    if (!battleState) return [];
    return getAvailableSwitches(battleState);
  }, [battleState]);

  const cancel = useCallback(() => {
    setBattleState(prev => {
      if (!prev) return null;
      if (prev.phase === 'move_select' || prev.phase === 'item_select' || prev.phase === 'switch_select') {
        return {
          ...prev,
          phase: 'action_select',
          textQueue: ['What will you do?'],
          currentText: 'What will you do?',
        };
      }
      return prev;
    });
  }, []);

  return {
    battleState,
    startBattle,
    onBattleEnd,
    advance,
    fight,
    item,
    switchPokemon,
    run,
    chooseMove,
    chooseSwitch,
    useItem,
    getMoves,
    getSwitches,
    cancel,
  };
}
