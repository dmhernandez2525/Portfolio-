import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Briefcase, Users, FastForward, ChevronRight } from 'lucide-react';
import type { BattleState, BagItem, InputState, PokemonMove } from '../engine/types';
import { Badge } from '@/components/ui/badge';

interface BattleUIProps {
  state: BattleState;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  frameCount: number;
  bag: BagItem[];
  onFight: () => void;
  onItem: () => void;
  onSwitch: () => void;
  onRun: () => void;
  onChooseMove: (index: number) => void;
  onChooseSwitch: (index: number) => void;
  onUseItem: (itemId: string, targetIndex?: number) => void;
  onAdvance: () => void;
  onCancel: () => void;
  isHeld: (button: keyof InputState) => boolean;
  isJustPressed: (button: keyof InputState) => boolean;
}

export default function BattleUI({
  state,
  onFight,
  onItem,
  onSwitch,
  onRun,
  onChooseMove,
  onAdvance,
  onCancel,
  isJustPressed,
}: BattleUIProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset index on phase change
  useEffect(() => {
    setSelectedIndex(0);
  }, [state.phase]);

  // Handle Keyboard Navigation
  useEffect(() => {
    const handleInput = () => {
      if (state.phase === 'action_select') {
        if (isJustPressed('up') && selectedIndex >= 2) setSelectedIndex(s => s - 2);
        if (isJustPressed('down') && selectedIndex < 2) setSelectedIndex(s => s + 2);
        if (isJustPressed('left') && selectedIndex % 2 !== 0) setSelectedIndex(s => s - 1);
        if (isJustPressed('right') && selectedIndex % 2 === 0) setSelectedIndex(s => s + 1);
        if (isJustPressed('a')) {
          [onFight, onItem, onSwitch, onRun][selectedIndex]();
        }
      } else if (state.phase === 'move_select') {
        const count = state.playerActive.pokemon.moves.length;
        if (isJustPressed('up') && selectedIndex >= 2) setSelectedIndex(s => s - 2);
        if (isJustPressed('down') && selectedIndex + 2 < count) setSelectedIndex(s => s + 2);
        if (isJustPressed('left') && selectedIndex % 2 !== 0) setSelectedIndex(s => s - 1);
        if (isJustPressed('right') && selectedIndex % 2 === 0 && selectedIndex + 1 < count) setSelectedIndex(s => s + 1);
        if (isJustPressed('a')) onChooseMove(selectedIndex);
        if (isJustPressed('b')) onCancel();
      } else if (state.phase === 'intro' || state.phase === 'turn_execute' || state.phase === 'battle_end') {
        if (isJustPressed('a')) onAdvance();
      }
    };
    handleInput();
  }, [isJustPressed, selectedIndex, state.phase]);

  return (
    <div className="absolute inset-0 pointer-events-none font-mono">
      {/* HUD: Opponent */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute top-10 left-10 w-64 bg-slate-900/90 border-2 border-slate-700 p-3 rounded-br-3xl rounded-tl-lg pointer-events-auto shadow-xl"
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-white font-bold uppercase tracking-tight">{state.opponentActive.pokemon.nickname ?? 'Opponent'}</span>
          <span className="text-slate-400 text-xs">Lv{state.opponentActive.pokemon.level}</span>
        </div>
        <HPBar current={state.opponentActive.pokemon.currentHp} max={state.opponentActive.pokemon.stats.hp} />
      </motion.div>

      {/* HUD: Player */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute bottom-32 right-10 w-72 bg-slate-900/90 border-2 border-slate-700 p-4 rounded-bl-3xl rounded-tr-lg pointer-events-auto shadow-xl"
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-white font-bold uppercase tracking-tight">{state.playerActive.pokemon.nickname ?? 'Player'}</span>
          <span className="text-slate-400 text-xs">Lv{state.playerActive.pokemon.level}</span>
        </div>
        <HPBar current={state.playerActive.pokemon.currentHp} max={state.playerActive.pokemon.stats.hp} />
        <div className="flex justify-end mt-1">
          <span className="text-white text-[10px] tabular-nums">
            {state.playerActive.pokemon.currentHp} / {state.playerActive.pokemon.stats.hp}
          </span>
        </div>
        {/* Exp Bar */}
        <div className="h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
          <motion.div 
            className="h-full bg-blue-400"
            initial={{ width: 0 }}
            animate={{ width: `${(state.playerActive.pokemon.exp % 1000) / 100}%` }}
          />
        </div>
      </motion.div>

      {/* Bottom Control Panel */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-slate-950 border-t-4 border-slate-800 flex pointer-events-auto">
        {/* Dialogue Box */}
        <div className="flex-1 p-4 text-white text-lg relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.currentText}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="pr-8"
            >
              {state.currentText || "What will you do?"}
            </motion.div>
          </AnimatePresence>
          {state.phase !== 'action_select' && state.phase !== 'move_select' && (
            <motion.div 
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="absolute bottom-4 right-4"
            >
              <ChevronRight className="text-slate-500" />
            </motion.div>
          )}
        </div>

        {/* Interaction Menus */}
        <div className="w-80 border-l-4 border-slate-800 bg-slate-900 p-2">
          {state.phase === 'action_select' && (
            <div className="grid grid-cols-2 gap-2 h-full">
              <ActionButton 
                icon={<Sword size={16}/>} 
                label="FIGHT" 
                active={selectedIndex === 0} 
                onClick={onFight} 
                color="hover:bg-red-500/20 active:bg-red-500/40"
              />
              <ActionButton 
                icon={<Briefcase size={16}/>} 
                label="BAG" 
                active={selectedIndex === 1} 
                onClick={onItem} 
                color="hover:bg-orange-500/20 active:bg-orange-500/40"
              />
              <ActionButton 
                icon={<Users size={16}/>} 
                label="POKéMON" 
                active={selectedIndex === 2} 
                onClick={onSwitch} 
                color="hover:bg-green-500/20 active:bg-green-500/40"
              />
              <ActionButton 
                icon={<FastForward size={16}/>} 
                label="RUN" 
                active={selectedIndex === 3} 
                onClick={onRun} 
                color="hover:bg-blue-500/20 active:bg-blue-500/40"
              />
            </div>
          )}

          {state.phase === 'move_select' && (
            <div className="grid grid-cols-2 gap-2 h-full">
              {state.playerActive.pokemon.moves.map((move, i) => (
                <MoveButton 
                  key={move.moveId}
                  move={move}
                  active={selectedIndex === i}
                  onClick={() => onChooseMove(i)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const HPBar: React.FC<{ current: number, max: number }> = ({ current, max }) => {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const color = pct > 50 ? 'bg-green-500' : pct > 20 ? 'bg-yellow-500' : 'bg-red-500';
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold text-yellow-400">HP</span>
      <div className="flex-1 h-3 bg-slate-800 rounded-full border border-slate-600 p-0.5 overflow-hidden">
        <motion.div 
          className={`h-full rounded-full ${color} shadow-[0_0_8px_rgba(0,0,0,0.5)_inset]`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
        />
      </div>
    </div>
  );
};

const ActionButton: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void, color: string }> = ({ icon, label, active, onClick, color }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded border-2 transition-all ${active ? 'border-yellow-400 bg-white/10 scale-[1.02]' : 'border-transparent text-slate-400'} ${color}`}
  >
    <span className={active ? 'text-yellow-400' : ''}>{icon}</span>
    <span className="font-bold text-sm tracking-tighter">{label}</span>
  </button>
);

const MoveButton: React.FC<{ move: PokemonMove, active: boolean, onClick: () => void }> = ({ move, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col justify-center px-3 py-1 rounded border-2 transition-all text-left ${active ? 'border-yellow-400 bg-white/10 scale-[1.02]' : 'border-transparent text-slate-400'}`}
    >
      <div className="flex justify-between items-center w-full">
        <span className="font-bold text-[11px] truncate uppercase">{move.moveId.replace(/_/g, ' ')}</span>
      </div>
      <div className="flex justify-between items-center w-full mt-0.5">
        <Badge variant="outline" className="text-[8px] h-3 px-1 py-0 uppercase border-slate-600 text-slate-500">TYPE</Badge>
        <span className="text-[10px] tabular-nums">{move.pp}/{move.maxPp}</span>
      </div>
    </button>
  );
};
