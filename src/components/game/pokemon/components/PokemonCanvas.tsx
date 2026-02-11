// ============================================================================
// Pokemon RPG — Main Canvas Component
// ============================================================================

import { useRef, useEffect, useCallback, useState } from 'react';
import type {
  Player, GameMap, GameVersion, Camera as CameraType,
  Pokemon, SpeciesData, BagItem, ItemData, TrainerDef,
  PokedexEntry, NPCDef, PCBox,
} from '../engine/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, SCALED_TILE, PC_BOX_COUNT, PC_BOX_SIZE } from '../engine/constants';
import { createCamera, updateCamera, setCameraTarget } from '../engine/camera';
import { renderOverworld, showMapName, renderNightTint } from '../engine/renderer';
import { getTimeOfDay } from '../engine/time-system';
import { useGameLoop } from '../hooks/useGameLoop';
import { useInput } from '../hooks/useInput';
import { useOverworld } from '../hooks/useOverworld';
import { useBattle } from '../hooks/useBattle';
import { initSprites } from '../engine/sprites';
import { setSpeciesDatabase, setMoveDatabase } from '../engine/battle-engine';
import { createPokemon } from '../engine/pokemon-factory';
import { rollWildEncounter } from '../games/red-blue/encounters';
import { kantoMaps } from '../games/red-blue/maps';
import { johtoMaps } from '../games/gold-silver/maps';
import { hoennMaps } from '../games/ruby-sapphire/maps';
import { redBlueConfig } from '../games/red-blue/config';
import { goldSilverConfig } from '../games/gold-silver/config';
import { rubySapphireConfig } from '../games/ruby-sapphire/config';
import { checkTrainerLOS } from '../engine/collision';
import { setItemDatabase, getItemData, addItem, removeItem, useItem, buyItem, sellItem } from '../engine/inventory-system';
import { checkEvolution, evolvePokemon, getSpeciesName, setEvolutionDatabase } from '../engine/evolution-system';
import { gymLeaders as kantoGymLeaders, eliteFour as kantoEliteFour, champion as kantoChampion, routeTrainers as kantoRouteTrainers, gymTrainers as kantoGymTrainers } from '../games/red-blue/trainers';
import { gymLeaders as johtoGymLeaders, eliteFour as johtoEliteFour, champion as johtoChampion, routeTrainers as johtoRouteTrainers, gymTrainers as johtoGymTrainers } from '../games/gold-silver/trainers';
import { gymLeaders as hoennGymLeaders, eliteFour as hoennEliteFour, champion as hoennChampion, routeTrainers as hoennRouteTrainers, gymTrainers as hoennGymTrainers } from '../games/ruby-sapphire/trainers';
import { getActiveEvents as getKantoEvents } from '../games/red-blue/events';
import { getActiveEvents as getJohtoEvents } from '../games/gold-silver/events';
import { getActiveEvents as getHoennEvents } from '../games/ruby-sapphire/events';
import type { StoryEvent } from '../games/red-blue/events';
import { saveGame } from '../engine/save-manager';
import MenuOverlay from './MenuOverlay';
import PartyScreen from './PartyScreen';
import BagScreen from './BagScreen';
import PokedexScreen from './PokedexScreen';
import ShopScreen from './ShopScreen';
import PCStorageScreen from './PCStorageScreen';
import MobileControls from './MobileControls';
import DialogBox from './DialogBox';
import BattleUI from './BattleUI';
import EvolutionScreen from './EvolutionScreen';

import gen1Data from '../data/pokemon-gen1.json';
import gen2Data from '../data/pokemon-gen2.json';
import gen3Data from '../data/pokemon-gen3.json';
import movesData from '../data/moves.json';
import itemsData from '../data/items.json';

type LoadMapFn = (mapId: string, startX: number, startY: number) => void;
type ActiveMenu = 'none' | 'party' | 'bag' | 'pokedex' | 'party_item_target' | 'shop' | 'pc';

// --- Static data setup ---
const VERSION_START: Record<GameVersion, { mapId: string; startX: number; startY: number }> = {
  'red-blue': { mapId: 'pallet_town', startX: 10, startY: 9 },
  'gold-silver': { mapId: 'new_bark_town', startX: 9, startY: 8 },
  'ruby-sapphire': { mapId: 'littleroot_town', startX: 8, startY: 7 },
};

const VERSION_CONFIG = {
  'red-blue': redBlueConfig,
  'gold-silver': goldSilverConfig,
  'ruby-sapphire': rubySapphireConfig,
};

const ALL_MAPS: Record<string, GameMap> = { ...kantoMaps, ...johtoMaps, ...hoennMaps };
const ALL_SPECIES = [...gen1Data, ...gen2Data, ...gen3Data] as SpeciesData[];
const speciesMap = new Map<number, SpeciesData>();
for (const s of ALL_SPECIES) speciesMap.set(s.id, s);

const ALL_TRAINERS: Record<GameVersion, {
  gymLeaders: Record<string, TrainerDef>;
  eliteFour: TrainerDef[];
  champion: TrainerDef;
  routeTrainers: Record<string, TrainerDef[]>;
  gymTrainers: Record<string, TrainerDef[]>;
}> = {
  'red-blue': { gymLeaders: kantoGymLeaders, eliteFour: kantoEliteFour, champion: kantoChampion, routeTrainers: kantoRouteTrainers, gymTrainers: kantoGymTrainers },
  'gold-silver': { gymLeaders: johtoGymLeaders, eliteFour: johtoEliteFour, champion: johtoChampion, routeTrainers: johtoRouteTrainers, gymTrainers: johtoGymTrainers },
  'ruby-sapphire': { gymLeaders: hoennGymLeaders, eliteFour: hoennEliteFour, champion: hoennChampion, routeTrainers: hoennRouteTrainers, gymTrainers: hoennGymTrainers },
};

const VERSION_EVENTS: Record<GameVersion, {
  getActiveEvents: (trigger: StoryEvent['trigger'], flags: Record<string, boolean>, mapId?: string, npcId?: string) => StoryEvent[];
}> = {
  'red-blue': { getActiveEvents: getKantoEvents },
  'gold-silver': { getActiveEvents: getJohtoEvents },
  'ruby-sapphire': { getActiveEvents: getHoennEvents },
};

function findTrainerById(version: GameVersion, trainerId: string): TrainerDef | null {
  const data = ALL_TRAINERS[version];
  if (data.gymLeaders[trainerId]) return data.gymLeaders[trainerId];
  if (data.champion.id === trainerId) return data.champion;
  const e4 = data.eliteFour.find(t => t.id === trainerId);
  if (e4) return e4;
  for (const trainers of Object.values(data.gymTrainers)) {
    const found = trainers.find(t => t.id === trainerId);
    if (found) return found;
  }
  for (const trainers of Object.values(data.routeTrainers)) {
    const found = trainers.find(t => t.id === trainerId);
    if (found) return found;
  }
  return null;
}

function resolveMap(mapId: string): GameMap | null {
  return ALL_MAPS[mapId] ?? null;
}

function getTrainerDefFromNPC(npc: NPCDef, version: GameVersion): TrainerDef | null {
  if (!npc.trainerData) return null;
  if ('class' in npc.trainerData) return npc.trainerData as TrainerDef;
  return findTrainerById(version, npc.trainerData.id);
}

// --- Component ---
interface PokemonCanvasProps {
  version: GameVersion;
  onBack?: () => void;
}

export default function PokemonCanvas({ version, onBack }: PokemonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<CameraType>(createCamera());
  const [player, setPlayer] = useState<Player | null>(null);
  const [dialogText, setDialogText] = useState<string[] | null>(null);
  const [dialogIndex, setDialogIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>('none');
  const [screen, setScreen] = useState<'overworld' | 'battle' | 'starter_select'>('overworld');
  const [bagVersion, setBagVersion] = useState(0);

  const currentMapRef = useRef<GameMap | null>(null);
  const partyRef = useRef<Pokemon[]>([]);
  const bagRef = useRef<BagItem[]>([]);
  const storyFlagsRef = useRef<Record<string, boolean>>({});
  const moneyRef = useRef(3000);
  const badgesRef = useRef<string[]>([]);
  const defeatedTrainersRef = useRef<Set<string>>(new Set());
  const pokedexRef = useRef<Record<number, PokedexEntry>>({});
  const lastPokecenterRef = useRef<{ mapId: string; x: number; y: number } | null>(null);
  const pendingItemRef = useRef<string | null>(null);
  const currentTrainerRef = useRef<TrainerDef | null>(null);
  const pendingEventRef = useRef<StoryEvent | null>(null);
  const shopItemsRef = useRef<string[]>([]);
  const alertedTrainerRef = useRef<{ npc: NPCDef; trainer: TrainerDef; framesLeft: number } | null>(null);
  const pcBoxesRef = useRef<PCBox[]>(
    Array.from({ length: PC_BOX_COUNT }, (_, i) => ({
      name: `BOX ${i + 1}`,
      pokemon: new Array(PC_BOX_SIZE).fill(null),
    }))
  );

  const visitedTownsRef = useRef<Set<string>>(new Set());

  const input = useInput();
  const overworld = useOverworld();
  const battle = useBattle();
  const loadMapRef = useRef<LoadMapFn | null>(null);

  const config = VERSION_CONFIG[version];

  // --- Story event processing ---
  const processStoryEvent = useCallback((event: StoryEvent) => {
    if (event.setsFlags) {
      for (const flag of event.setsFlags) {
        storyFlagsRef.current[flag] = true;
      }
    }
    if (event.givesItem) {
      bagRef.current = addItem(bagRef.current, event.givesItem.itemId, event.givesItem.quantity);
      setBagVersion(v => v + 1);
    }
    if (event.givesPokemon) {
      const species = speciesMap.get(event.givesPokemon.speciesId);
      if (species && partyRef.current.length < 6) {
        const poke = createPokemon(species, event.givesPokemon.level);
        partyRef.current = [...partyRef.current, poke];
        markPokedex(event.givesPokemon.speciesId, true);
      }
    }
    if (event.battle) {
      const trainer = findTrainerById(version, event.battle.trainerId);
      if (trainer) {
        pendingEventRef.current = null;
        startTrainerBattle(trainer);
      }
    }
  }, [version]);

  const checkMapEvents = useCallback((mapId: string) => {
    const events = VERSION_EVENTS[version].getActiveEvents('map_enter', storyFlagsRef.current, mapId);
    if (events.length > 0) {
      const event = events[0];
      setDialogText(event.dialog);
      setDialogIndex(0);
      pendingEventRef.current = event;
    }
  }, [version]);

  const markPokedex = useCallback((speciesId: number, caught: boolean) => {
    const prev = pokedexRef.current[speciesId];
    pokedexRef.current[speciesId] = {
      seen: true,
      caught: caught || (prev?.caught ?? false),
    };
  }, []);

  // --- Battle helpers ---
  const startTrainerBattle = useCallback((trainer: TrainerDef) => {
    const opponentParty = trainer.party.map(tp => {
      const species = speciesMap.get(tp.speciesId);
      if (!species) return null;
      const poke = createPokemon(species, tp.level);
      if (tp.moves) {
        poke.moves = tp.moves.slice(0, 4).map(mId => ({
          moveId: mId, pp: 10, maxPp: 10,
        }));
      }
      return poke;
    }).filter((p): p is Pokemon => p !== null);

    if (opponentParty.length === 0) return;

    currentTrainerRef.current = trainer;
    for (const op of opponentParty) markPokedex(op.speciesId, false);

    battle.startBattle({
      type: 'trainer',
      playerParty: partyRef.current,
      opponentParty,
      trainerDef: trainer,
    });
    setScreen('battle');
  }, [battle, markPokedex]);

  const handleUseItem = useCallback((itemId: string, targetIndex?: number) => {
    const data = getItemData(itemId);
    if (!data) return;

    if (data.category === 'pokeballs') {
      bagRef.current = removeItem(bagRef.current, itemId);
      setBagVersion(v => v + 1);
      battle.useItem(itemId);
      return;
    }

    if (targetIndex !== undefined) {
      const target = partyRef.current[targetIndex];
      if (!target) return;
      const result = useItem(bagRef.current, itemId, target);
      if (result.success) {
        bagRef.current = result.bag;
        setBagVersion(v => v + 1);
        battle.useItem(itemId, targetIndex);
      }
    }
  }, [battle]);

  // --- Overworld item use (from BagScreen -> party target) ---
  const handleOverworldItemUse = useCallback((targetIndex: number) => {
    const itemId = pendingItemRef.current;
    if (!itemId) return;

    const data = getItemData(itemId);
    if (!data) return;

    const target = partyRef.current[targetIndex];
    if (!target) return;

    // Evolution stone
    if (data.effect?.type === 'evolution') {
      const evoCheck = checkEvolution(target, 'item', itemId);
      if (evoCheck.canEvolve && evoCheck.evolvesTo) {
        const evolved = evolvePokemon(target, evoCheck.evolvesTo);
        partyRef.current[targetIndex] = evolved;
        partyRef.current = [...partyRef.current];
        bagRef.current = removeItem(bagRef.current, itemId);
        setBagVersion(v => v + 1);
        markPokedex(evolved.speciesId, true);
        pendingItemRef.current = null;
        setActiveMenu('none');
        setIsPaused(false);
        setDialogText([`${target.nickname ?? getSpeciesName(target.speciesId)} evolved into ${getSpeciesName(evolved.speciesId)}!`]);
        setDialogIndex(0);
        return;
      }
      pendingItemRef.current = null;
      setActiveMenu('none');
      setIsPaused(false);
      setDialogText(["It won't have any effect."]);
      setDialogIndex(0);
      return;
    }

    // Healing, status, revive, rare candy
    const result = useItem(bagRef.current, itemId, target);
    if (result.success) {
      bagRef.current = result.bag;
      partyRef.current = [...partyRef.current];
      setBagVersion(v => v + 1);
      pendingItemRef.current = null;
      setActiveMenu('none');
      setIsPaused(false);
      setDialogText([result.message]);
      setDialogIndex(0);
    } else {
      setDialogText([result.message]);
      setDialogIndex(0);
      pendingItemRef.current = null;
      setActiveMenu('none');
      setIsPaused(false);
    }
  }, [markPokedex]);

  // --- Shop handlers ---
  const handleBuy = useCallback((itemId: string, quantity: number) => {
    const result = buyItem(bagRef.current, moneyRef.current, itemId, quantity);
    if (result.success) {
      bagRef.current = result.bag;
      moneyRef.current = result.money;
      setBagVersion(v => v + 1);
    }
  }, []);

  const handleSell = useCallback((itemId: string, quantity: number) => {
    const result = sellItem(bagRef.current, moneyRef.current, itemId, quantity);
    if (result.success) {
      bagRef.current = result.bag;
      moneyRef.current = result.money;
      setBagVersion(v => v + 1);
    }
  }, []);

  // --- Load map ---
  const loadMap = useCallback((mapId: string, startX: number, startY: number) => {
    const map = resolveMap(mapId);
    if (!map) return;
    const rX = startX === -1 ? map.width - 1 : Math.max(0, Math.min(startX, map.width - 1));
    const rY = startY === -1 ? map.height - 1 : Math.max(0, Math.min(startY, map.height - 1));
    currentMapRef.current = map;
    const p = overworld.init(map, rX, rY);
    setPlayer(p);
    const cam = cameraRef.current;
    setCameraTarget(cam, rX * SCALED_TILE + SCALED_TILE / 2, rY * SCALED_TILE + SCALED_TILE / 2);
    updateCamera(cam, map.width, map.height);
    cam.x = cam.targetX;
    cam.y = cam.targetY;
    showMapName(map.name);
    // Track visited towns for Fly
    if (mapId.includes('_city') || mapId.includes('_town')) {
      visitedTownsRef.current.add(mapId);
    }
    // Track Pokemon Centers for whiteout teleport
    if (mapId.includes('pokecenter') || mapId.includes('pokemon_center')) {
      lastPokecenterRef.current = { mapId, x: rX, y: rY };
    }
    checkMapEvents(mapId);
  }, [overworld, checkMapEvents]);

  loadMapRef.current = loadMap;

  const flyTo = useCallback((mapId: string) => {
    const map = resolveMap(mapId);
    if (!map) return;
    const centerX = Math.floor(map.width / 2);
    const centerY = Math.floor(map.height / 2);
    loadMap(mapId, centerX, centerY);
    setScreen('overworld');
  }, [loadMap]);

  // --- Initialization ---
  useEffect(() => {
    setSpeciesDatabase(ALL_SPECIES as never[]);
    setMoveDatabase(movesData as never[]);
    setItemDatabase(itemsData as ItemData[]);
    setEvolutionDatabase(ALL_SPECIES);
    initSprites();

    bagRef.current = [
      { itemId: 'poke-ball', quantity: 10 },
      { itemId: 'potion', quantity: 5 },
    ];

    const start = VERSION_START[version];
    loadMapRef.current?.(start.mapId, start.startX, start.startY);
    setScreen('starter_select');

    overworld.onEncounter((encounterType) => {
      const map = currentMapRef.current;
      if (!map || !partyRef.current.some(p => p.currentHp > 0)) return;
      const zones = map.encounters;
      if (!zones?.length) return;
      const result = rollWildEncounter(zones, encounterType ?? 'grass');
      if (!result) return;
      const wildSpecies = speciesMap.get(result.speciesId);
      if (!wildSpecies) return;
      const wildPokemon = createPokemon(wildSpecies, result.level);
      markPokedex(result.speciesId, false);
      battle.startBattle({ type: 'wild', playerParty: partyRef.current, opponentParty: [wildPokemon] });
      setScreen('battle');
    });

    overworld.onWarp((mapId, x, y) => loadMapRef.current?.(mapId, x, y));
    overworld.onConnection((mapId, x, y) => loadMapRef.current?.(mapId, x, y));

    // Friendship gain from walking (+1 per 128 steps to lead Pokemon)
    overworld.onStep(() => {
      const lead = partyRef.current[0];
      if (lead) lead.friendship = Math.min(255, lead.friendship + 1);
    });

    // Surf check: requires a party member knowing Surf
    overworld.onSurfCheck(() => {
      return partyRef.current.some(p =>
        p.currentHp > 0 && p.moves.some(m => m.moveId === 'surf')
      );
    });

    // Field move checks: Cut, Strength
    overworld.onFieldMoveCheck((move) => {
      return partyRef.current.some(p =>
        p.currentHp > 0 && p.moves.some(m => m.moveId === move)
      );
    });

    overworld.onNPCInteract((npcId) => {
      const map = currentMapRef.current;
      if (!map) return;
      // Check for story event on this NPC first
      const events = VERSION_EVENTS[version].getActiveEvents('interact', storyFlagsRef.current, map.id, npcId);
      if (events.length > 0) {
        const event = events[0];
        setDialogText(event.dialog);
        setDialogIndex(0);
        pendingEventRef.current = event;
        return;
      }
      const npc = map.npcs.find(n => n.id === npcId);
      if (!npc) return;

      // Healer NPC: heal all party Pokemon
      if (npc.heals) {
        for (const pkmn of partyRef.current) {
          pkmn.currentHp = pkmn.stats.hp;
          pkmn.status = null;
          for (const move of pkmn.moves) move.pp = move.maxPp;
        }
        setDialogText([
          'Welcome to our POKeMON CENTER!',
          "We'll restore your POKeMON to full health.",
          '...Your POKeMON are fully healed!',
          'We hope to see you again!',
        ]);
        setDialogIndex(0);
        return;
      }

      // Shop NPC: open shop screen
      if (npc.shopItems && npc.shopItems.length > 0) {
        shopItemsRef.current = npc.shopItems;
        setActiveMenu('shop');
        setIsPaused(true);
        return;
      }

      // PC terminal: open PC storage
      if (npc.isPC) {
        setActiveMenu('pc');
        setIsPaused(true);
        return;
      }

      // Default NPC dialog
      setDialogText(npc.dialog);
      setDialogIndex(0);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Handle battle end ---
  useEffect(() => {
    battle.onBattleEnd((result, opponentParty) => {
      setScreen('overworld');
      const trainer = currentTrainerRef.current;

      if (result === 'caught' && opponentParty.length > 0) {
        const caught = opponentParty[0];
        markPokedex(caught.speciesId, true);
        if (partyRef.current.length < 6) {
          partyRef.current = [...partyRef.current, caught];
        }
      }

      if (result === 'win' && trainer) {
        defeatedTrainersRef.current.add(trainer.id);
        moneyRef.current += trainer.reward;
        if (trainer.isGymLeader && trainer.badge) {
          if (!badgesRef.current.includes(trainer.badge)) {
            badgesRef.current = [...badgesRef.current, trainer.badge];
            storyFlagsRef.current[`badge_${trainer.badge.toLowerCase().replace(/\s+/g, '_')}`] = true;
          }
        }

        // Champion victory: set flag and show Hall of Fame dialog
        const championDef = ALL_TRAINERS[version].champion;
        if (trainer.id === championDef.id) {
          const flagKey = version === 'red-blue' ? 'defeated_champion'
            : version === 'gold-silver' ? 'defeated_champion_gs'
            : 'defeated_champion_rs';
          storyFlagsRef.current[flagKey] = true;

          // Heal party fully after becoming champion
          for (const pkmn of partyRef.current) {
            pkmn.currentHp = pkmn.stats.hp;
            pkmn.status = null;
            for (const move of pkmn.moves) move.pp = move.maxPp;
          }

          setDialogText([
            `Congratulations!`,
            `You defeated ${championDef.name}!`,
            `You are the new POKEMON CHAMPION!`,
            `Your team has been entered into`,
            `the HALL OF FAME!`,
          ]);
          setDialogIndex(0);
        }
      }

      if (result === 'win' || result === 'run') {
        for (const pkmn of partyRef.current) {
          if (pkmn.currentHp <= 0 && result === 'win') pkmn.currentHp = 1;
        }
      }

      // Whiteout: halve money, heal party, teleport to last Pokemon Center
      if (result === 'lose') {
        moneyRef.current = Math.floor(moneyRef.current / 2);
        for (const pkmn of partyRef.current) {
          pkmn.currentHp = pkmn.stats.hp;
          pkmn.status = null;
          for (const move of pkmn.moves) move.pp = move.maxPp;
        }
        const center = lastPokecenterRef.current;
        if (center) {
          setTimeout(() => loadMapRef.current?.(center.mapId, center.x, center.y), 200);
        }
        setDialogText(['You blacked out!']);
        setDialogIndex(0);
      }

      currentTrainerRef.current = null;
    });
  }, [battle, markPokedex]);

  // --- Dialog advancement ---
  const advanceDialog = useCallback(() => {
    if (!dialogText) return;
    if (dialogIndex < dialogText.length - 1) {
      setDialogIndex(i => i + 1);
    } else {
      setDialogText(null);
      setDialogIndex(0);
      // Process pending story event after dialog finishes
      const event = pendingEventRef.current;
      if (event) {
        pendingEventRef.current = null;
        processStoryEvent(event);
      }
    }
  }, [dialogText, dialogIndex, processStoryEvent]);

  // --- Pause menu handlers ---
  const handleSave = useCallback(() => {
    const p = overworld.getState()?.player;
    if (!p) return;
    saveGame({
      version,
      playerName: 'RED',
      rivalName: 'BLUE',
      player: p,
      party: partyRef.current,
      pcBoxes: [],
      bag: bagRef.current,
      money: moneyRef.current,
      badges: badgesRef.current,
      pokedex: pokedexRef.current,
      storyFlags: storyFlagsRef.current,
      currentMap: currentMapRef.current?.id ?? '',
      playTime: 0,
      timestamp: Date.now(),
    });
    setIsPaused(false);
    setActiveMenu('none');
    setDialogText(['Game saved!']);
    setDialogIndex(0);
  }, [overworld, version]);

  // --- Starter selection ---
  const handleStarterSelect = useCallback((index: number) => {
    const starterSpec = config.starters[index];
    const starterSpecies = speciesMap.get(starterSpec.speciesId);
    if (starterSpecies) {
      const starter = createPokemon(starterSpecies, starterSpec.level);
      partyRef.current = [starter];
      markPokedex(starterSpec.speciesId, true);
    }
    setScreen('overworld');
    setDialogText([`You chose ${getSpeciesName(starterSpec.speciesId)}!`]);
    setDialogIndex(0);
  }, [config.starters, markPokedex]);

  // --- Trainer LOS check ---
  const checkTrainers = useCallback((p: Player, map: GameMap) => {
    if (alertedTrainerRef.current) return; // Already alerted, wait for countdown
    for (const npc of map.npcs) {
      if (!npc.isTrainer || !npc.lineOfSight) continue;
      if (defeatedTrainersRef.current.has(npc.trainerData?.id ?? npc.id)) continue;
      if (!checkTrainerLOS(npc, p.tileX, p.tileY, map)) continue;
      const trainer = getTrainerDefFromNPC(npc, version);
      if (trainer && !defeatedTrainersRef.current.has(trainer.id)) {
        alertedTrainerRef.current = { npc, trainer, framesLeft: 40 };
        return;
      }
    }
  }, [version]);

  // --- Game loop ---
  useGameLoop((_dt, frameCount) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const map = currentMapRef.current;
    if (!canvas || !ctx || !map) return;
    input.update();

    if (screen === 'battle' && battle.battleState) return;
    if (screen === 'starter_select') return;
    if (input.isJustPressed('start')) { setIsPaused(p => !p); setActiveMenu('none'); return; }
    if (dialogText) {
      if (input.isJustPressed('a')) advanceDialog();
      const p = overworld.getState()?.player;
      if (p) {
        renderOverworld(ctx, map, p, cameraRef.current, frameCount);
        if (version === 'gold-silver') renderNightTint(ctx, getTimeOfDay());
      }
      return;
    }
    if (isPaused) return;

    const dir = input.getDirection();
    const aPressed = input.isJustPressed('a');
    const updatedPlayer = overworld.update(dir.x, dir.y, aPressed, cameraRef.current);

    if (updatedPlayer) {
      updateCamera(cameraRef.current, map.width, map.height);
      renderOverworld(ctx, map, updatedPlayer, cameraRef.current, frameCount);
      if (version === 'gold-silver') renderNightTint(ctx, getTimeOfDay());

      // Trainer alert countdown: show "!" above alerted NPC
      const alert = alertedTrainerRef.current;
      if (alert) {
        const cam = cameraRef.current;
        const sx = alert.npc.x * SCALED_TILE - cam.x;
        const sy = alert.npc.y * SCALED_TILE - cam.y;
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('!', sx + SCALED_TILE / 2, sy - 4);
        alert.framesLeft--;
        if (alert.framesLeft <= 0) {
          const trainer = alert.trainer;
          alertedTrainerRef.current = null;
          startTrainerBattle(trainer);
        }
      }

      setPlayer({ ...updatedPlayer });
      if (!updatedPlayer.isMoving && !alertedTrainerRef.current) checkTrainers(updatedPlayer, map);
    }
  }, true);

  const pokedexSize = config.pokedexSize;

  return (
    <div className="relative flex flex-col items-center gap-4">
      <div
        className="relative bg-black rounded-lg overflow-hidden border-4 border-neutral-800 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
        style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, maxWidth: '100%' }}
      >
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}
          className="block w-full h-full" style={{ imageRendering: 'pixelated' }} />

        {screen === 'battle' && battle.battleState && (
          <BattleUI state={battle.battleState} canvasRef={canvasRef} frameCount={0}
            bag={bagRef.current} onFight={battle.fight} onItem={battle.item}
            onSwitch={battle.switchPokemon} onRun={battle.run}
            onChooseMove={battle.chooseMove} onChooseSwitch={battle.chooseSwitch}
            onUseItem={handleUseItem} onAdvance={battle.advance} onCancel={battle.cancel}
            isHeld={input.isHeld} isJustPressed={input.isJustPressed} />
        )}

        {screen === 'battle' && battle.battleState?.phase === 'evolution_check' && battle.battleState.pendingEvolution && (
          <EvolutionScreen
            fromSpeciesId={battle.battleState.pendingEvolution.pokemon.speciesId}
            toSpeciesId={battle.battleState.pendingEvolution.evolvesTo}
            fromName={battle.battleState.pendingEvolution.pokemon.nickname ?? getSpeciesName(battle.battleState.pendingEvolution.pokemon.speciesId)}
            toName={getSpeciesName(battle.battleState.pendingEvolution.evolvesTo)}
            onComplete={battle.evolve}
            onCancel={battle.cancelEvolve}
          />
        )}

        {screen === 'overworld' && dialogText && (
          <DialogBox text={dialogText[dialogIndex]}
            showContinue={dialogIndex < dialogText.length - 1} onAdvance={advanceDialog} />
        )}

        {screen === 'overworld' && isPaused && activeMenu === 'none' && (
          <MenuOverlay
            onResume={() => { setIsPaused(false); setActiveMenu('none'); }}
            onPokedex={() => setActiveMenu('pokedex')}
            onParty={() => setActiveMenu('party')}
            onBag={() => setActiveMenu('bag')}
            onSave={handleSave}
            onOption={() => {}}
            playerName="RED"
            badges={badgesRef.current.length}
            playTime="0:00"
          />
        )}

        {screen === 'overworld' && activeMenu === 'party' && (
          <PartyScreen party={partyRef.current} mode="view"
            onBack={() => setActiveMenu('none')} />
        )}

        {screen === 'overworld' && activeMenu === 'bag' && (
          <BagScreen bag={bagRef.current}
            onUse={(itemId) => {
              const data = getItemData(itemId);
              if (!data?.effect) return;
              const targetTypes = ['heal_hp', 'heal_status', 'revive', 'heal_pp', 'rare_candy', 'evolution'];
              if (targetTypes.includes(data.effect.type)) {
                pendingItemRef.current = itemId;
                setActiveMenu('party_item_target');
              }
            }}
            onBack={() => setActiveMenu('none')} />
        )}

        {screen === 'overworld' && activeMenu === 'pokedex' && (
          <PokedexScreen pokedex={pokedexRef.current} maxId={pokedexSize}
            onBack={() => setActiveMenu('none')} />
        )}

        {screen === 'overworld' && activeMenu === 'party_item_target' && (
          <PartyScreen party={partyRef.current} mode="item"
            onSelect={handleOverworldItemUse}
            onBack={() => { pendingItemRef.current = null; setActiveMenu('bag'); }} />
        )}

        {screen === 'overworld' && activeMenu === 'shop' && (
          <ShopScreen shopItems={shopItemsRef.current} bag={bagRef.current}
            money={moneyRef.current} onBuy={handleBuy} onSell={handleSell}
            onBack={() => { setActiveMenu('none'); setIsPaused(false); }} />
        )}
        {screen === 'overworld' && activeMenu === 'pc' && (
          <PCStorageScreen
            boxes={pcBoxesRef.current}
            party={partyRef.current}
            onDeposit={(partyIdx, boxIdx, slot) => {
              if (partyRef.current.length <= 1) return;
              const pkmn = partyRef.current[partyIdx];
              pcBoxesRef.current[boxIdx].pokemon[slot] = pkmn;
              partyRef.current = partyRef.current.filter((_, i) => i !== partyIdx);
            }}
            onWithdraw={(boxIdx, slot) => {
              if (partyRef.current.length >= 6) return;
              const pkmn = pcBoxesRef.current[boxIdx].pokemon[slot];
              if (!pkmn) return;
              pcBoxesRef.current[boxIdx].pokemon[slot] = null;
              partyRef.current = [...partyRef.current, pkmn];
            }}
            onBack={() => { setActiveMenu('none'); setIsPaused(false); }}
          />
        )}

        {screen === 'starter_select' && (
          <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center gap-3">
            <p className="font-mono text-white text-sm mb-2">Choose your starter POKeMON!</p>
            <div className="flex gap-4">
              {config.starters.map((s, i) => {
                const name = getSpeciesName(s.speciesId);
                const typeColors: Record<string, string> = {
                  grass: '#78c850', fire: '#f08030', water: '#6890f0',
                };
                const species = speciesMap.get(s.speciesId);
                const mainType = species?.types?.[0] ?? 'normal';
                const bg = typeColors[mainType] ?? '#a8a878';
                return (
                  <button key={s.speciesId} onClick={() => handleStarterSelect(i)}
                    className="flex flex-col items-center gap-1 px-4 py-3 rounded-lg font-mono text-white text-xs font-bold transition-transform hover:scale-110 focus:scale-110 focus:outline-none"
                    style={{ backgroundColor: bg }}>
                    <span className="text-lg">#{s.speciesId}</span>
                    <span>{name}</span>
                    <span className="text-[10px] opacity-75">Lv.{s.level}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between w-full max-w-[480px] text-xs text-neutral-500">
        <span>
          {screen === 'battle'
            ? 'Z/Enter: Confirm | X/Esc: Cancel'
            : 'WASD/Arrows: Move | Z: Interact | X: Cancel | P: Pause'}
        </span>
        {onBack && screen === 'overworld' && (
          <button onClick={onBack} className="text-neutral-400 hover:text-white transition-colors">Back</button>
        )}
      </div>

      <MobileControls input={input} />

      {screen === 'overworld' && player && currentMapRef.current && (
        <div className="text-[10px] text-neutral-600 font-mono">
          Tile: ({player.tileX}, {player.tileY}) | Map: {currentMapRef.current.name}
          {partyRef.current.length > 0 && ` | ${partyRef.current[0].nickname} Lv.${partyRef.current[0].level} HP:${partyRef.current[0].currentHp}/${partyRef.current[0].stats.hp}`}
          {` | $${moneyRef.current} | Badges: ${badgesRef.current.length}`}
        </div>
      )}
    </div>
  );
}
