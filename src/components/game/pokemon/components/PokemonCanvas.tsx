// ============================================================================
// Pokemon RPG — Main Canvas Component
// ============================================================================

import { useRef, useEffect, useCallback, useState } from 'react';
import type { Player, GameMap, GameVersion, Camera as CameraType } from '../engine/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, SCALED_TILE } from '../engine/constants';
import { createCamera, updateCamera, setCameraTarget } from '../engine/camera';
import { renderOverworld, showMapName } from '../engine/renderer';
import { useGameLoop } from '../hooks/useGameLoop';
import { useInput } from '../hooks/useInput';
import { useOverworld } from '../hooks/useOverworld';
import { initSprites } from '../engine/sprites';
import { kantoMaps } from '../games/red-blue/maps';
import { johtoMaps } from '../games/gold-silver/maps';
import { hoennMaps } from '../games/ruby-sapphire/maps';
import MobileControls from './MobileControls';
import DialogBox from './DialogBox';

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

// --- Universal map lookup ---

const ALL_MAPS: Record<string, GameMap> = {
  ...kantoMaps,
  ...johtoMaps,
  ...hoennMaps,
};

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
  const currentMapRef = useRef<GameMap | null>(null);

  const input = useInput();
  const overworld = useOverworld();
  const loadMapRef = useRef<LoadMapFn | null>(null);

  // Load a new map and place the player
  // x/y of -1 means "place at far edge" (used by map connections)
  const loadMap = useCallback((mapId: string, startX: number, startY: number) => {
    const map = resolveMap(mapId);
    if (!map) {
      console.warn(`[Pokemon] Map not found: ${mapId}`);
      return;
    }

    // Resolve sentinel values for connection transitions
    const resolvedX = startX === -1 ? map.width - 1 : Math.max(0, Math.min(startX, map.width - 1));
    const resolvedY = startY === -1 ? map.height - 1 : Math.max(0, Math.min(startY, map.height - 1));

    currentMapRef.current = map;

    const p = overworld.init(map, resolvedX, resolvedY);
    setPlayer(p);

    // Snap camera immediately to avoid lerp from old position
    const cam = cameraRef.current;
    const centerX = resolvedX * SCALED_TILE + SCALED_TILE / 2;
    const centerY = resolvedY * SCALED_TILE + SCALED_TILE / 2;
    setCameraTarget(cam, centerX, centerY);
    updateCamera(cam, map.width, map.height);
    cam.x = cam.targetX;
    cam.y = cam.targetY;

    showMapName(map.name);
  }, [overworld]);

  // Keep loadMap ref current to avoid stale closures in event callbacks
  loadMapRef.current = loadMap;

  // Initialize
  useEffect(() => {
    // Generate retro pixel sprite atlases
    initSprites();

    const start = VERSION_START[version];
    loadMapRef.current?.(start.mapId, start.startX, start.startY);

    overworld.onEncounter(() => {
      console.log('[Pokemon] Wild encounter triggered!');
    });

    // Warp handler — fires when player steps on a warp tile
    overworld.onWarp((mapId, x, y) => {
      loadMapRef.current?.(mapId, x, y);
    });

    // Connection handler — fires when player walks off map edge
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
      // Still render overworld behind dialog
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

        {/* Dialog overlay */}
        {dialogText && (
          <DialogBox
            text={dialogText[dialogIndex]}
            showContinue={dialogIndex < dialogText.length - 1}
            onAdvance={advanceDialog}
          />
        )}

        {/* Pause overlay */}
        {isPaused && (
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
        <span>WASD/Arrows: Move | Z/Enter: Interact | X/Esc: Cancel | P: Pause</span>
        {onBack && (
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
      {player && currentMapRef.current && (
        <div className="text-[10px] text-neutral-600 font-mono">
          Tile: ({player.tileX}, {player.tileY}) | Facing: {player.direction} | Map: {currentMapRef.current.name}
        </div>
      )}
    </div>
  );
}
