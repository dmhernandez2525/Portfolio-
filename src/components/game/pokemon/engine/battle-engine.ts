// ============================================================================
// Pokemon RPG Engine — Battle Engine
// ============================================================================
// Handles damage calculation, type effectiveness, status effects,
// accuracy checks, critical hits, stat stages, and catch mechanics.

import type {
  Pokemon, PokemonMove, MoveData, BattlePokemon,
  StatName, PokemonType, MoveEffect, BattleState,
} from './types';
import {
  calculateDamage, getTypeEffectivenessMultiplier,
  STAT_STAGE_MULTIPLIERS, ACCURACY_STAGE_MULTIPLIERS,
  STAT_STAGE_MIN, STAT_STAGE_MAX, CRIT_STAGE_MULTIPLIERS,
  BASE_CRIT_STAGE, MAX_LEVEL, calculateCatchRate, calculateRunChance,
  getExpYield, getExpForLevel, calculateStat,
} from './constants';

// --- Move data lookup (will be populated from JSON) ---

let moveDatabase: Record<string, MoveData> = {};

export function setMoveDatabase(moves: MoveData[]) {
  moveDatabase = {};
  for (const move of moves) {
    moveDatabase[move.id] = move;
  }
}

export function getMoveData(moveId: string): MoveData | null {
  return moveDatabase[moveId] ?? null;
}

// --- Species data lookup ---

interface SpeciesLookup {
  id: number;
  name: string;
  types: PokemonType[];
  baseStats: Record<StatName, number>;
  baseExp: number;
  growthRate: string;
}

let speciesDatabase: Record<number, SpeciesLookup> = {};

export function setSpeciesDatabase(species: SpeciesLookup[]) {
  speciesDatabase = {};
  for (const s of species) {
    speciesDatabase[s.id] = s;
  }
}

export function getSpeciesData(id: number): SpeciesLookup | null {
  return speciesDatabase[id] ?? null;
}

// --- Battle Pokemon helpers ---

export function createBattlePokemon(pokemon: Pokemon): BattlePokemon {
  return {
    pokemon,
    statStages: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
    volatileStatuses: new Set(),
    isProtected: false,
    sleepTurns: 0,
    confusionTurns: 0,
    toxicCounter: 0,
  };
}

function getEffectiveStat(bp: BattlePokemon, stat: StatName): number {
  const base = bp.pokemon.stats[stat];
  const stage = bp.statStages[stat];
  const mult = STAT_STAGE_MULTIPLIERS[stage] ?? 1;
  let value = Math.floor(base * mult);

  // Status modifiers
  if (stat === 'attack' && bp.pokemon.status === 'burn') {
    value = Math.floor(value * 0.5);
  }
  if (stat === 'speed' && bp.pokemon.status === 'paralysis') {
    value = Math.floor(value * 0.25);
  }

  return Math.max(1, value);
}

// --- Turn execution ---

export interface TurnResult {
  messages: string[];
  playerFirst: boolean;
  playerDamageDealt: number;
  opponentDamageDealt: number;
  playerFainted: boolean;
  opponentFainted: boolean;
  expGained: number;
  caughtPokemon: Pokemon | null;
  ranAway: boolean;
}

export function executeTurn(
  state: BattleState,
  playerMoveIndex: number | null,
  playerAction: 'fight' | 'item' | 'switch' | 'run',
  itemId?: string,
  _switchIndex?: number,
): TurnResult {
  const messages: string[] = [];
  let playerDamageDealt = 0;
  let opponentDamageDealt = 0;
  let playerFainted = false;
  let opponentFainted = false;
  let expGained = 0;
  let caughtPokemon: Pokemon | null = null;
  let ranAway = false;

  const playerBp = state.playerActive;
  const opponentBp = state.opponentActive;
  const playerPoke = playerBp.pokemon;
  const opponentPoke = opponentBp.pokemon;

  // Handle run attempt
  if (playerAction === 'run') {
    if (state.type === 'trainer') {
      messages.push("Can't escape from a trainer battle!");
    } else {
      const canRun = calculateRunChance(
        getEffectiveStat(playerBp, 'speed'),
        getEffectiveStat(opponentBp, 'speed'),
        state.catchAttempts
      );
      if (canRun) {
        messages.push('Got away safely!');
        ranAway = true;
        return { messages, playerFirst: true, playerDamageDealt, opponentDamageDealt, playerFainted, opponentFainted, expGained, caughtPokemon, ranAway };
      }
      messages.push("Can't escape!");
    }
  }

  // Handle item use
  if (playerAction === 'item' && itemId) {
    messages.push(`Used ${itemId}!`);
    // Item effects handled by caller — here we just note the action
    // Opponent still gets to attack
    const oppResult = executeMove(opponentBp, playerBp, selectOpponentMove(opponentBp, playerBp, state), messages);
    opponentDamageDealt = oppResult.damage;
    playerFainted = playerPoke.currentHp <= 0;
    return { messages, playerFirst: false, playerDamageDealt, opponentDamageDealt, playerFainted, opponentFainted, expGained, caughtPokemon, ranAway };
  }

  // Handle switch
  if (playerAction === 'switch') {
    messages.push(`Go! ${playerPoke.nickname ?? `Pokemon #${playerPoke.speciesId}`}!`);
    // Opponent attacks the switched-in Pokemon
    const oppResult = executeMove(opponentBp, playerBp, selectOpponentMove(opponentBp, playerBp, state), messages);
    opponentDamageDealt = oppResult.damage;
    playerFainted = playerPoke.currentHp <= 0;
    return { messages, playerFirst: false, playerDamageDealt, opponentDamageDealt, playerFainted, opponentFainted, expGained, caughtPokemon, ranAway };
  }

  // Fight — determine turn order
  const playerMove = playerMoveIndex !== null ? playerPoke.moves[playerMoveIndex] : null;
  const opponentMove = selectOpponentMove(opponentBp, playerBp, state);

  const playerMoveData = playerMove ? getMoveData(playerMove.moveId) : null;
  const opponentMoveData = opponentMove ? getMoveData(opponentMove.moveId) : null;

  const playerPriority = playerMoveData?.priority ?? 0;
  const opponentPriority = opponentMoveData?.priority ?? 0;

  let playerFirst: boolean;
  if (playerPriority !== opponentPriority) {
    playerFirst = playerPriority > opponentPriority;
  } else {
    const playerSpeed = getEffectiveStat(playerBp, 'speed');
    const opponentSpeed = getEffectiveStat(opponentBp, 'speed');
    playerFirst = playerSpeed >= opponentSpeed ? true : (playerSpeed === opponentSpeed ? Math.random() < 0.5 : false);
  }

  const first = playerFirst ? { attacker: playerBp, defender: opponentBp, move: playerMove } : { attacker: opponentBp, defender: playerBp, move: opponentMove };
  const second = playerFirst ? { attacker: opponentBp, defender: playerBp, move: opponentMove } : { attacker: playerBp, defender: opponentBp, move: playerMove };

  // Execute first move
  const firstResult = executeMove(first.attacker, first.defender, first.move, messages);
  if (playerFirst) playerDamageDealt = firstResult.damage;
  else opponentDamageDealt = firstResult.damage;

  // Check if second attacker fainted
  if (second.attacker.pokemon.currentHp > 0 && first.defender.pokemon.currentHp > 0) {
    const secondResult = executeMove(second.attacker, second.defender, second.move, messages);
    if (playerFirst) opponentDamageDealt = secondResult.damage;
    else playerDamageDealt = secondResult.damage;
  }

  // Post-turn effects (status damage, weather, etc.)
  applyPostTurnEffects(playerBp, messages, 'Your');
  applyPostTurnEffects(opponentBp, messages, 'Foe');

  playerFainted = playerPoke.currentHp <= 0;
  opponentFainted = opponentPoke.currentHp <= 0;

  // EXP gain
  if (opponentFainted) {
    const species = getSpeciesData(opponentPoke.speciesId);
    if (species) {
      expGained = getExpYield(species.baseExp, opponentPoke.level, state.type === 'trainer');
    }
  }

  return { messages, playerFirst, playerDamageDealt, opponentDamageDealt, playerFainted, opponentFainted, expGained, caughtPokemon, ranAway };
}

// --- Execute a single move ---

interface MoveResult {
  damage: number;
  hit: boolean;
  critical: boolean;
  effectiveness: number;
}

function executeMove(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: PokemonMove | null,
  messages: string[]
): MoveResult {
  const atkPoke = attacker.pokemon;
  const defPoke = defender.pokemon;
  const name = atkPoke.nickname ?? `#${atkPoke.speciesId}`;

  if (!move) {
    messages.push(`${name} has no moves!`);
    return { damage: 0, hit: false, critical: false, effectiveness: 1 };
  }

  const moveData = getMoveData(move.moveId);
  if (!moveData) {
    messages.push(`${name} used an unknown move!`);
    return { damage: 0, hit: false, critical: false, effectiveness: 1 };
  }

  messages.push(`${name} used ${moveData.name}!`);

  // PP check
  if (move.pp <= 0) {
    messages.push('But there was no PP left!');
    return { damage: 0, hit: false, critical: false, effectiveness: 1 };
  }
  move.pp--;

  // Status check — can the attacker move?
  if (!canAttack(attacker, messages)) {
    return { damage: 0, hit: false, critical: false, effectiveness: 1 };
  }

  // Accuracy check
  if (moveData.accuracy !== null) {
    const accStage = attacker.statStages.hp; // using HP slot for accuracy tracking
    const evaStage = defender.statStages.hp;  // simplified
    const accMult = ACCURACY_STAGE_MULTIPLIERS[Math.max(-6, Math.min(6, accStage - evaStage))] ?? 1;
    const hitChance = moveData.accuracy * accMult / 100;

    if (Math.random() > hitChance) {
      messages.push(`${name}'s attack missed!`);
      return { damage: 0, hit: false, critical: false, effectiveness: 1 };
    }
  }

  // Status moves
  if (moveData.category === 'status') {
    applyMoveEffect(moveData.effect, attacker, defender, messages);
    return { damage: 0, hit: true, critical: false, effectiveness: 1 };
  }

  // Damage calculation
  const species = getSpeciesData(atkPoke.speciesId);
  const defSpecies = getSpeciesData(defPoke.speciesId);
  const atkTypes = species?.types ?? ['normal'];
  const defTypes = defSpecies?.types ?? ['normal'];

  const isPhysical = moveData.category === 'physical';
  const attack = getEffectiveStat(attacker, isPhysical ? 'attack' : 'spAttack');
  const defense = getEffectiveStat(defender, isPhysical ? 'defense' : 'spDefense');

  // STAB
  const stab = atkTypes.includes(moveData.type);

  // Type effectiveness
  const effectiveness = getTypeEffectivenessMultiplier(moveData.type, defTypes as PokemonType[]);

  // Critical hit
  const critStage = BASE_CRIT_STAGE;
  const critChance = CRIT_STAGE_MULTIPLIERS[Math.min(critStage, CRIT_STAGE_MULTIPLIERS.length - 1)];
  const critical = Math.random() < critChance;

  // Random factor
  const random = 0.85 + Math.random() * 0.15;

  const damage = moveData.power
    ? calculateDamage(atkPoke.level, moveData.power, attack, defense, stab, effectiveness, critical, random)
    : 0;

  // Apply damage
  if (damage > 0) {
    defPoke.currentHp = Math.max(0, defPoke.currentHp - damage);

    if (effectiveness > 1) messages.push("It's super effective!");
    if (effectiveness < 1 && effectiveness > 0) messages.push("It's not very effective...");
    if (effectiveness === 0) messages.push("It doesn't affect the foe...");
    if (critical) messages.push('A critical hit!');
  }

  // Move secondary effects
  if (moveData.effect && moveData.power) {
    const chance = moveData.effect.chance ?? 100;
    if (Math.random() * 100 < chance) {
      applyMoveEffect(moveData.effect, attacker, defender, messages);
    }
  }

  // Recoil
  if (moveData.effect?.recoil && damage > 0) {
    const recoilDmg = Math.max(1, Math.floor(damage * moveData.effect.recoil));
    atkPoke.currentHp = Math.max(0, atkPoke.currentHp - recoilDmg);
    messages.push(`${name} was hurt by recoil!`);
  }

  // Drain
  if (moveData.effect?.drain && damage > 0) {
    const drainAmt = Math.max(1, Math.floor(damage * moveData.effect.drain));
    atkPoke.currentHp = Math.min(atkPoke.stats.hp, atkPoke.currentHp + drainAmt);
    messages.push(`${name} drained HP!`);
  }

  return { damage, hit: true, critical, effectiveness };
}

// --- Status checks ---

function canAttack(bp: BattlePokemon, messages: string[]): boolean {
  const poke = bp.pokemon;
  const name = poke.nickname ?? `#${poke.speciesId}`;

  // Sleep
  if (poke.status === 'sleep') {
    if (bp.sleepTurns <= 0) {
      poke.status = null;
      messages.push(`${name} woke up!`);
      return true;
    }
    bp.sleepTurns--;
    messages.push(`${name} is fast asleep.`);
    return false;
  }

  // Freeze
  if (poke.status === 'freeze') {
    if (Math.random() < 0.2) {
      poke.status = null;
      messages.push(`${name} thawed out!`);
      return true;
    }
    messages.push(`${name} is frozen solid!`);
    return false;
  }

  // Paralysis
  if (poke.status === 'paralysis') {
    if (Math.random() < 0.25) {
      messages.push(`${name} is fully paralyzed!`);
      return false;
    }
  }

  // Confusion
  if (bp.volatileStatuses.has('confusion')) {
    if (bp.confusionTurns <= 0) {
      bp.volatileStatuses.delete('confusion');
      messages.push(`${name} snapped out of confusion!`);
    } else {
      bp.confusionTurns--;
      messages.push(`${name} is confused!`);
      if (Math.random() < 0.5) {
        const selfDmg = Math.max(1, Math.floor(poke.stats.attack / 4));
        poke.currentHp = Math.max(0, poke.currentHp - selfDmg);
        messages.push('It hurt itself in its confusion!');
        return false;
      }
    }
  }

  // Flinch
  if (bp.volatileStatuses.has('flinch')) {
    bp.volatileStatuses.delete('flinch');
    messages.push(`${name} flinched and couldn't move!`);
    return false;
  }

  return true;
}

// --- Apply move effects ---

function applyMoveEffect(
  effect: MoveEffect | undefined,
  attacker: BattlePokemon,
  defender: BattlePokemon,
  messages: string[]
) {
  if (!effect) return;

  const target = effect.target === 'self' ? attacker : defender;
  const targetName = target.pokemon.nickname ?? `#${target.pokemon.speciesId}`;

  // Status condition
  if (effect.status) {
    if (target.pokemon.status === null) {
      target.pokemon.status = effect.status;
      const statusMessages: Record<string, string> = {
        burn: `${targetName} was burned!`,
        freeze: `${targetName} was frozen solid!`,
        paralysis: `${targetName} was paralyzed!`,
        poison: `${targetName} was poisoned!`,
        bad_poison: `${targetName} was badly poisoned!`,
        sleep: `${targetName} fell asleep!`,
      };
      messages.push(statusMessages[effect.status] ?? `${targetName} was afflicted!`);
      if (effect.status === 'sleep') target.sleepTurns = 1 + Math.floor(Math.random() * 3);
    } else {
      messages.push("But it failed!");
    }
  }

  // Volatile status
  if (effect.volatileStatus) {
    target.volatileStatuses.add(effect.volatileStatus);
    if (effect.volatileStatus === 'confusion') {
      target.confusionTurns = 2 + Math.floor(Math.random() * 4);
      messages.push(`${targetName} became confused!`);
    } else if (effect.volatileStatus === 'flinch') {
      // Flinch is silent until it activates
    }
  }

  // Stat changes
  if (effect.statChanges) {
    for (const [stat, change] of Object.entries(effect.statChanges)) {
      const s = stat as StatName;
      const oldStage = target.statStages[s];
      const newStage = Math.max(STAT_STAGE_MIN, Math.min(STAT_STAGE_MAX, oldStage + change));

      if (newStage === oldStage) {
        const dir = change > 0 ? "won't go higher" : "won't go lower";
        messages.push(`${targetName}'s ${stat} ${dir}!`);
      } else {
        target.statStages[s] = newStage;
        const magnitude = Math.abs(change);
        const dir = change > 0 ? 'rose' : 'fell';
        const adverb = magnitude >= 3 ? ' drastically' : magnitude === 2 ? ' sharply' : '';
        messages.push(`${targetName}'s ${stat}${adverb} ${dir}!`);
      }
    }
  }
}

// --- Post-turn effects ---

function applyPostTurnEffects(bp: BattlePokemon, messages: string[], prefix: string) {
  const poke = bp.pokemon;
  if (poke.currentHp <= 0) return;

  const name = poke.nickname ?? `#${poke.speciesId}`;

  // Burn damage
  if (poke.status === 'burn') {
    const dmg = Math.max(1, Math.floor(poke.stats.hp / 8));
    poke.currentHp = Math.max(0, poke.currentHp - dmg);
    messages.push(`${prefix} ${name} is hurt by its burn!`);
  }

  // Poison damage
  if (poke.status === 'poison') {
    const dmg = Math.max(1, Math.floor(poke.stats.hp / 8));
    poke.currentHp = Math.max(0, poke.currentHp - dmg);
    messages.push(`${prefix} ${name} is hurt by poison!`);
  }

  // Bad poison (toxic) — escalating damage
  if (poke.status === 'bad_poison') {
    bp.toxicCounter++;
    const dmg = Math.max(1, Math.floor(poke.stats.hp * bp.toxicCounter / 16));
    poke.currentHp = Math.max(0, poke.currentHp - dmg);
    messages.push(`${prefix} ${name} is hurt by poison!`);
  }

  // Leech Seed
  if (bp.volatileStatuses.has('leech_seed')) {
    const dmg = Math.max(1, Math.floor(poke.stats.hp / 8));
    poke.currentHp = Math.max(0, poke.currentHp - dmg);
    messages.push(`${prefix} ${name}'s health is sapped by Leech Seed!`);
  }
}

// --- AI move selection ---

export function selectOpponentMove(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  state: BattleState
): PokemonMove | null {
  const moves = attacker.pokemon.moves.filter(m => m.pp > 0);
  if (moves.length === 0) return null;

  const tier = state.trainerDef?.aiTier ?? 'random';

  switch (tier) {
    case 'random':
      return moves[Math.floor(Math.random() * moves.length)];

    case 'basic':
      return selectBasicAI(moves, attacker, defender);

    case 'smart':
    case 'expert':
      return selectSmartAI(moves, attacker, defender);

    default:
      return moves[0];
  }
}

function selectBasicAI(moves: PokemonMove[], _attacker: BattlePokemon, defender: BattlePokemon): PokemonMove {
  // Prefer super-effective moves
  const defSpecies = getSpeciesData(defender.pokemon.speciesId);
  const defTypes = defSpecies?.types ?? ['normal'];

  const scored = moves.map(m => {
    const data = getMoveData(m.moveId);
    if (!data || !data.power) return { move: m, score: 0 };
    const eff = getTypeEffectivenessMultiplier(data.type, defTypes as PokemonType[]);
    return { move: m, score: data.power * eff };
  });

  scored.sort((a, b) => b.score - a.score);

  // 70% chance to pick best, 30% random
  if (Math.random() < 0.7 && scored[0].score > 0) {
    return scored[0].move;
  }
  return moves[Math.floor(Math.random() * moves.length)];
}

function selectSmartAI(moves: PokemonMove[], attacker: BattlePokemon, defender: BattlePokemon): PokemonMove {
  const defSpecies = getSpeciesData(defender.pokemon.speciesId);
  const defTypes = defSpecies?.types ?? ['normal'];
  const atkSpecies = getSpeciesData(attacker.pokemon.speciesId);
  const atkTypes = atkSpecies?.types ?? ['normal'];

  const scored = moves.map(m => {
    const data = getMoveData(m.moveId);
    if (!data) return { move: m, score: 0 };

    let score = 0;

    if (data.power) {
      const eff = getTypeEffectivenessMultiplier(data.type, defTypes as PokemonType[]);
      const stab = atkTypes.includes(data.type) ? 1.5 : 1;
      score = data.power * eff * stab;

      // Prefer physical/special based on attacker's stats
      const isPhysical = data.category === 'physical';
      const atk = isPhysical ? attacker.pokemon.stats.attack : attacker.pokemon.stats.spAttack;
      const def = isPhysical ? defender.pokemon.stats.defense : defender.pokemon.stats.spDefense;
      score *= atk / def;
    }

    // Boost status moves when appropriate
    if (data.category === 'status') {
      if (data.effect?.status && defender.pokemon.status === null) {
        score = 60; // Status moves valued moderately
      }
      if (data.effect?.statChanges) {
        score = 40; // Stat boosts valued less urgently
      }
    }

    return { move: m, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // 85% chance to pick best, 15% second best or random
  if (Math.random() < 0.85 && scored[0].score > 0) {
    return scored[0].move;
  }
  if (scored.length > 1 && scored[1].score > 0) {
    return scored[1].move;
  }
  return moves[Math.floor(Math.random() * moves.length)];
}

// --- Level up ---

export function checkLevelUp(pokemon: Pokemon, expGained: number): { leveled: boolean; newLevel: number } {
  const species = getSpeciesData(pokemon.speciesId);
  const growthRate = (species?.growthRate ?? 'medium_fast') as Parameters<typeof getExpForLevel>[0];

  pokemon.exp += expGained;
  let leveled = false;
  let newLevel = pokemon.level;

  while (newLevel < MAX_LEVEL) {
    const nextLevelExp = getExpForLevel(growthRate, newLevel + 1);
    if (pokemon.exp >= nextLevelExp) {
      newLevel++;
      leveled = true;
    } else {
      break;
    }
  }

  if (leveled) {
    pokemon.level = newLevel;
    recalculateStats(pokemon);
  }

  return { leveled, newLevel };
}

export function recalculateStats(pokemon: Pokemon) {
  const species = getSpeciesData(pokemon.speciesId);
  if (!species) return;

  const stats: StatName[] = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'];
  const oldMaxHp = pokemon.stats.hp;

  for (const stat of stats) {
    pokemon.stats[stat] = calculateStat(
      species.baseStats[stat],
      pokemon.ivs[stat],
      pokemon.evs[stat],
      pokemon.level,
      pokemon.nature,
      stat
    );
  }

  // Adjust current HP proportionally
  if (oldMaxHp > 0) {
    const hpDiff = pokemon.stats.hp - oldMaxHp;
    pokemon.currentHp = Math.min(pokemon.stats.hp, pokemon.currentHp + hpDiff);
  }
}

// --- Catch attempt ---

export function attemptCatch(
  pokemon: Pokemon,
  ballMultiplier: number
): { shakes: number; caught: boolean; messages: string[] } {
  const messages: string[] = [];
  const statusBonus = pokemon.status === 'sleep' || pokemon.status === 'freeze' ? 2
    : pokemon.status !== null ? 1.5
    : 1;

  const species = getSpeciesData(pokemon.speciesId);
  const catchRate = species ? 45 : 45; // Default catch rate if unknown

  const shakes = calculateCatchRate(
    pokemon.stats.hp, pokemon.currentHp, catchRate, ballMultiplier, statusBonus
  );

  const shakeMessages = ['', 'It shook once...', 'It shook twice...', 'It shook three times...'];
  for (let i = 1; i <= Math.min(shakes, 3); i++) {
    messages.push(shakeMessages[i]);
  }

  if (shakes >= 4) {
    messages.push('Gotcha! The wild Pokemon was caught!');
    return { shakes: 4, caught: true, messages };
  }

  messages.push('Oh no! The Pokemon broke free!');
  return { shakes, caught: false, messages };
}
