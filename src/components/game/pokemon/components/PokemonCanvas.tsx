// ============================================================================
// Pokemon RPG — Main Canvas Component
// ============================================================================

import { useRef, useEffect, useCallback, useState } from 'react';
import type { Player, GameMap, GameVersion, Camera as CameraType, Pokemon, SpeciesData } from '../engine/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, SCALED_TILE } from '../engine/constants';
import { createCamera, updateCamera, setCameraTarget } from '../engine/camera';
import { renderOverworld, showMapName } from '../engine/renderer';
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
import MobileControls from './MobileControls';
import DialogBox from './DialogBox';
import BattleUI from './BattleUI';

// Data imports
import gen1Data from '../data/pokemon-gen1.json';
import gen2Data from '../data/pokemon-gen2.json';
import gen3Data from '../data/pokemon-gen3.json';
import movesData from '../data/moves.json';

type LoadMapFn = (mapId: string, startX: number, startY: number) => void;

// --- Version → starting config ---

interface StartConfig {
  mapId: string;
  startX: number;
  startY: number;
}

const VERSION_START: Record<GameVersion, StartConfig> = {
  'red-blue': { mapId: 'pallet_town', startX: 10, startY: 9 },
  'gold-silver': { mapId: 'new_bark_town', startX: 9, startY: 8 },
  'ruby-sapphire': { mapId: 'littleroot_town', startX: 8, startY: 7 },
};

const VERSION_CONFIG = {
  'red-blue': redBlueConfig,
  'gold-silver': goldSilverConfig,
  'ruby-sapphire': rubySapphireConfig,
};

// --- Universal map lookup ---

const ALL_MAPS: Record<string, GameMap> = {
  ...kantoMaps,
  ...johtoMaps,
  ...hoennMaps,
};

// All species data combined
const ALL_SPECIES = [...gen1Data, ...gen2Data, ...gen3Data] as SpeciesData[];
const speciesMap = new Map<number, SpeciesData>();
for (const s of ALL_SPECIES) {
  speciesMap.set(s.id, s);
}

function resolveMap(mapId: string): GameMap | null {
  return ALL_MAPS[mapId] ?? null;
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
  const [screen, setScreen] = useState<'overworld' | 'battle'>('overworld');
  const currentMapRef = useRef<GameMap | null>(null);
  const partyRef = useRef<Pokemon[]>([]);

  const input = useInput();
  const overworld = useOverworld();
  const battle = useBattle();
  const loadMapRef = useRef<LoadMapFn | null>(null);

  // Load a new map and place the player
  const loadMap = useCallback((mapId: string, startX: number, startY: number) => {
    const map = resolveMap(mapId);
    if (!map) {
      console.warn(`[Pokemon] Map not found: ${mapId}`);
      return;
    }

    const resolvedX = startX === -1 ? map.width - 1 : Math.max(0, Math.min(startX, map.width - 1));
    const resolvedY = startY === -1 ? map.height - 1 : Math.max(0, Math.min(startY, map.height - 1));

    currentMapRef.current = map;

    const p = overworld.init(map, resolvedX, resolvedY);
    setPlayer(p);

    const cam = cameraRef.current;
    const centerX = resolvedX * SCALED_TILE + SCALED_TILE / 2;
    const centerY = resolvedY * SCALED_TILE + SCALED_TILE / 2;
    setCameraTarget(cam, centerX, centerY);
    updateCamera(cam, map.width, map.height);
    cam.x = cam.targetX;
    cam.y = cam.targetY;

    showMapName(map.name);
  }, [overworld]);

  loadMapRef.current = loadMap;

  // Initialize databases, sprites, starter, and callbacks
  useEffect(() => {
    // Populate species + move databases for the battle engine
    setSpeciesDatabase(ALL_SPECIES as never[]);
    setMoveDatabase(movesData as never[]);

    // Generate retro pixel sprite atlases
    initSprites();

    // Create starter Pokemon for the player
    const config = VERSION_CONFIG[version];
    const starterSpec = config.starters[0];
    const starterSpecies = speciesMap.get(starterSpec.speciesId);
    if (starterSpecies) {
      const starter = createPokemon(starterSpecies, starterSpec.level);
      partyRef.current = [starter];
    }

    // Load starting map
    const start = VERSION_START[version];
    loadMapRef.current?.(start.mapId, start.startX, start.startY);

    // Wild encounter handler
    overworld.onEncounter(() => {
      const map = currentMapRef.current;
      if (!map || partyRef.current.length === 0) return;

      // Check if any party member is still alive
      const hasAlive = partyRef.current.some(p => p.currentHp > 0);
      if (!hasAlive) return;

      const zones = map.encounters;
      if (!zones || zones.length === 0) return;

      const result = rollWildEncounter(zones);
      if (!result) return;

      const wildSpecies = speciesMap.get(result.speciesId);
      if (!wildSpecies) return;

      const wildPokemon = createPokemon(wildSpecies, result.level);

      battle.startBattle({
        type: 'wild',
        playerParty: partyRef.current,
        opponentParty: [wildPokemon],
      });

      setScreen('battle');
    });

    // Warp handler
    overworld.onWarp((mapId, x, y) => {
      loadMapRef.current?.(mapId, x, y);
    });

    // Connection handler
    overworld.onConnection((mapId, x, y) => {
      loadMapRef.current?.(mapId, x, y);
    });

    overworld.onNPCInteract((npcId) => {
      const map = currentMapRef.current;
      if (!map) return;
      const npc = map.npcs.find(n => n.id === npcId);
      if (npc) {
        setDialogText(npc.dialog);
        setDialogIndex(0);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle battle end
  useEffect(() => {
    battle.onBattleEnd((result) => {
      setScreen('overworld');

      // Heal party after winning wild battle
      if (result === 'win' || result === 'run') {
        // Restore party HP for now (simplified — no Pokemon Center yet)
        for (const pkmn of partyRef.current) {
          if (pkmn.currentHp <= 0 && result === 'win') {
            pkmn.currentHp = 1; // Fainted pokemon get 1 HP back
          }
        }
      }
    });
  }, [battle]);

  // Handle dialog advancement
  const advanceDialog = useCallback(() => {
    if (!dialogText) return;
    if (dialogIndex < dialogText.length - 1) {
      setDialogIndex(i => i + 1);
    } else {
      setDialogText(null);
      setDialogIndex(0);
    }
  }, [dialogText, dialogIndex]);

  // Game loop
  useGameLoop((_dt, frameCount) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const map = currentMapRef.current;
    if (!canvas || !ctx || !map) return;

    // Update input state
    input.update();

    // --- Battle mode ---
    if (screen === 'battle' && battle.battleState) {
      // BattleUI handles rendering + input via its own effects
      return;
    }

    // --- Overworld mode ---

    // Handle pause
    if (input.isJustPressed('start')) {
      setIsPaused(p => !p);
      return;
    }

    // Dialog mode
    if (dialogText) {
      if (input.isJustPressed('a')) {
        advanceDialog();
      }
      const p = overworld.getState()?.player;
      if (p) {
        renderOverworld(ctx, map, p, cameraRef.current, frameCount);
      }
      return;
    }

    if (isPaused) return;

    // Overworld update
    const dir = input.getDirection();
    const aPressed = input.isJustPressed('a');
    const updatedPlayer = overworld.update(dir.x, dir.y, aPressed, cameraRef.current);

    if (updatedPlayer) {
      updateCamera(cameraRef.current, map.width, map.height);
      renderOverworld(ctx, map, updatedPlayer, cameraRef.current, frameCount);
      setPlayer({ ...updatedPlayer });
    }
  }, true);

  return (
    <div className="relative flex flex-col items-center gap-4">
      {/* Game viewport */}
      <div
        className="relative bg-black rounded-lg overflow-hidden border-4 border-neutral-800 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
        style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, maxWidth: '100%' }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block w-full h-full"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Battle UI (renders to shared canvas) */}
        {screen === 'battle' && battle.battleState && (
          <BattleUI
            state={battle.battleState}
            canvasRef={canvasRef}
            frameCount={0}
            onFight={battle.fight}
            onItem={battle.item}
            onSwitch={battle.switchPokemon}
            onRun={battle.run}
            onChooseMove={battle.chooseMove}
            onChooseSwitch={battle.chooseSwitch}
            onAdvance={battle.advance}
            onCancel={battle.cancel}
            isHeld={input.isHeld}
            isJustPressed={input.isJustPressed}
          />
        )}

        {/* Dialog overlay */}
        {screen === 'overworld' && dialogText && (
          <DialogBox
            text={dialogText[dialogIndex]}
            showContinue={dialogIndex < dialogText.length - 1}
            onAdvance={advanceDialog}
          />
        )}

        {/* Pause overlay */}
        {screen === 'overworld' && isPaused && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-40">
            <div className="text-white text-center">
              <h2 className="text-2xl font-bold mb-2">PAUSED</h2>
              <p className="text-sm text-neutral-400">Press P or START to resume</p>
            </div>
          </div>
        )}
      </div>

      {/* Info bar */}
      <div className="flex items-center justify-between w-full max-w-[480px] text-xs text-neutral-500">
        <span>
          {screen === 'battle'
            ? 'Z/Enter: Confirm | X/Esc: Cancel'
            : 'WASD/Arrows: Move | Z/Enter: Interact | X/Esc: Cancel | P: Pause'
          }
        </span>
        {onBack && screen === 'overworld' && (
          <button
            onClick={onBack}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            Back
          </button>
        )}
      </div>

      {/* Mobile controls */}
      <MobileControls input={input} />

      {/* Debug info */}
      {screen === 'overworld' && player && currentMapRef.current && (
        <div className="text-[10px] text-neutral-600 font-mono">
          Tile: ({player.tileX}, {player.tileY}) | Facing: {player.direction} | Map: {currentMapRef.current.name}
          {partyRef.current.length > 0 && ` | Party: ${partyRef.current[0].nickname} Lv.${partyRef.current[0].level} HP:${partyRef.current[0].currentHp}/${partyRef.current[0].stats.hp}`}
        </div>
      )}
    </div>
  );
}
