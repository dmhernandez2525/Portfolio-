// ============================================================================
// Shopping Cart Hero — Main Game Component
// ============================================================================

import { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { GamePhase, GameState, InputKeys } from './types';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, DEFAULT_UPGRADES, FLAT_GROUND_Y,
  HILL_END_X, RAMP_WIDTH, HILL_START_X,
  MARKER_1_X, MARKER_2_X, MARKER_TIMING_WINDOW, MARKER1_SPEED_BONUS, MAX_RUN_SPEED,
  WHEEL_UPGRADES, ROCKET_UPGRADES, ARMOR_UPGRADES,
  TRICK_DEFS, GROUPIE_COSTS, GROUPIE_MULTIPLIERS,
} from './constants';
import {
  createRunner, updateRunner, createCart, launchCart,
  updateCartFlight, updateCartRolling, createTrickState, updateTricks,
  getDistance, getHeight, createLandingParticles, updateParticles, getHillY,
} from './physics';
import { render } from './renderer';
import { calculateResult, purchaseUpgrade } from './shop';
import { useProfile } from '@/context/profile-context';

const SAVE_KEY = 'shopping-cart-hero-save';

type SaveData = { money: number; highScore: number; upgrades: typeof DEFAULT_UPGRADES; totalRuns: number };

function loadLocalSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.money === 'number' && typeof parsed.highScore === 'number' && parsed.upgrades) {
        return {
          money: parsed.money,
          highScore: parsed.highScore,
          upgrades: { ...DEFAULT_UPGRADES, ...parsed.upgrades },
          totalRuns: typeof parsed.totalRuns === 'number' ? parsed.totalRuns : 0,
        };
      }
    }
  } catch { /* ignore corrupted data */ }
  return { money: 0, highScore: 0, upgrades: { ...DEFAULT_UPGRADES }, totalRuns: 0 };
}

function saveToLocalStorage(data: SaveData) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

export function ShoppingCartHeroGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<InputKeys>({ left: false, right: false, up: false, down: false, space: false });
  const stateRef = useRef<GameState | null>(null);
  const frameRef = useRef(0);
  const animRef = useRef<number>(0);
  const maxHeightRef = useRef(0);
  const crashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Profile integration
  const { activeProfile, saveGameData, loadGameData } = useProfile();

  const loadSaveData = useCallback((): SaveData => {
    if (activeProfile) {
      const profileData = loadGameData<SaveData>('shopping-cart-hero');
      if (profileData && typeof profileData.money === 'number') {
        return {
          money: profileData.money,
          highScore: profileData.highScore,
          upgrades: { ...DEFAULT_UPGRADES, ...profileData.upgrades },
          totalRuns: typeof profileData.totalRuns === 'number' ? profileData.totalRuns : 0,
        };
      }
    }
    return loadLocalSave();
  }, [activeProfile, loadGameData]);

  const saveData = useCallback((data: SaveData) => {
    if (activeProfile) {
      saveGameData('shopping-cart-hero', data);
    }
    saveToLocalStorage(data);
  }, [activeProfile, saveGameData]);

  const initialSave = useRef(loadLocalSave());
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [money, setMoney] = useState(initialSave.current.money);
  const [highScore, setHighScore] = useState(initialSave.current.highScore);
  const [upgrades, setUpgrades] = useState(initialSave.current.upgrades);
  const [totalRuns, setTotalRuns] = useState(initialSave.current.totalRuns);
  const [lastResult, setLastResult] = useState<ReturnType<typeof calculateResult> | null>(null);

  // Reload save data when profile changes
  useEffect(() => {
    const data = loadSaveData();
    setMoney(data.money);
    setHighScore(data.highScore);
    setUpgrades(data.upgrades);
    setTotalRuns(data.totalRuns);
    if (phase !== 'menu' && phase !== 'shop') {
      cancelAnimationFrame(animRef.current);
      setPhase('menu');
    }
  }, [activeProfile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // One-time migration: copy localStorage data to profile if profile is empty
  useEffect(() => {
    if (activeProfile) {
      const profileData = loadGameData<SaveData>('shopping-cart-hero');
      if (!profileData) {
        const localData = loadLocalSave();
        if (localData.money > 0 || localData.totalRuns > 0) {
          saveGameData('shopping-cart-hero', localData);
        }
      }
    }
  }, [activeProfile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Input handling ---

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = keysRef.current;
      if (e.key === 'ArrowLeft' || e.key === 'a') k.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') k.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w') k.up = true;
      if (e.key === 'ArrowDown' || e.key === 's') k.down = true;
      if (e.key === ' ' || e.code === 'Space') k.space = true;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const k = keysRef.current;
      if (e.key === 'ArrowLeft' || e.key === 'a') k.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') k.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w') k.up = false;
      if (e.key === 'ArrowDown' || e.key === 's') k.down = false;
      if (e.key === ' ' || e.code === 'Space') k.space = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // --- Game loop ---

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = stateRef.current;
    if (!state) return;

    const keys = keysRef.current;
    frameRef.current++;

    // Update particles every frame
    state.particles = updateParticles(state.particles);

    // Phase-specific updates
    if (state.phase === 'run') {
      state.runner = updateRunner(state.runner, keys, state.upgrades);

      // Marker 1: Jump into cart (timing mechanic)
      if (keys.up && state.runner.inTimingWindow1 && !state.runner.marker1Locked) {
        const dist = Math.abs(state.runner.pos.x - MARKER_1_X);
        state.runner.marker1Power = 1.0 - (dist / MARKER_TIMING_WINDOW);
        state.runner.marker1Locked = true;

        // Apply speed boost from marker 1 power
        const wheelMult = state.upgrades ? (state.upgrades.wheels >= 0 ? [1.0, 1.3, 1.6, 2.0][state.upgrades.wheels] : 1.0) : 1.0;
        state.runner.speed += state.runner.marker1Power * MARKER1_SPEED_BONUS * MAX_RUN_SPEED * wheelMult;

        state.cart.inCart = true;
        state.phase = 'launch';
        setPhase('launch');
      }

      // Auto-fail if runner passes timing window without pressing UP
      if (state.runner.pos.x > MARKER_1_X + MARKER_TIMING_WINDOW && !state.runner.marker1Locked) {
        state.runner.marker1Power = 0;
        state.runner.marker1Locked = true;
        state.cart.inCart = true;
        state.phase = 'launch';
        setPhase('launch');
      }

      // Missed the cart entirely (past ramp)
      if (state.runner.pos.x >= HILL_END_X + RAMP_WIDTH) {
        if (!state.cart.inCart) {
          state.phase = 'results';
          setPhase('results');
          const result = calculateResult(0, 0, 0, true, state.upgrades);
          state.lastResult = result;
          setLastResult(result);
        }
      }

      state.cameraX = Math.max(0, state.runner.pos.x - 200);
    }

    if (state.phase === 'launch') {
      state.runner = updateRunner(state.runner, keys, state.upgrades);
      state.cameraX = Math.max(0, state.runner.pos.x - 200);

      // Marker 2: Ramp timing (power bar)
      if (keys.up && state.runner.inTimingWindow2 && !state.runner.marker2Locked) {
        const dist = Math.abs(state.runner.pos.x - MARKER_2_X);
        state.runner.marker2Power = 1.0 - (dist / MARKER_TIMING_WINDOW);
        state.runner.marker2Locked = true;
      }

      // Auto-fail marker 2 if passed without pressing
      if (state.runner.pos.x > MARKER_2_X + MARKER_TIMING_WINDOW && !state.runner.marker2Locked) {
        state.runner.marker2Power = 0;
        state.runner.marker2Locked = true;
      }

      if (state.runner.pos.x >= HILL_END_X + RAMP_WIDTH - 10) {
        state.cart = launchCart(state.runner, state.upgrades);
        state.phase = 'flight';
        setPhase('flight');
        maxHeightRef.current = 0;
      }
    }

    if (state.phase === 'flight') {
      state.cart = updateCartFlight(state.cart, keys, state.upgrades);
      state.tricks = updateTricks(state.tricks, state.cart, keys, state.upgrades);

      const height = getHeight(state.cart);
      if (height > maxHeightRef.current) maxHeightRef.current = height;

      state.cameraX = Math.max(0, state.cart.pos.x - 300);

      if (state.cart.onGround) {
        // Spawn landing particles
        const speed = Math.abs(state.cart.vel.x) + Math.abs(state.cart.vel.y);
        state.particles = [
          ...state.particles,
          ...createLandingParticles(state.cart.pos.x, state.cart.pos.y + 15, speed),
        ];

        if (state.cart.crashed) {
          state.phase = 'landing';
          setPhase('landing');
          if (crashTimerRef.current) clearTimeout(crashTimerRef.current);
          crashTimerRef.current = setTimeout(() => {
            crashTimerRef.current = null;
            finishRun(state);
          }, 1500);
        } else {
          state.phase = 'landing';
          setPhase('landing');
        }
      }
    }

    if (state.phase === 'landing' && !state.cart.crashed) {
      state.cart = updateCartRolling(state.cart, state.upgrades);
      state.cameraX = Math.max(0, state.cart.pos.x - 300);

      if (state.cart.vel.x <= 0) {
        finishRun(state);
      }
    }

    // Render
    render(
      ctx, state.phase, state.cart, state.runner, state.tricks,
      state.upgrades, state.cameraX, frameRef.current, state.money,
      state.particles,
    );

    if (state.phase !== 'menu' && state.phase !== 'shop' && state.phase !== 'results') {
      animRef.current = requestAnimationFrame(gameLoop);
    }
  }, []);

  const finishRun = useCallback((state: GameState) => {
    const dist = getDistance(state.cart);
    const result = calculateResult(
      dist, maxHeightRef.current, state.tricks.trickPoints,
      state.cart.crashed, state.upgrades,
    );

    state.lastResult = result;
    setLastResult(result);

    const newMoney = state.money + result.moneyEarned;
    const newHighScore = Math.max(state.highScore, result.totalScore);
    const newRuns = state.totalRuns + 1;

    // Lose groupies on crash
    const newUpgrades = state.cart.crashed
      ? { ...state.upgrades, groupies: 0 }
      : state.upgrades;

    state.money = newMoney;
    state.highScore = newHighScore;
    state.totalRuns = newRuns;
    state.upgrades = newUpgrades;

    setMoney(newMoney);
    setHighScore(newHighScore);
    setTotalRuns(newRuns);
    setUpgrades(newUpgrades);
    saveData({ money: newMoney, highScore: newHighScore, upgrades: newUpgrades, totalRuns: newRuns });

    state.phase = 'results';
    setPhase('results');
  }, [saveData]);

  // --- Phase transitions ---

  const startRun = useCallback(() => {
    const state: GameState = {
      phase: 'run',
      money,
      highScore,
      totalRuns,
      upgrades: { ...upgrades },
      cart: createCart(),
      runner: createRunner(),
      tricks: createTrickState(),
      lastResult: null,
      cameraX: 0,
      groundY: FLAT_GROUND_Y,
      particles: [],
    };
    stateRef.current = state;
    maxHeightRef.current = 0;
    setPhase('run');
    setLastResult(null);

    animRef.current = requestAnimationFrame(gameLoop);
  }, [money, highScore, totalRuns, upgrades, gameLoop]);

  const goToShop = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    setPhase('shop');
  }, []);

  const handlePurchase = useCallback((upgradeId: string) => {
    const result = purchaseUpgrade(upgrades, money, upgradeId);
    if (result.success) {
      setUpgrades(result.upgrades);
      setMoney(result.money);
      saveData({ money: result.money, highScore, upgrades: result.upgrades, totalRuns });
    }
  }, [upgrades, money, highScore, totalRuns, saveData]);

  // --- Cleanup ---

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animRef.current);
      if (crashTimerRef.current) clearTimeout(crashTimerRef.current);
    };
  }, []);

  // --- Render canvas for menu ---

  useEffect(() => {
    if (phase === 'menu') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw static menu scene
      const state: GameState = {
        phase: 'menu',
        money, highScore, totalRuns,
        upgrades: { ...upgrades },
        cart: createCart(),
        runner: { ...createRunner(), pos: { x: HILL_START_X + 80, y: 0 }, speed: 0, frame: 0, passedMarker1: false, passedMarker2: false, marker1Power: 0, marker2Power: 0, inTimingWindow1: false, inTimingWindow2: false, marker1Locked: false, marker2Locked: false },
        tricks: createTrickState(),
        lastResult: null,
        cameraX: 0,
        groundY: FLAT_GROUND_Y,
        particles: [],
      };
      state.runner.pos.y = getHillY(HILL_START_X + 80) - 20;
      render(ctx, 'run', state.cart, state.runner, state.tricks, state.upgrades, 0, 0, money, []);
    }
  }, [phase, money, highScore, totalRuns, upgrades]);

  // --- UI ---

  return (
    <div className="h-screen w-screen bg-gray-900 flex flex-col items-center justify-center overflow-hidden p-2">
      <div className="relative max-h-[70vh] aspect-[8/5]">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-gray-600 rounded-lg shadow-2xl"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Menu overlay */}
        {phase === 'menu' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-lg">
            <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg" style={{ fontFamily: 'monospace' }}>
              SHOPPING CART
            </h1>
            <h2 className="text-3xl font-bold text-yellow-400 mb-8 drop-shadow-lg" style={{ fontFamily: 'monospace' }}>
              HERO
            </h2>
            {highScore > 0 && (
              <p className="text-gray-300 mb-4 font-mono">High Score: {highScore} | Runs: {totalRuns}</p>
            )}
            <div className="flex gap-4">
              <button
                onClick={() => setPhase('shop')}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-lg transition-colors font-mono"
              >
                PLAY
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-6 font-mono">Arrow keys to play | RIGHT = run | UP = jump | SPACE = rockets</p>
          </div>
        )}

        {/* Shop overlay */}
        {phase === 'shop' && (
          <div className="absolute inset-0 bg-gray-900/95 rounded-lg flex flex-col">
            <div className="flex justify-between items-center p-4 pb-2">
              <h2 className="text-xl font-bold text-white font-mono">UPGRADE SHOP</h2>
              <div className="text-yellow-400 font-bold text-lg font-mono">${money}</div>
            </div>

            <div className="flex-1 overflow-y-auto px-4">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {/* Wheels */}
              <ShopCategory
                title="Wheels"
                tiers={WHEEL_UPGRADES.tiers}
                currentTier={upgrades.wheels}
                money={money}
                onBuy={(i) => handlePurchase(`wheels_${i}`)}
              />

              {/* Rockets */}
              <ShopCategory
                title="Rockets"
                tiers={ROCKET_UPGRADES.tiers}
                currentTier={upgrades.rockets}
                money={money}
                onBuy={(i) => handlePurchase(`rockets_${i}`)}
              />

              {/* Armor */}
              <ShopCategory
                title="Armor"
                tiers={ARMOR_UPGRADES.tiers}
                currentTier={upgrades.armor}
                money={money}
                onBuy={(i) => handlePurchase(`armor_${i}`)}
              />

              {/* Tricks */}
              <div className="bg-gray-800 rounded-lg p-3">
                <h3 className="text-sm font-bold text-white mb-2 font-mono">Tricks</h3>
                {TRICK_DEFS.map((trick, i) => {
                  const owned = upgrades[trick.id as keyof typeof upgrades];
                  return (
                    <div key={trick.id} className="flex justify-between items-center mb-2">
                      <div>
                        <span className={`font-mono text-sm ${owned ? 'text-green-400' : 'text-gray-300'}`}>
                          {trick.name}
                        </span>
                        <span className="text-gray-500 text-xs ml-2">{trick.description}</span>
                      </div>
                      {owned ? (
                        <span className="text-green-400 text-xs font-mono">OWNED</span>
                      ) : (
                        <button
                          disabled={money < trick.cost}
                          onClick={() => handlePurchase(`trick_${i}`)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:text-gray-400 text-white text-xs rounded font-mono transition-colors"
                        >
                          ${trick.cost}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Groupies */}
            <div className="bg-gray-800 rounded-lg p-3 mb-2">
              <h3 className="text-sm font-bold text-white mb-2 font-mono">
                Groupies ({upgrades.groupies}/3) — {GROUPIE_MULTIPLIERS[upgrades.groupies]}x multiplier
              </h3>
              <p className="text-gray-400 text-[10px] mb-2 font-mono">Warning: Lost on crash!</p>
              <div className="flex gap-2">
                {GROUPIE_COSTS.map((cost, i) => {
                  const hired = upgrades.groupies > i;
                  const isNext = upgrades.groupies === i;
                  return (
                    <button
                      key={i}
                      disabled={!isNext || money < cost}
                      onClick={() => handlePurchase(`groupie_${i}`)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:text-gray-400 text-white text-xs rounded font-mono transition-colors"
                    >
                      {hired ? 'HIRED' : `Groupie ${i + 1} — $${cost}`}
                    </button>
                  );
                })}
              </div>
            </div>
            </div>

            <div className="p-4 pt-2 border-t border-gray-700">
              <button
                onClick={startRun}
                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg text-xl transition-colors font-mono"
              >
                GO!
              </button>
            </div>
          </div>
        )}

        {/* Results overlay */}
        {phase === 'results' && lastResult && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg">
            <h2 className="text-3xl font-bold text-white mb-6 font-mono">
              {lastResult.crashed ? 'CRASHED!' : 'RUN COMPLETE!'}
            </h2>

            <div className="bg-gray-800 rounded-lg p-6 mb-6 min-w-[300px]">
              <div className="space-y-2 text-lg font-mono">
                <div className="flex justify-between text-gray-300">
                  <span>Distance:</span>
                  <span className="text-white">{lastResult.distance}m</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Max Height:</span>
                  <span className="text-white">{lastResult.maxHeight}m</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tricks:</span>
                  <span className="text-white">{lastResult.trickPoints} pts</span>
                </div>
                {lastResult.groupiesLost > 0 && (
                  <div className="flex justify-between text-red-400">
                    <span>Groupies Lost:</span>
                    <span>{lastResult.groupiesLost}</span>
                  </div>
                )}
                <div className="border-t border-gray-600 pt-2 mt-2 flex justify-between text-yellow-400 font-bold">
                  <span>Money Earned:</span>
                  <span>${lastResult.moneyEarned}</span>
                </div>
                <div className="flex justify-between text-green-400 font-bold text-xl">
                  <span>Total Score:</span>
                  <span>{lastResult.totalScore}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={goToShop}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-lg transition-colors font-mono"
              >
                SHOP
              </button>
              <button
                onClick={startRun}
                className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg text-lg transition-colors font-mono"
              >
                RETRY
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls hint */}
      {(phase === 'run' || phase === 'launch' || phase === 'flight') && (
        <div className="mt-4 text-gray-400 text-sm font-mono text-center">
          {phase === 'run' && 'Hold RIGHT to run → Press UP at orange marker to jump in cart'}
          {phase === 'launch' && 'Press UP at the second marker for launch power!'}
          {phase === 'flight' && 'LEFT/RIGHT rotate | SPACE = rockets | DOWN = Handstand | UP = Superman'}
        </div>
      )}

      <Link to="/games" className="mt-4 text-gray-500 hover:text-gray-300 text-sm font-mono transition-colors">
        ← Back to Games
      </Link>
    </div>
  );
}

// --- Shop Category Component ---

function ShopCategory({
  title,
  tiers,
  currentTier,
  money,
  onBuy,
}: {
  title: string;
  tiers: { name: string; cost: number; description: string }[];
  currentTier: number;
  money: number;
  onBuy: (tierIndex: number) => void;
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <h3 className="text-sm font-bold text-white mb-2 font-mono">{title}</h3>
      {tiers.map((tier, i) => {
        const owned = currentTier >= i;
        const nextTier = i === currentTier + 1;
        return (
          <div key={i} className="flex justify-between items-center mb-2">
            <div>
              <span className={`font-mono text-sm ${owned ? 'text-green-400' : nextTier ? 'text-white' : 'text-gray-500'}`}>
                {tier.name}
              </span>
              <span className="text-gray-500 text-xs ml-2">{tier.description}</span>
            </div>
            {owned ? (
              <span className="text-green-400 text-xs font-mono">{i === currentTier ? 'EQUIPPED' : 'OWNED'}</span>
            ) : nextTier ? (
              <button
                disabled={money < tier.cost}
                onClick={() => onBuy(i)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:text-gray-400 text-white text-xs rounded font-mono transition-colors"
              >
                ${tier.cost}
              </button>
            ) : (
              <span className="text-gray-600 text-xs font-mono">${tier.cost}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
