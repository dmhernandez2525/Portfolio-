import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Play, RotateCcw, Pause, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { GameState, BeanColor, Bean, GameBoard } from './types';
import { createEmptyBoard, getRandomColor, generateId, GRID_WIDTH, GRID_HEIGHT, findMatches, applyGravity } from './logic';

const TICK_RATE = 500; // ms per gravity drop

export const MeanBeanMachine: React.FC = () => {
  const [state, setState] = useState<GameState>({
    player: createEmptyBoard(),
    opponent: createEmptyBoard(),
    activePair: null,
    nextPair: { primary: getRandomColor(), secondary: getRandomColor() },
    status: 'paused',
    winner: null
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const spawnPair = useCallback(() => {
    const { nextPair } = stateRef.current;
    const primary: Bean = { id: generateId(), color: nextPair.primary, x: 2, y: 0, isFalling: true, connected: { up: false, down: false, left: false, right: false } };
    const secondary: Bean = { id: generateId(), color: nextPair.secondary, x: 2, y: -1, isFalling: true, connected: { up: false, down: false, left: false, right: false } };
    
    setState(prev => ({
      ...prev,
      activePair: { primary, secondary, rotation: 0 },
      nextPair: { primary: getRandomColor(), secondary: getRandomColor() }
    }));
  }, []);

  const movePlayer = useCallback((dx: number) => {
    setState(prev => {
      if (!prev.activePair || prev.status !== 'playing') return prev;
      const { primary, secondary } = prev.activePair;
      
      const newX1 = primary.x + dx;
      const newX2 = secondary.x + dx;
      
      if (newX1 < 0 || newX1 >= GRID_WIDTH || newX2 < 0 || newX2 >= GRID_WIDTH) return prev;
      if (prev.player.grid[newX1][Math.max(0, Math.floor(primary.y))] || prev.player.grid[newX2][Math.max(0, Math.floor(secondary.y))]) return prev;
      
      return {
        ...prev,
        activePair: {
          ...prev.activePair,
          primary: { ...primary, x: newX1 },
          secondary: { ...secondary, x: newX2 }
        }
      };
    });
  }, []);

  const rotatePlayer = useCallback(() => {
    setState(prev => {
      if (!prev.activePair || prev.status !== 'playing') return prev;
      const { primary, secondary, rotation } = prev.activePair;
      const newRotation = (rotation + 90) % 360 as 0 | 90 | 180 | 270;
      
      let nextX2 = primary.x;
      let nextY2 = primary.y;
      
      switch (newRotation) {
        case 0: nextY2 = primary.y - 1; break; // Secondary above
        case 90: nextX2 = primary.x + 1; break; // Secondary right
        case 180: nextY2 = primary.y + 1; break; // Secondary below
        case 270: nextX2 = primary.x - 1; break; // Secondary left
      }
      
      if (nextX2 < 0 || nextX2 >= GRID_WIDTH || nextY2 >= GRID_HEIGHT) return prev;
      if (nextY2 >= 0 && prev.player.grid[nextX2][nextY2]) return prev;
      
      return {
        ...prev,
        activePair: {
          ...prev.activePair,
          secondary: { ...secondary, x: nextX2, y: nextY2 },
          rotation: newRotation
        }
      };
    });
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (stateRef.current.status !== 'playing') return;
    
    switch (e.key) {
      case 'ArrowLeft': movePlayer(-1); break;
      case 'ArrowRight': movePlayer(1); break;
      case 'ArrowUp': rotatePlayer(); break;
      case 'ArrowDown': /* Faster drop logic handled by loop check */ break;
    }
  }, [movePlayer, rotatePlayer]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const processGravity = useCallback(() => {
    setState(prev => {
      if (prev.status !== 'playing' || !prev.activePair) return prev;
      
      const { primary, secondary } = prev.activePair;
      const nextY1 = primary.y + 1;
      const nextY2 = secondary.y + 1;
      
      const hitBottom = nextY1 >= GRID_HEIGHT || nextY2 >= GRID_HEIGHT || 
                        (nextY1 >= 0 && prev.player.grid[primary.x][nextY1]) || 
                        (nextY2 >= 0 && prev.player.grid[secondary.x][nextY2]);
      
      if (hitBottom) {
        // Lock in beans
        const newGrid = [...prev.player.grid.map(col => [...col])];
        if (primary.y >= 0) newGrid[primary.x][Math.floor(primary.y)] = { ...primary, isFalling: false };
        if (secondary.y >= 0) newGrid[secondary.x][Math.floor(secondary.y)] = { ...secondary, isFalling: false };
        
        // Check for immediate game over (if beans locked at top)
        if (primary.y < 0 || secondary.y < 0) {
          return { ...prev, status: 'gameover', winner: 'opponent' };
        }

        return {
          ...prev,
          player: { ...prev.player, grid: newGrid },
          activePair: null,
          status: 'animating'
        };
      }
      
      return {
        ...prev,
        activePair: {
          ...prev.activePair,
          primary: { ...primary, y: nextY1 },
          secondary: { ...secondary, y: nextY2 }
        }
      };
    });
  }, []);

  useEffect(() => {
    if (state.status === 'playing') {
      gameLoopRef.current = setInterval(processGravity, TICK_RATE);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
  }, [state.status, processGravity]);

  // Handle board animations (matching, gravity, etc.)
  useEffect(() => {
    if (state.status === 'animating') {
      const timer = setTimeout(() => {
        setState(prev => {
          const newGrid = [...prev.player.grid.map(col => [...col])];
          const hasGravity = applyGravity(newGrid);
          
          if (hasGravity) {
            return { ...prev, player: { ...prev.player, grid: newGrid } };
          }
          
          const matches = findMatches(newGrid);
          if (matches.length > 0) {
            // Remove matches and score
            matches.forEach(group => {
              group.forEach(cell => { newGrid[cell.x][cell.y] = null; });
            });
            return {
              ...prev,
              player: { 
                ...prev.player, 
                grid: newGrid, 
                score: prev.player.score + (matches.length * 100) 
              }
            };
          }
          
          // No more gravity or matches, resume play
          spawnPair();
          return { ...prev, status: 'playing' };
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [state.status, state.player.grid, spawnPair]);

  const startGame = () => {
    setState({
      player: createEmptyBoard(),
      opponent: createEmptyBoard(),
      activePair: null,
      nextPair: { primary: getRandomColor(), secondary: getRandomColor() },
      status: 'playing',
      winner: null
    });
    spawnPair();
  };

  const renderGrid = (board: GameBoard) => (
    <div className="grid grid-cols-6 grid-rows-12 gap-0.5 bg-slate-900/50 p-1 border-4 border-slate-700 rounded-lg shadow-2xl relative">
      {Array.from({ length: GRID_HEIGHT }).map((_, y) => (
        Array.from({ length: GRID_WIDTH }).map((_, x) => {
          const bean = board.grid[x][y];
          return (
            <div key={`${x}-${y}`} className="w-6 h-6 md:w-8 md:h-8 border border-white/5 rounded-sm relative overflow-hidden">
              {bean && <BeanSprite color={bean.color} />}
            </div>
          );
        })
      ))}
      
      {/* Render active pair for player */}
      {board === state.player && state.activePair && (
        <>
          <div 
            className="absolute w-6 h-6 md:w-8 md:h-8 transition-all duration-100"
            style={{ 
              left: `calc(${state.activePair.primary.x} * 100% / 6 + 4px)`, 
              top: `calc(${state.activePair.primary.y} * 100% / 12 + 4px)` 
            }}
          >
            <BeanSprite color={state.activePair.primary.color} />
          </div>
          <div 
            className="absolute w-6 h-6 md:w-8 md:h-8 transition-all duration-100"
            style={{ 
              left: `calc(${state.activePair.secondary.x} * 100% / 6 + 4px)`, 
              top: `calc(${state.activePair.secondary.y} * 100% / 12 + 4px)` 
            }}
          >
            <BeanSprite color={state.activePair.secondary.color} />
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-950 text-white p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg shadow-lg shadow-amber-500/20">
              <Gamepad2 className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tighter italic">MEAN BEAN MACHINE</h1>
              <Badge variant="outline" className="text-amber-400 border-amber-400/30">Dr. Robotnik's Arena</Badge>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => setState(p => ({ ...p, status: p.status === 'paused' ? 'playing' : 'paused' }))}>
              {state.status === 'paused' ? <Play /> : <Pause />}
            </Button>
            <Button variant="ghost" size="icon" onClick={startGame}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 justify-center items-start">
          {/* Player Side */}
          <div className="flex flex-col items-center">
            <div className="mb-2 flex justify-between w-full px-2">
              <span className="font-bold text-cyan-400">PLAYER 1</span>
              <span className="font-mono text-xl">{state.player.score.toString().padStart(6, '0')}</span>
            </div>
            {renderGrid(state.player)}
          </div>

          {/* Center Column: UI & Next Pair */}
          <div className="flex flex-col items-center gap-6 py-10">
            <Card className="bg-slate-900/80 border-slate-700 p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Next</p>
              <div className="flex flex-col gap-1 items-center bg-black/40 p-3 rounded-lg border border-white/10">
                <div className="w-8 h-8"><BeanSprite color={state.nextPair.secondary} /></div>
                <div className="w-8 h-8"><BeanSprite color={state.nextPair.primary} /></div>
              </div>
            </Card>

            <AnimatePresence>
              {state.status === 'gameover' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl text-center backdrop-blur-md"
                >
                  <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <h2 className="text-xl font-black">GAME OVER</h2>
                  <p className="text-sm opacity-80 mb-3">{state.winner === 'player' ? 'You Win!' : 'Robotnik Wins!'}</p>
                  <Button size="sm" onClick={startGame}>Replay</Button>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="text-center space-y-1 opacity-50">
              <p className="text-[10px] uppercase tracking-tighter">Controls</p>
              <p className="text-xs">Arrows to Move/Rotate</p>
            </div>
          </div>

          {/* Opponent Side (Dr. Robotnik) */}
          <div className="flex flex-col items-center opacity-80">
            <div className="mb-2 flex justify-between w-full px-2">
              <span className="font-bold text-red-500">ROBOTNIK</span>
              <span className="font-mono text-xl">{state.opponent.score.toString().padStart(6, '0')}</span>
            </div>
            {renderGrid(state.opponent)}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const BeanSprite: React.FC<{ color: BeanColor }> = ({ color }) => {
  const colorMap = {
    red: 'bg-red-500 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.5)]',
    blue: 'bg-blue-500 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.5)]',
    green: 'bg-green-500 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.5)]',
    yellow: 'bg-yellow-400 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.5)]',
    purple: 'bg-purple-500 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.5)]',
    garbage: 'bg-slate-400 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.5)] grayscale'
  };

  return (
    <div className={`w-full h-full rounded-full ${colorMap[color]} flex items-center justify-center p-1`}>
      {color !== 'garbage' && (
        <div className="flex gap-1">
          <div className="w-1.5 h-2 bg-white rounded-full relative">
            <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-black rounded-full -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="w-1.5 h-2 bg-white rounded-full relative">
            <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-black rounded-full -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MeanBeanMachine;
