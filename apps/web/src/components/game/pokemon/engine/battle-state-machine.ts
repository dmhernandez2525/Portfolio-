// ============================================================================
// Pokemon RPG Engine - Battle State Machine
// ============================================================================
// Manages the full battle flow from intro through victory/defeat.

import type {
  BattleState, BattlePhase, BattleType,
  Pokemon, TrainerDef, MoveData,
} from './types';
import {
  createBattlePokemon, executeTurn, checkLevelUp,
  attemptCatch, getMoveData, createFieldEffects, applyEntryHazards,
  applyOnSwitchIn, getAbilitySwitchInWeather,
} from './battle-engine';
import { checkEvolution, evolvePokemon, getMovesForLevel, getSpeciesName } from './evolution-system';

export interface BattleConfig {
  type: BattleType;
  playerParty: Pokemon[];
  opponentParty: Pokemon[];
  trainerDef?: TrainerDef;
}

export function createBattleState(config: BattleConfig): BattleState {
  const playerActive = createBattlePokemon(config.playerParty[0]);
  const opponentActive = createBattlePokemon(config.opponentParty[0]);

  const playerName = config.playerParty[0].nickname ?? `Pokemon #${config.playerParty[0].speciesId}`;
  const opponentName = config.opponentParty[0].nickname ?? `Pokemon #${config.opponentParty[0].speciesId}`;

  const introText = config.type === 'wild'
    ? `A wild ${opponentName} appeared!`
    : `${config.trainerDef?.class ?? 'Trainer'} ${config.trainerDef?.name ?? ''} wants to battle!`;

  return {
    type: config.type,
    phase: 'intro',
    playerParty: config.playerParty,
    playerActive,
    opponentParty: config.opponentParty,
    opponentActive,
    weather: 'clear',
    weatherTurns: 0,
    playerFieldEffects: createFieldEffects(),
    opponentFieldEffects: createFieldEffects(),
    turnNumber: 0,
    textQueue: [introText, `Go! ${playerName}!`],
    currentText: introText,
    playerAction: null,
    opponentAction: null,
    trainerDef: config.trainerDef,
    canRun: config.type === 'wild',
    catchAttempts: 0,
    runAttempts: 0,
    expGained: 0,
    pendingLevelUps: [],
    pendingEvolution: null,
    battleResult: 'ongoing',
  };
}

// --- State machine transitions ---

export function advanceBattle(state: BattleState): BattleState {
  // If there are queued texts, show the next one
  if (state.textQueue.length > 1) {
    return {
      ...state,
      textQueue: state.textQueue.slice(1),
      currentText: state.textQueue[1],
    };
  }

  // Phase transitions
  const transitions: Partial<Record<BattlePhase, () => BattleState>> = {
    intro: () => ({
      ...state,
      phase: 'action_select' as BattlePhase,
      textQueue: ['What will you do?'],
      currentText: 'What will you do?',
    }),

    battle_end: () => {
      if (state.battleResult === 'win' && state.type === 'trainer' && state.trainerDef) {
        return {
          ...state,
          phase: 'reward' as BattlePhase,
          textQueue: [
            `You defeated ${state.trainerDef.class} ${state.trainerDef.name}!`,
            `Got $${state.trainerDef.reward} for winning!`,
          ],
          currentText: `You defeated ${state.trainerDef.class} ${state.trainerDef.name}!`,
        };
      }
      return state;
    },

    exp_gain: () => {
      if (state.pendingLevelUps.length > 0) {
        return {
          ...state,
          phase: 'level_up' as BattlePhase,
          textQueue: state.pendingLevelUps.map(lu =>
            `${lu.pokemon.nickname ?? `#${lu.pokemon.speciesId}`} grew to Lv. ${lu.newLevel}!`
          ),
          currentText: `${state.pendingLevelUps[0].pokemon.nickname ?? `#${state.pendingLevelUps[0].pokemon.speciesId}`} grew to Lv. ${state.pendingLevelUps[0].newLevel}!`,
        };
      }
      return {
        ...state,
        phase: 'battle_end' as BattlePhase,
        battleResult: 'win',
        textQueue: ['You won the battle!'],
        currentText: 'You won the battle!',
      };
    },

    level_up: () => {
      // Check for new moves to learn
      const lu = state.pendingLevelUps[0];
      if (lu && lu.newMoves.length > 0) {
        const moveId = lu.newMoves[0];
        const moveData = getMoveData(moveId);
        const moveName = moveData?.name ?? moveId;
        const pokeName = lu.pokemon.nickname ?? getSpeciesName(lu.pokemon.speciesId);

        // Auto-learn if < 4 moves
        if (lu.pokemon.moves.length < 4) {
          lu.pokemon.moves.push({ moveId, pp: moveData?.pp ?? 10, maxPp: moveData?.pp ?? 10 });
          const remainingMoves = lu.newMoves.slice(1);
          return {
            ...state,
            pendingLevelUps: [{ ...lu, newMoves: remainingMoves }, ...state.pendingLevelUps.slice(1)],
            textQueue: [`${pokeName} learned ${moveName}!`],
            currentText: `${pokeName} learned ${moveName}!`,
          };
        }

        // Prompt for move replacement (4 moves already)
        return {
          ...state,
          phase: 'move_learn' as BattlePhase,
          textQueue: [
            `${pokeName} wants to learn ${moveName}!`,
            `But ${pokeName} already knows 4 moves.`,
            'Forget a move to learn it?',
          ],
          currentText: `${pokeName} wants to learn ${moveName}!`,
        };
      }

      // Check for evolution
      if (lu) {
        const evoCheck = checkEvolution(lu.pokemon, 'level_up');
        if (evoCheck.canEvolve && evoCheck.evolvesTo) {
          const pokeName = lu.pokemon.nickname ?? getSpeciesName(lu.pokemon.speciesId);
          return {
            ...state,
            phase: 'evolution_check' as BattlePhase,
            pendingEvolution: { pokemon: lu.pokemon, evolvesTo: evoCheck.evolvesTo },
            pendingLevelUps: state.pendingLevelUps.slice(1),
            textQueue: [`What? ${pokeName} is evolving!`],
            currentText: `What? ${pokeName} is evolving!`,
          };
        }
      }

      return {
        ...state,
        phase: 'battle_end' as BattlePhase,
        battleResult: 'win',
        textQueue: ['You won the battle!'],
        currentText: 'You won the battle!',
        pendingLevelUps: [],
      };
    },

    faint_check: () => {
      // If player is mid-charge (Dig/Fly), auto-execute the turn
      if (state.playerActive.chargingMove && state.playerActive.pokemon.currentHp > 0 && state.opponentActive.pokemon.currentHp > 0) {
        const result = executeTurn(state, null, 'fight');
        return {
          ...state,
          phase: 'faint_check' as BattlePhase,
          turnNumber: state.turnNumber + 1,
          expGained: result.expGained,
          weather: result.newWeather ?? state.weather,
          weatherTurns: result.newWeatherTurns ?? state.weatherTurns,
          textQueue: result.messages,
          currentText: result.messages[0] ?? '',
        };
      }

      // Opponent fainted
      if (state.opponentActive.pokemon.currentHp <= 0) {
        const expResult = checkLevelUp(state.playerActive.pokemon, state.expGained);
        const newMoves = expResult.leveled
          ? getMovesForLevel(state.playerActive.pokemon.speciesId, expResult.newLevel)
          : [];
        const levelUps = expResult.leveled
          ? [{ pokemon: state.playerActive.pokemon, newLevel: expResult.newLevel, newMoves }]
          : [];

        // Exp. Share: non-participating party members holding exp-share get 50% EXP
        const expShareAmount = Math.floor(state.expGained * 0.5);
        if (expShareAmount > 0) {
          for (const partyMon of state.playerParty) {
            if (partyMon.uid === state.playerActive.pokemon.uid) continue;
            if (partyMon.currentHp <= 0) continue;
            const hasExpShare = partyMon.heldItem === 'exp-share';
            if (hasExpShare) {
              const shareResult = checkLevelUp(partyMon, expShareAmount);
              if (shareResult.leveled) {
                const shareMoves = getMovesForLevel(partyMon.speciesId, shareResult.newLevel);
                levelUps.push({ pokemon: partyMon, newLevel: shareResult.newLevel, newMoves: shareMoves });
              }
            }
          }
        }

        // Check if opponent has more pokemon (trainer battle)
        const nextOpponent = state.opponentParty.find(p =>
          p.uid !== state.opponentActive.pokemon.uid && p.currentHp > 0
        );

        if (nextOpponent) {
          const newActive = createBattlePokemon(nextOpponent);
          const opName = nextOpponent.nickname ?? `#${nextOpponent.speciesId}`;
          const hazardMessages: string[] = [];
          applyEntryHazards(newActive, state.opponentFieldEffects, hazardMessages);
          applyOnSwitchIn(newActive, state.playerActive, hazardMessages);
          const abilityWeather = getAbilitySwitchInWeather(nextOpponent.ability);
          return {
            ...state,
            phase: 'action_select' as BattlePhase,
            opponentActive: newActive,
            expGained: 0,
            pendingLevelUps: levelUps,
            weather: abilityWeather ?? state.weather,
            weatherTurns: abilityWeather ? 0 : state.weatherTurns,
            textQueue: [`Foe sent out ${opName}!`, ...hazardMessages, 'What will you do?'],
            currentText: `Foe sent out ${opName}!`,
          };
        }

        return {
          ...state,
          phase: 'exp_gain' as BattlePhase,
          pendingLevelUps: levelUps,
          textQueue: [
            `${state.opponentActive.pokemon.nickname ?? `#${state.opponentActive.pokemon.speciesId}`} fainted!`,
            `Gained ${state.expGained} EXP!`,
          ],
          currentText: `${state.opponentActive.pokemon.nickname ?? `#${state.opponentActive.pokemon.speciesId}`} fainted!`,
        };
      }

      // Player fainted
      if (state.playerActive.pokemon.currentHp <= 0) {
        // Friendship penalty on faint (-1)
        state.playerActive.pokemon.friendship = Math.max(0, state.playerActive.pokemon.friendship - 1);

        const nextAlly = state.playerParty.find(p =>
          p.uid !== state.playerActive.pokemon.uid && p.currentHp > 0
        );

        if (nextAlly) {
          return {
            ...state,
            phase: 'switch_prompt' as BattlePhase,
            textQueue: [
              `${state.playerActive.pokemon.nickname ?? `#${state.playerActive.pokemon.speciesId}`} fainted!`,
              'Choose your next Pokemon!',
            ],
            currentText: `${state.playerActive.pokemon.nickname ?? `#${state.playerActive.pokemon.speciesId}`} fainted!`,
          };
        }

        return {
          ...state,
          phase: 'battle_end' as BattlePhase,
          battleResult: 'lose',
          textQueue: [
            `${state.playerActive.pokemon.nickname ?? `#${state.playerActive.pokemon.speciesId}`} fainted!`,
            'You have no more usable Pokemon!',
            'You blacked out!',
          ],
          currentText: `${state.playerActive.pokemon.nickname ?? `#${state.playerActive.pokemon.speciesId}`} fainted!`,
        };
      }

      // Neither fainted - back to action select
      return {
        ...state,
        phase: 'action_select' as BattlePhase,
        textQueue: ['What will you do?'],
        currentText: 'What will you do?',
      };
    },

    evolution_check: () => {
      // If there's a pending evolution, wait for UI to call applyEvolution or cancelEvolution
      if (state.pendingEvolution) return state;
      return {
        ...state,
        phase: 'battle_end' as BattlePhase,
        battleResult: 'win',
        textQueue: ['You won the battle!'],
        currentText: 'You won the battle!',
      };
    },

    move_learn: () => {
      // Default: skip learning the move (player declined or auto-skip)
      const lu = state.pendingLevelUps[0];
      if (lu) {
        const moveId = lu.newMoves[0];
        const moveName = getMoveData(moveId)?.name ?? moveId;
        const pokeName = lu.pokemon.nickname ?? getSpeciesName(lu.pokemon.speciesId);
        const remainingMoves = lu.newMoves.slice(1);
        return {
          ...state,
          phase: 'level_up' as BattlePhase,
          pendingLevelUps: [{ ...lu, newMoves: remainingMoves }, ...state.pendingLevelUps.slice(1)],
          textQueue: [`${pokeName} did not learn ${moveName}.`],
          currentText: `${pokeName} did not learn ${moveName}.`,
        };
      }
      return {
        ...state,
        phase: 'level_up' as BattlePhase,
        textQueue: [''],
        currentText: '',
      };
    },

    switch_prompt: () => ({
      ...state,
      phase: 'switch_select' as BattlePhase,
      textQueue: ['Choose a Pokemon!'],
      currentText: 'Choose a Pokemon!',
    }),

    catch_animate: () => {
      if (state.battleResult === 'caught') {
        return {
          ...state,
          phase: 'battle_end' as BattlePhase,
        };
      }
      // Didn't catch - opponent attacks
      return {
        ...state,
        phase: 'action_select' as BattlePhase,
        textQueue: ['What will you do?'],
        currentText: 'What will you do?',
      };
    },
  };

  const transition = transitions[state.phase];
  if (transition) return transition();

  return state;
}

// --- Player action handlers ---

export function selectFight(state: BattleState): BattleState {
  if (state.phase !== 'action_select') return state;

  return {
    ...state,
    phase: 'move_select',
    textQueue: ['Choose a move!'],
    currentText: 'Choose a move!',
  };
}

export function selectItem(state: BattleState): BattleState {
  if (state.phase !== 'action_select') return state;

  return {
    ...state,
    phase: 'item_select',
    textQueue: ['Choose an item!'],
    currentText: 'Choose an item!',
  };
}

export function selectSwitch(state: BattleState): BattleState {
  if (state.phase !== 'action_select' && state.phase !== 'switch_prompt') return state;

  return {
    ...state,
    phase: 'switch_select',
    textQueue: ['Choose a Pokemon!'],
    currentText: 'Choose a Pokemon!',
  };
}

export function selectRun(state: BattleState): BattleState {
  if (state.phase !== 'action_select') return state;

  const result = executeTurn(state, null, 'run');
  const newState = {
    ...state,
    runAttempts: state.runAttempts + 1,
    textQueue: result.messages,
    currentText: result.messages[0] ?? '',
  };

  if (result.ranAway) {
    return { ...newState, phase: 'battle_end' as BattlePhase, battleResult: 'run' };
  }

  return { ...newState, phase: 'faint_check' as BattlePhase };
}

export function executePlayerMove(state: BattleState, moveIndex: number): BattleState {
  if (state.phase !== 'move_select') return state;

  const result = executeTurn(state, moveIndex, 'fight');

  return {
    ...state,
    phase: 'faint_check',
    turnNumber: state.turnNumber + 1,
    expGained: result.expGained,
    weather: result.newWeather ?? state.weather,
    weatherTurns: result.newWeatherTurns ?? state.weatherTurns,
    textQueue: result.messages,
    currentText: result.messages[0] ?? '',
  };
}

export function executeSwitchPokemon(state: BattleState, partyIndex: number): BattleState {
  const pokemon = state.playerParty[partyIndex];
  if (!pokemon || pokemon.currentHp <= 0) return state;

  // Natural Cure: cure status when switching out
  if (state.playerActive.pokemon.ability === 'natural_cure' && state.playerActive.pokemon.status !== null) {
    state.playerActive.pokemon.status = null;
  }

  const newActive = createBattlePokemon(pokemon);
  const name = pokemon.nickname ?? `#${pokemon.speciesId}`;

  // Apply entry hazards to the switching-in Pokemon
  const hazardMessages: string[] = [];
  applyEntryHazards(newActive, state.playerFieldEffects, hazardMessages);
  const abilityWeather = getAbilitySwitchInWeather(pokemon.ability);

  const result = executeTurn(
    { ...state, playerActive: newActive },
    null, 'switch'
  );

  return {
    ...state,
    playerActive: newActive,
    phase: 'faint_check',
    weather: abilityWeather ?? state.weather,
    weatherTurns: abilityWeather ? 0 : state.weatherTurns,
    textQueue: [`Go! ${name}!`, ...hazardMessages, ...result.messages],
    currentText: `Go! ${name}!`,
  };
}

export function useItemInBattle(
  state: BattleState,
  itemId: string,
  _targetIndex?: number
): BattleState {
  // Pokeball
  if (itemId.includes('ball')) {
    if (state.type !== 'wild') {
      return {
        ...state,
        phase: 'action_select',
        textQueue: ["You can't catch a trainer's Pokemon!"],
        currentText: "You can't catch a trainer's Pokemon!",
      };
    }

    const multiplierMap: Record<string, number> = {
      'poke-ball': 1, 'great-ball': 1.5, 'ultra-ball': 2, 'master-ball': 255,
    };
    const multiplier = multiplierMap[itemId] ?? 1;
    const result = attemptCatch(state.opponentActive.pokemon, multiplier);

    if (result.caught) {
      return {
        ...state,
        phase: 'catch_animate',
        battleResult: 'caught',
        textQueue: result.messages,
        currentText: result.messages[0] ?? '',
      };
    }

    return {
      ...state,
      phase: 'faint_check',
      catchAttempts: state.catchAttempts + 1,
      textQueue: result.messages,
      currentText: result.messages[0] ?? '',
    };
  }

  // Healing items
  const messages = [`Used ${itemId}!`];
  // Actual item effects applied by the caller (inventory system)

  return {
    ...state,
    phase: 'faint_check',
    textQueue: messages,
    currentText: messages[0],
  };
}

export function getPlayerMoves(state: BattleState): (MoveData | null)[] {
  return state.playerActive.pokemon.moves.map(m => getMoveData(m.moveId));
}

export function getAvailableSwitches(state: BattleState): Pokemon[] {
  return state.playerParty.filter(p =>
    p.uid !== state.playerActive.pokemon.uid && p.currentHp > 0
  );
}

// Replace a move with the pending new move (move_learn phase)
export function learnMove(state: BattleState, replaceIndex: number): BattleState {
  if (state.phase !== 'move_learn') return state;

  const lu = state.pendingLevelUps[0];
  if (!lu || lu.newMoves.length === 0) return state;

  const newMoveId = lu.newMoves[0];
  const newMoveData = getMoveData(newMoveId);
  const pokeName = lu.pokemon.nickname ?? getSpeciesName(lu.pokemon.speciesId);
  const newMoveName = newMoveData?.name ?? newMoveId;

  if (replaceIndex >= 0 && replaceIndex < lu.pokemon.moves.length) {
    const oldMove = getMoveData(lu.pokemon.moves[replaceIndex].moveId);
    lu.pokemon.moves[replaceIndex] = {
      moveId: newMoveId,
      pp: newMoveData?.pp ?? 10,
      maxPp: newMoveData?.pp ?? 10,
    };
    const remainingMoves = lu.newMoves.slice(1);
    return {
      ...state,
      phase: 'level_up' as BattlePhase,
      pendingLevelUps: [{ ...lu, newMoves: remainingMoves }, ...state.pendingLevelUps.slice(1)],
      textQueue: [
        `1, 2, and... Poof!`,
        `${pokeName} forgot ${oldMove?.name ?? 'the old move'}.`,
        `And... ${pokeName} learned ${newMoveName}!`,
      ],
      currentText: '1, 2, and... Poof!',
    };
  }

  // -1 = decline to learn
  const remainingMoves = lu.newMoves.slice(1);
  return {
    ...state,
    phase: 'level_up' as BattlePhase,
    pendingLevelUps: [{ ...lu, newMoves: remainingMoves }, ...state.pendingLevelUps.slice(1)],
    textQueue: [`${pokeName} did not learn ${newMoveName}.`],
    currentText: `${pokeName} did not learn ${newMoveName}.`,
  };
}

// Skip learning the pending move (decline)
export function skipMoveLearn(state: BattleState): BattleState {
  return learnMove(state, -1);
}

// Apply pending evolution (player let it proceed)
export function applyEvolution(state: BattleState): BattleState {
  if (!state.pendingEvolution) return state;
  const { pokemon, evolvesTo } = state.pendingEvolution;
  const oldName = pokemon.nickname ?? getSpeciesName(pokemon.speciesId);
  const evolved = evolvePokemon(pokemon, evolvesTo);
  Object.assign(pokemon, evolved);
  const newName = getSpeciesName(evolvesTo);
  return {
    ...state,
    phase: 'battle_end' as BattlePhase,
    battleResult: 'win',
    pendingEvolution: null,
    textQueue: [`${oldName} evolved into ${newName}!`, 'You won the battle!'],
    currentText: `${oldName} evolved into ${newName}!`,
  };
}

// Cancel pending evolution (player pressed B)
export function cancelEvolution(state: BattleState): BattleState {
  const pokeName = state.pendingEvolution?.pokemon.nickname
    ?? (state.pendingEvolution ? getSpeciesName(state.pendingEvolution.pokemon.speciesId) : '');
  return {
    ...state,
    phase: 'battle_end' as BattlePhase,
    battleResult: 'win',
    pendingEvolution: null,
    textQueue: [`${pokeName} stopped evolving!`, 'You won the battle!'],
    currentText: `${pokeName} stopped evolving!`,
  };
}
