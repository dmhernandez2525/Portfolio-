import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Skull, TrendingUp, Heart, Zap, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PoisonLizardState, Projectile } from './types';
import { createInitialState, updateGameState, spawnEnemy, CANVAS_WIDTH, CANVAS_HEIGHT } from './logic';

export const PoisonLizard: React.FC = () => {
  const [state, setState] = useState<PoisonLizardState>(createInitialState());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);

  const shoot = useCallback((targetX: number, targetY: number) => {
    if (state.status !== 'Playing') return;

    const dx = targetX - state.lizardPosition.x;
    const dy = targetY - state.lizardPosition.y;
    const angle = Math.atan2(dy, dx);
    const speed = 10 * state.upgrades.spitSpeed;

    const newProjectile: Projectile = {
      id: Math.random().toString(36).substr(2, 9),
      position: { ...state.lizardPosition },
      velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
      damage: 10,
      isPoison: true
    };

    setState(prev => ({
      ...prev,
      projectiles: [...prev.projectiles, newProjectile]
    }));
  }, [state.lizardPosition, state.status, state.upgrades.spitSpeed]);

  const update = useCallback((time: number) => {
    setState(prev => {
      if (prev.status !== 'Playing') return prev;

      // Spawn enemies
      if (time - lastSpawnRef.current > 2000 / (1 + prev.wave * 0.1)) {
        lastSpawnRef.current = time;
        prev.enemies.push(spawnEnemy(prev.wave));
      }

      return updateGameState(prev);
    });
    requestRef.current = requestAnimationFrame(update);
  }, []);

  useEffect(() => {
    if (state.status === 'Playing') {
      requestRef.current = requestAnimationFrame(update);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [state.status, update]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background (Jungle floor)
    ctx.fillStyle = '#1a2e1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Lizard
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(state.lizardPosition.x, state.lizardPosition.y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#166534';
    ctx.fillRect(state.lizardPosition.x - 5, state.lizardPosition.y - 30, 10, 15); // Tongue/Head

    // Draw Projectiles
    state.projectiles.forEach(p => {
      ctx.fillStyle = '#a855f7'; // Purple venom
      ctx.beginPath();
      ctx.arc(p.position.x, p.position.y, 5, 0, Math.PI * 2);
      ctx.fill();
      // Glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#a855f7';
    });
    ctx.shadowBlur = 0;

    // Draw Enemies
    state.enemies.forEach(e => {
      const colors = {
        Barbarian: '#f97316',
        Archer: '#ec4899',
        Giant: '#475569',
        Goblin: '#22c55e'
      };
      ctx.fillStyle = colors[e.type];
      ctx.fillRect(e.position.x - 15, e.position.y - 15, 30, 30);

      // Health bar
      ctx.fillStyle = '#000';
      ctx.fillRect(e.position.x - 15, e.position.y - 25, 30, 4);
      ctx.fillStyle = e.poisonTicks > 0 ? '#a855f7' : '#ef4444';
      ctx.fillRect(e.position.x - 15, e.position.y - 25, (e.health / e.maxHealth) * 30, 4);
    });
  }, [state]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    shoot(x, y);
  };

  const startWave = () => setState(prev => ({ ...prev, status: 'Playing' }));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-4">
      <div className="max-w-4xl w-full">
        <div className="flex justify-between items-center mb-4 text-white">
          <div className="flex gap-4">
            <Badge variant="outline" className="text-green-400 border-green-400/30">
              <Heart className="w-3 h-3 mr-1" /> {Math.max(0, state.health)}%
            </Badge>
            <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">
              $ {state.gold}
            </Badge>
            <Badge variant="outline" className="text-purple-400 border-purple-400/30">
              Wave {state.wave}
            </Badge>
          </div>
          <div className="font-mono text-xl">SCORE: {state.score.toString().padStart(6, '0')}</div>
        </div>

        <div className="relative rounded-xl overflow-hidden border-2 border-slate-800 shadow-2xl">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onClick={handleCanvasClick}
            className="cursor-crosshair w-full h-auto bg-slate-900"
          />

          <AnimatePresence>
            {state.status === 'Menu' && (
              <Overlay>
                <h1 className="text-5xl font-black text-green-400 italic mb-4 tracking-tighter">POISON LIZARD</h1>
                <p className="text-slate-400 mb-8 max-w-md">Defend the jungle from the invading troops using your lethal venomous spit. Upgrade your skills to survive later waves.</p>
                <Button size="lg" className="bg-green-600 hover:bg-green-500" onClick={startWave}>
                  <Play className="w-4 h-4 mr-2" /> BEGIN DEFENSE
                </Button>
              </Overlay>
            )}

            {state.status === 'GameOver' && (
              <Overlay>
                <Skull className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-4xl font-black text-white mb-2">JUNGLE OVERRUN</h2>
                <p className="text-slate-400 mb-6">Final Score: {state.score}</p>
                <Button size="lg" variant="outline" onClick={() => setState(createInitialState())}>
                  <RotateCcw className="w-4 h-4 mr-2" /> TRY AGAIN
                </Button>
              </Overlay>
            )}
          </AnimatePresence>
        </div>

        {/* Upgrade Bar */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
           <UpgradeCard 
             icon={<Zap className="text-yellow-400"/>} 
             title="Spit Speed" 
             cost={100} 
             level={state.upgrades.spitSpeed}
             canAfford={state.gold >= 100}
             onUpgrade={() => {}}
           />
           <UpgradeCard 
             icon={<Target className="text-purple-400"/>} 
             title="Venom Potency" 
             cost={200} 
             level={state.upgrades.venomPotency}
             canAfford={state.gold >= 200}
             onUpgrade={() => {}}
           />
           <UpgradeCard 
             icon={<TrendingUp className="text-blue-400"/>} 
             title="Jungle Reinforcement" 
             cost={150} 
             level={1}
             canAfford={state.gold >= 150}
             onUpgrade={() => {}}
           />
        </div>
      </div>
    </div>
  );
};

const Overlay: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 z-10"
  >
    {children}
  </motion.div>
);

const UpgradeCard: React.FC<{ icon: React.ReactNode, title: string, cost: number, level: number, canAfford: boolean, onUpgrade: () => void }> = ({ icon, title, cost, level, canAfford, onUpgrade }) => (
  <Card className="bg-slate-900 border-slate-800 p-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
      <div>
        <div className="text-xs text-slate-400 uppercase font-bold tracking-widest">{title}</div>
        <div className="text-sm font-bold text-white">Level {level}</div>
      </div>
    </div>
    <Button size="sm" variant={canAfford ? "secondary" : "ghost"} disabled={!canAfford} onClick={onUpgrade}>
      ${cost}
    </Button>
  </Card>
);

export default PoisonLizard;
