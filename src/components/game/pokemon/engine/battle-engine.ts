// ============================================================================
// Pokemon RPG Engine — Battle Engine
// ============================================================================
// Handles damage calculation, type effectiveness, status effects,
// accuracy checks, critical hits, stat stages, and catch mechanics.

import type {
  Pokemon, PokemonMove, MoveData, BattlePokemon,
  StatName, PokemonType, MoveEffect, BattleState, Weather,
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
  catchRate?: number;
  evYield?: Partial<Record<StatName, number>>;
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
  const species = getSpeciesData(pokemon.speciesId);
  return {
    pokemon,
    types: (species?.types as PokemonType[]) ?? ['normal'],
    statStages: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
    accuracyStage: 0,
    evasionStage: 0,
    volatileStatuses: new Set(),
    isProtected: false,
    protectCount: 0,
    sleepTurns: 0,
    confusionTurns: 0,
    toxicCounter: 0,
    chargingMove: null,
    semiInvulnerable: null,
  };
}

// Apply switch-in ability effects (Intimidate, etc.)
export function applyOnSwitchIn(switchedIn: BattlePokemon, opponent: BattlePokemon, messages: string[]): void {
  const ability = switchedIn.pokemon.ability;
  if (!ability) return;
  const name = switchedIn.pokemon.nickname ?? `#${switchedIn.pokemon.speciesId}`;
  if (ability === 'intimidate') {
    const newStage = Math.max(-6, opponent.statStages.attack - 1);
    if (newStage !== opponent.statStages.attack) {
      opponent.statStages.attack = newStage;
      const oppName = opponent.pokemon.nickname ?? `#${opponent.pokemon.speciesId}`;
      messages.push(`${name}'s Intimidate lowered ${oppName}'s Attack!`);
    }
  }
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
  newWeather?: Weather;
  newWeatherTurns?: number;
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

  // Clear protection flags at start of turn
  playerBp.isProtected = false;
  opponentBp.isProtected = false;

  // Handle run attempt
  if (playerAction === 'run') {
    if (state.type === 'trainer') {
      messages.push("Can't escape from a trainer battle!");
    } else {
      const canRun = calculateRunChance(
        getEffectiveStat(playerBp, 'speed'),
        getEffectiveStat(opponentBp, 'speed'),
        state.runAttempts
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
    applyOnSwitchIn(playerBp, opponentBp, messages);
    // Opponent attacks the switched-in Pokemon
    const oppResult = executeMove(opponentBp, playerBp, selectOpponentMove(opponentBp, playerBp, state), messages);
    opponentDamageDealt = oppResult.damage;
    playerFainted = playerPoke.currentHp <= 0;
    return { messages, playerFirst: false, playerDamageDealt, opponentDamageDealt, playerFainted, opponentFainted, expGained, caughtPokemon, ranAway };
  }

  // Fight — determine turn order
  const playerMove = playerMoveIndex !== null ? playerPoke.moves[playerMoveIndex] : null;
  const opponentMove = selectOpponentMove(opponentBp, playerBp, state);

  // Reset protectCount if not using Protect/Detect this turn
  const playerMoveId = playerMove ? getMoveData(playerMove.moveId) : null;
  const opponentMoveId = opponentMove ? getMoveData(opponentMove.moveId) : null;
  if (!playerMoveId?.effect?.protect) playerBp.protectCount = 0;
  if (!opponentMoveId?.effect?.protect) opponentBp.protectCount = 0;

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
    playerFirst = playerSpeed > opponentSpeed || (playerSpeed === opponentSpeed && Math.random() < 0.5);
  }

  const first = playerFirst ? { attacker: playerBp, defender: opponentBp, move: playerMove } : { attacker: opponentBp, defender: playerBp, move: opponentMove };
  const second = playerFirst ? { attacker: opponentBp, defender: playerBp, move: opponentMove } : { attacker: playerBp, defender: opponentBp, move: playerMove };

  let currentWeather = state.weather;
  let currentWeatherTurns = state.weatherTurns;

  // Execute first move
  const firstResult = executeMove(first.attacker, first.defender, first.move, messages, currentWeather);
  if (playerFirst) playerDamageDealt = firstResult.damage;
  else opponentDamageDealt = firstResult.damage;
  if (firstResult.weatherChange) {
    currentWeather = firstResult.weatherChange;
    currentWeatherTurns = 5;
  }

  // Check if second attacker fainted
  if (second.attacker.pokemon.currentHp > 0 && first.defender.pokemon.currentHp > 0) {
    const secondResult = executeMove(second.attacker, second.defender, second.move, messages, currentWeather);
    if (playerFirst) opponentDamageDealt = secondResult.damage;
    else playerDamageDealt = secondResult.damage;
    if (secondResult.weatherChange) {
      currentWeather = secondResult.weatherChange;
      currentWeatherTurns = 5;
    }
  }

  // Post-turn effects (status damage, weather damage, leech seed, etc.)
  applyPostTurnEffects(playerBp, opponentBp, messages, 'Your', currentWeather);
  applyPostTurnEffects(opponentBp, playerBp, messages, 'Foe', currentWeather);

  // Decrement weather turns
  if (currentWeather !== 'clear' && currentWeatherTurns > 0) {
    currentWeatherTurns--;
    if (currentWeatherTurns <= 0) {
      messages.push('The weather returned to normal.');
      currentWeather = 'clear';
    }
  }

  playerFainted = playerPoke.currentHp <= 0;
  opponentFainted = opponentPoke.currentHp <= 0;

  // EXP gain and EV yield
  if (opponentFainted) {
    const species = getSpeciesData(opponentPoke.speciesId);
    if (species) {
      expGained = getExpYield(species.baseExp, opponentPoke.level, state.type === 'trainer');
      applyEvGains(playerPoke, opponentPoke.speciesId);
    }
  }

  return { messages, playerFirst, playerDamageDealt, opponentDamageDealt, playerFainted, opponentFainted, expGained, caughtPokemon, ranAway, newWeather: currentWeather, newWeatherTurns: currentWeatherTurns };
}

// --- Execute a single move ---

interface MoveResult {
  damage: number;
  hit: boolean;
  critical: boolean;
  effectiveness: number;
  weatherChange?: Weather;
}

/** Moves that can hit underground targets (Dig) */
const HITS_UNDERGROUND = new Set(['earthquake']);
/** Moves that can hit flying targets (Fly/Bounce) */
const HITS_FLYING = new Set(['thunder', 'gust', 'twister', 'sky_uppercut']);

function executeMove(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: PokemonMove | null,
  messages: string[],
  weather: Weather = 'clear'
): MoveResult {
  const atkPoke = attacker.pokemon;
  const defPoke = defender.pokemon;
  const name = atkPoke.nickname ?? `#${atkPoke.speciesId}`;

  // If the attacker is mid-charge, execute the stored move
  if (attacker.chargingMove) {
    const chargedMoveId = attacker.chargingMove.moveId;
    attacker.chargingMove = null;
    attacker.semiInvulnerable = null;

    const moveData = getMoveData(chargedMoveId);
    if (!moveData) return { damage: 0, hit: false, critical: false, effectiveness: 1 };

    messages.push(`${name} used ${moveData.name}!`);

    // Status check on charge turn execution
    if (!canAttack(attacker, messages)) {
      return { damage: 0, hit: false, critical: false, effectiveness: 1 };
    }

    return executeDamagingMove(attacker, defender, moveData, messages, weather);
  }

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

  // Status check
  if (!canAttack(attacker, messages)) {
    return { damage: 0, hit: false, critical: false, effectiveness: 1 };
  }

  // Protect/Detect check
  if (defender.isProtected && moveData.category !== 'status') {
    messages.push(`${defPoke.nickname ?? `#${defPoke.speciesId}`} protected itself!`);
    return { damage: 0, hit: false, critical: false, effectiveness: 1 };
  }

  // Semi-invulnerable dodge check
  if (defender.semiInvulnerable) {
    const canHit = (defender.semiInvulnerable === 'underground' && HITS_UNDERGROUND.has(moveData.id))
      || (defender.semiInvulnerable === 'flying' && HITS_FLYING.has(moveData.id));
    if (!canHit && moveData.category !== 'status') {
      messages.push(`${name}'s attack missed!`);
      return { damage: 0, hit: false, critical: false, effectiveness: 1 };
    }
  }

  // Multi-turn charge handling (Solar Beam, Dig, Fly)
  if (moveData.isMultiTurn) {
    // Solar Beam fires instantly in sun
    const skipCharge = moveData.id === 'solar_beam' && weather === 'sun';

    if (!skipCharge) {
      attacker.chargingMove = { moveId: moveData.id, turnsLeft: 1 };
      attacker.semiInvulnerable = moveData.semiInvulnerable ?? null;
      messages.push(`${name} ${moveData.chargeMessage ?? 'is charging up!'}`);
      return { damage: 0, hit: true, critical: false, effectiveness: 1 };
    }
  }

  // Accuracy check
  if (moveData.accuracy !== null) {
    const accStage = attacker.accuracyStage;
    const evaStage = defender.evasionStage;
    const accMult = ACCURACY_STAGE_MULTIPLIERS[Math.max(-6, Math.min(6, accStage - evaStage))] ?? 1;
    const hitChance = moveData.accuracy * accMult / 100;

    if (Math.random() > hitChance) {
      messages.push(`${name}'s attack missed!`);
      return { damage: 0, hit: false, critical: false, effectiveness: 1 };
    }
  }

  // Status moves
  if (moveData.category === 'status') {
    const weatherChange = applyMoveEffect(moveData.effect, attacker, defender, messages);
    return { damage: 0, hit: true, critical: false, effectiveness: 1, weatherChange };
  }

  return executeDamagingMove(attacker, defender, moveData, messages, weather);
}

function executeDamagingMove(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  moveData: MoveData,
  messages: string[],
  weather: Weather
): MoveResult {
  const atkPoke = attacker.pokemon;
  const defPoke = defender.pokemon;
  const name = atkPoke.nickname ?? `#${atkPoke.speciesId}`;

  // Accuracy check (for charged moves executing on turn 2)
  if (moveData.accuracy !== null && !moveData.isMultiTurn) {
    // Already checked for non-multi-turn moves above; skip here
  } else if (moveData.accuracy !== null && moveData.isMultiTurn) {
    const accStage = attacker.accuracyStage;
    const evaStage = defender.evasionStage;
    const accMult = ACCURACY_STAGE_MULTIPLIERS[Math.max(-6, Math.min(6, accStage - evaStage))] ?? 1;
    const hitChance = moveData.accuracy * accMult / 100;
    if (Math.random() > hitChance) {
      messages.push(`${name}'s attack missed!`);
      return { damage: 0, hit: false, critical: false, effectiveness: 1 };
    }
  }

  const species = getSpeciesData(atkPoke.speciesId);
  const defSpecies = getSpeciesData(defPoke.speciesId);
  const atkTypes = species?.types ?? ['normal'];
  const defTypes = defSpecies?.types ?? ['normal'];

  const isPhysical = moveData.category === 'physical';

  // Critical hit (with move-specific crit stage bonus)
  const critStage = BASE_CRIT_STAGE + (moveData.critStage ?? 0);
  const critChance = CRIT_STAGE_MULTIPLIERS[Math.min(critStage, CRIT_STAGE_MULTIPLIERS.length - 1)];
  const critical = Math.random() < critChance;

  // On crit: ignore attacker's negative Attack stages, ignore defender's positive Defense stages
  let attack: number;
  let defense: number;
  if (critical) {
    const atkStat = isPhysical ? 'attack' : 'spAttack';
    const defStat = isPhysical ? 'defense' : 'spDefense';
    const atkStage = Math.max(0, attacker.statStages[atkStat]);
    const defStage = Math.min(0, defender.statStages[defStat]);

    const savedAtkStage = attacker.statStages[atkStat];
    const savedDefStage = defender.statStages[defStat];
    attacker.statStages[atkStat] = atkStage;
    defender.statStages[defStat] = defStage;
    attack = getEffectiveStat(attacker, atkStat);
    defense = getEffectiveStat(defender, defStat);
    attacker.statStages[atkStat] = savedAtkStage;
    defender.statStages[defStat] = savedDefStage;
  } else {
    attack = getEffectiveStat(attacker, isPhysical ? 'attack' : 'spAttack');
    defense = getEffectiveStat(defender, isPhysical ? 'defense' : 'spDefense');
  }

  // STAB
  const stab = atkTypes.includes(moveData.type);

  // Levitate: Ground-type moves are immune
  if (moveData.type === 'ground' && defPoke.ability === 'levitate') {
    messages.push(`${defPoke.nickname ?? `#${defPoke.speciesId}`}'s Levitate made it immune!`);
    return { damage: 0, hit: true, critical: false, effectiveness: 0 };
  }

  // Type effectiveness
  const effectiveness = getTypeEffectivenessMultiplier(moveData.type, defTypes as PokemonType[]);

  // Random factor
  const random = 0.85 + Math.random() * 0.15;

  let damage = moveData.power
    ? calculateDamage(atkPoke.level, moveData.power, attack, defense, stab, effectiveness, critical, random)
    : 0;

  // Weather damage multiplier
  if (damage > 0) {
    if (weather === 'rain') {
      if (moveData.type === 'water') damage = Math.floor(damage * 1.5);
      if (moveData.type === 'fire') damage = Math.floor(damage * 0.5);
    }
    if (weather === 'sun') {
      if (moveData.type === 'fire') damage = Math.floor(damage * 1.5);
      if (moveData.type === 'water') damage = Math.floor(damage * 0.5);
    }
  }

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
): Weather | undefined {
  if (!effect) return undefined;

  const target = effect.target === 'self' ? attacker : defender;
  const targetName = target.pokemon.nickname ?? `#${target.pokemon.speciesId}`;

  // Status condition
  if (effect.status) {
    // Type-based immunity checks
    const targetTypes = (getSpeciesData(target.pokemon.speciesId)?.types ?? []) as PokemonType[];
    if (effect.status === 'burn' && targetTypes.includes('fire')) {
      messages.push(`${targetName} is immune to burns!`);
      return;
    }
    if ((effect.status === 'poison' || effect.status === 'bad_poison')
      && (targetTypes.includes('poison') || targetTypes.includes('steel'))) {
      messages.push(`It doesn't affect ${targetName}...`);
      return;
    }
    if (effect.status === 'freeze' && targetTypes.includes('ice')) {
      messages.push(`${targetName} is immune to freezing!`);
      return;
    }
    if (effect.status === 'paralysis' && targetTypes.includes('electric')) {
      messages.push(`${targetName} is immune to paralysis!`);
      return;
    }

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

  // Accuracy/evasion changes (Flash, Sand Attack, Smokescreen, Mud-Slap)
  if (effect.accuracyChange) {
    const change = effect.accuracyChange;
    const oldStage = target.accuracyStage;
    const newStage = Math.max(STAT_STAGE_MIN, Math.min(STAT_STAGE_MAX, oldStage + change));

    if (newStage === oldStage) {
      const dir = change > 0 ? "won't go higher" : "won't go lower";
      messages.push(`${targetName}'s accuracy ${dir}!`);
    } else {
      target.accuracyStage = newStage;
      const magnitude = Math.abs(change);
      const dir = change > 0 ? 'rose' : 'fell';
      const adverb = magnitude >= 3 ? ' drastically' : magnitude === 2 ? ' sharply' : '';
      messages.push(`${targetName}'s accuracy${adverb} ${dir}!`);
    }
  }

  // Protect/Detect
  if (effect.protect) {
    const user = effect.target === 'self' ? attacker : defender;
    // Consecutive use halves success rate each time
    const successRate = Math.pow(0.5, user.protectCount);
    if (Math.random() < successRate) {
      user.isProtected = true;
      user.protectCount++;
      messages.push(`${user.pokemon.nickname ?? `#${user.pokemon.speciesId}`} protected itself!`);
    } else {
      user.protectCount = 0;
      messages.push('But it failed!');
    }
    return undefined;
  }

  // Weather-setting moves
  if (effect.setWeather) {
    const weatherNames: Record<string, string> = {
      rain: 'It started to rain!',
      sun: 'The sunlight turned harsh!',
      sandstorm: 'A sandstorm kicked up!',
      hail: 'It started to hail!',
    };
    messages.push(weatherNames[effect.setWeather] ?? 'The weather changed!');
    return effect.setWeather;
  }

  return undefined;
}

// --- Post-turn effects ---

function applyPostTurnEffects(bp: BattlePokemon, other: BattlePokemon, messages: string[], prefix: string, weather: Weather = 'clear') {
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

  // Leech Seed — drains HP and heals the other Pokemon
  if (bp.volatileStatuses.has('leech_seed')) {
    const dmg = Math.max(1, Math.floor(poke.stats.hp / 8));
    poke.currentHp = Math.max(0, poke.currentHp - dmg);
    other.pokemon.currentHp = Math.min(other.pokemon.stats.hp, other.pokemon.currentHp + dmg);
    messages.push(`${prefix} ${name}'s health is sapped by Leech Seed!`);
  }

  // Sandstorm damage — 1/16 to non-Rock/Ground/Steel
  if (weather === 'sandstorm') {
    const types = (getSpeciesData(poke.speciesId)?.types ?? []) as PokemonType[];
    if (!types.includes('rock') && !types.includes('ground') && !types.includes('steel')) {
      const dmg = Math.max(1, Math.floor(poke.stats.hp / 16));
      poke.currentHp = Math.max(0, poke.currentHp - dmg);
      messages.push(`${prefix} ${name} is buffeted by the sandstorm!`);
    }
  }

  // Hail damage — 1/16 to non-Ice
  if (weather === 'hail') {
    const types = (getSpeciesData(poke.speciesId)?.types ?? []) as PokemonType[];
    if (!types.includes('ice')) {
      const dmg = Math.max(1, Math.floor(poke.stats.hp / 16));
      poke.currentHp = Math.max(0, poke.currentHp - dmg);
      messages.push(`${prefix} ${name} is pelted by hail!`);
    }
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

// --- EV gains ---

const MAX_TOTAL_EVS = 510;
const MAX_SINGLE_EV = 255;

function applyEvGains(pokemon: Pokemon, defeatedSpeciesId: number) {
  const species = getSpeciesData(defeatedSpeciesId);
  if (!species?.evYield) return;

  const evYield = species.evYield;

  const totalEvs = Object.values(pokemon.evs).reduce((sum, v) => sum + v, 0);
  if (totalEvs >= MAX_TOTAL_EVS) return;

  const stats: StatName[] = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'];
  for (const stat of stats) {
    const gain = evYield[stat];
    if (!gain) continue;

    const remaining = Math.min(
      gain,
      MAX_SINGLE_EV - pokemon.evs[stat],
      MAX_TOTAL_EVS - totalEvs
    );

    if (remaining > 0) {
      pokemon.evs[stat] += remaining;
    }
  }
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
    // Friendship gain on level-up (+5, capped at 255)
    pokemon.friendship = Math.min(255, pokemon.friendship + 5);
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
  const catchRate = species?.catchRate ?? 45;

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
