// ============================================================================
// Pokemon RPG - Battle Hook
// ============================================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import type { BattleState, Pokemon, TrainerDef, BattleType } from '../engine/types';
import {
  createBattleState, advanceBattle, selectFight, selectItem,
  selectSwitch, selectRun, executePlayerMove, executeSwitchPokemon,
  useItemInBattle, getPlayerMoves, getAvailableSwitches,
  learnMove as learnMoveAction, skipMoveLearn as skipMoveLearnAction,
  applyEvolution as applyEvolutionAction, cancelEvolution as cancelEvolutionAction,
} from '../engine/battle-state-machine';

export function useBattle() {
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const onEndRef = useRef<((result: string, opponentParty: Pokemon[]) => void) | null>(null);
  const endTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (endTimeoutRef.current) clearTimeout(endTimeoutRef.current);
    };
  }, []);

  const startBattle = useCallback((config: {
    type: BattleType;
    playerParty: Pokemon[];
    opponentParty: Pokemon[];
    trainerDef?: TrainerDef;
  }) => {
    if (endTimeoutRef.current) {
      clearTimeout(endTimeoutRef.current);
      endTimeoutRef.current = null;
    }
    const state = createBattleState(config);
    setBattleState(state);
  }, []);

  const onBattleEnd = useCallback((cb: (result: string, opponentParty: Pokemon[]) => void) => {
    onEndRef.current = cb;
  }, []);

  const advance = useCallback(() => {
    setBattleState(prev => {
      if (!prev) return null;
      const next = advanceBattle(prev);

      // Check if battle is over
      if (next.phase === 'battle_end' && next.battleResult !== 'ongoing') {
        if (endTimeoutRef.current) clearTimeout(endTimeoutRef.current);
        endTimeoutRef.current = setTimeout(() => {
          endTimeoutRef.current = null;
          onEndRef.current?.(next.battleResult, next.opponentParty);
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

  const learnMove = useCallback((replaceIndex: number) => {
    setBattleState(prev => prev ? learnMoveAction(prev, replaceIndex) : null);
  }, []);

  const skipMoveLearn = useCallback(() => {
    setBattleState(prev => prev ? skipMoveLearnAction(prev) : null);
  }, []);

  const evolve = useCallback(() => {
    setBattleState(prev => {
      if (!prev) return null;
      const next = applyEvolutionAction(prev);
      if (next.phase === 'battle_end' && next.battleResult !== 'ongoing') {
        if (endTimeoutRef.current) clearTimeout(endTimeoutRef.current);
        endTimeoutRef.current = setTimeout(() => {
          endTimeoutRef.current = null;
          onEndRef.current?.(next.battleResult, next.opponentParty);
          setBattleState(null);
        }, 500);
      }
      return next;
    });
  }, []);

  const cancelEvolve = useCallback(() => {
    setBattleState(prev => {
      if (!prev) return null;
      const next = cancelEvolutionAction(prev);
      if (next.phase === 'battle_end' && next.battleResult !== 'ongoing') {
        if (endTimeoutRef.current) clearTimeout(endTimeoutRef.current);
        endTimeoutRef.current = setTimeout(() => {
          endTimeoutRef.current = null;
          onEndRef.current?.(next.battleResult, next.opponentParty);
          setBattleState(null);
        }, 500);
      }
      return next;
    });
  }, []);

  const cancel = useCallback(() => {
    setBattleState(prev => {
      if (!prev) return null;
      // Block cancel during forced switch (active Pokemon fainted)
      if (prev.phase === 'switch_select' && prev.playerActive.pokemon.currentHp <= 0) {
        return prev;
      }
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
    learnMove,
    skipMoveLearn,
    evolve,
    cancelEvolve,
    cancel,
  };
}
