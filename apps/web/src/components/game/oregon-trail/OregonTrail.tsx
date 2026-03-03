import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, ShoppingCart, Info, AlertCircle, Skull, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { OregonTrailState } from './types';
import { LANDMARKS, simulateDay, hunt } from './logic';

const TRAVEL_TICK = 1000; // 1 day per second

export const OregonTrail: React.FC = () => {
  const [state, setState] = useState<OregonTrailState>({
    date: new Date(1848, 2, 1),
    milesTraveled: 0,
    supplies: {
      oxen: 4,
      food: 500,
      clothing: 3,
      ammunition: 500,
      spareParts: 2,
      money: 800
    },
    members: [
      { name: 'Player', status: 'Healthy' },
      { name: 'Abigail', status: 'Healthy' },
      { name: 'Jed', status: 'Healthy' },
      { name: 'Zeb', status: 'Healthy' },
      { name: 'Sarah', status: 'Healthy' }
    ],
    pace: 'Steady',
    rations: 'Filling',
    location: 0,
    status: 'Landmark'
  });

  const [isPaused, setIsPaused] = useState(true);
  const travelInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.status === 'Travel' && !isPaused) {
      travelInterval.current = setInterval(() => {
        setState(prev => simulateDay(prev));
      }, TRAVEL_TICK);
    } else {
      if (travelInterval.current) clearInterval(travelInterval.current);
    }
    return () => { if (travelInterval.current) clearInterval(travelInterval.current); };
  }, [state.status, isPaused]);

  const handleHunt = () => {
    const { foodGained, ammoSpent } = hunt(state);
    setState(prev => ({
      ...prev,
      supplies: {
        ...prev.supplies,
        food: prev.supplies.food + foodGained,
        ammunition: Math.max(0, prev.supplies.ammunition - ammoSpent)
      },
      currentEvent: `Hunting successful! Gained ${foodGained}lbs of food at the cost of ${ammoSpent} bullets.`,
      status: 'Event'
    }));
  };

  const continueJourney = () => {
    setState(prev => ({ ...prev, status: 'Travel' }));
    setIsPaused(false);
  };

  const renderLandmark = () => {
    const landmark = LANDMARKS[state.location];
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="flex flex-col items-center gap-6 p-8 bg-black/80 border-2 border-green-500 rounded-lg text-green-500 font-mono shadow-[0_0_20px_rgba(34,197,94,0.3)]"
      >
        <h2 className="text-3xl font-bold border-b-2 border-green-500 pb-2 w-full text-center">
          {landmark.name}
        </h2>
        
        <div className="flex flex-col gap-2 text-lg">
          <p>Distance Traveled: {state.milesTraveled} miles</p>
          <p>Current Date: {state.date.toDateString()}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black" onClick={continueJourney}>
            Continue Journey
          </Button>
          <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black" onClick={() => {/* Shop logic */}}>
            Check Supplies
          </Button>
          <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black" onClick={handleHunt}>
            Go Hunting
          </Button>
          <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black" onClick={() => {/* Map logic */}}>
            View Map
          </Button>
        </div>
      </motion.div>
    );
  };

  const renderTravel = () => (
    <div className="flex flex-col items-center gap-6 p-8 bg-black/90 border-2 border-green-500 rounded-lg text-green-500 font-mono min-h-[400px]">
      <div className="w-full flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xl font-bold">Traveling to {LANDMARKS[state.location + 1]?.name || 'Oregon'}</p>
          <p className="text-sm opacity-70">{state.date.toDateString()}</p>
        </div>
        <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black" onClick={() => setIsPaused(true)}>
          Stop
        </Button>
      </div>

      {/* Retro Animation of Wagon */}
      <div className="flex-1 w-full flex items-center justify-center relative overflow-hidden bg-black/50 rounded border border-green-500/30 my-4">
        <motion.div 
          animate={{ x: [0, 500] }}
          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
          className="absolute text-4xl"
        >
          🚜
        </motion.div>
        <div className="absolute bottom-4 left-0 right-0 h-0.5 bg-green-500/50" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        <StatCard icon={<Compass className="w-4 h-4"/>} label="Miles" value={state.milesTraveled} />
        <StatCard icon={<ShoppingCart className="w-4 h-4"/>} label="Food" value={`${state.supplies.food} lbs`} />
        <StatCard icon={<AlertCircle className="w-4 h-4"/>} label="Health" value={state.members.filter(m => m.status === 'Healthy').length} />
        <StatCard icon={<Info className="w-4 h-4"/>} label="Pace" value={state.pace} />
      </div>
    </div>
  );

  const renderEvent = () => (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="p-8 bg-black/95 border-4 border-amber-500 rounded-lg text-amber-500 font-mono text-center shadow-[0_0_30px_rgba(245,158,11,0.2)]"
    >
      <AlertCircle className="w-12 h-12 mx-auto mb-4" />
      <h3 className="text-2xl font-bold mb-4 italic">Event on the Trail</h3>
      <p className="text-xl mb-6">{state.currentEvent}</p>
      <Button variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black" onClick={continueJourney}>
        Continue
      </Button>
    </motion.div>
  );

  const renderGameOver = () => (
    <div className="p-12 bg-black border-4 border-red-600 rounded-lg text-red-600 font-mono text-center space-y-6">
      <Skull className="w-16 h-16 mx-auto animate-pulse" />
      <h2 className="text-4xl font-black tracking-widest uppercase">You have died of dysentery</h2>
      <p className="text-xl opacity-80">Your journey ends {2000 - state.milesTraveled} miles from Oregon.</p>
      <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-black" onClick={() => window.location.reload()}>
        Try Again
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-4">
      <div className="max-w-4xl w-full">
        <AnimatePresence mode="wait">
          {state.status === 'Landmark' && renderLandmark()}
          {state.status === 'Travel' && renderTravel()}
          {state.status === 'Event' && renderEvent()}
          {state.status === 'GameOver' && renderGameOver()}
          {state.status === 'Victory' && (
            <div className="p-12 bg-black border-4 border-yellow-500 rounded-lg text-yellow-500 font-mono text-center space-y-6">
              <Trophy className="w-16 h-16 mx-auto text-yellow-500" />
              <h2 className="text-4xl font-black uppercase">You Made it to Oregon!</h2>
              <p className="text-xl">A new life awaits you in the Willamette Valley.</p>
              <Button onClick={() => window.location.reload()}>New Journey</Button>
            </div>
          )}
        </AnimatePresence>

        {/* Global Supplies Preview (Mini) */}
        {state.status !== 'GameOver' && state.status !== 'Victory' && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-6 gap-2 opacity-60">
            <SupplyMini label="Oxen" val={state.supplies.oxen} />
            <SupplyMini label="Ammo" val={state.supplies.ammunition} />
            <SupplyMini label="Clothes" val={state.supplies.clothing} />
            <SupplyMini label="Parts" val={state.supplies.spareParts} />
            <SupplyMini label="Money" val={`$${state.supplies.money}`} />
            <SupplyMini label="Food" val={`${state.supplies.food}lb`} />
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number }> = ({ icon, label, value }) => (
  <div className="p-3 border border-green-500/30 rounded bg-green-500/5">
    <div className="flex items-center gap-2 mb-1 opacity-70">
      {icon}
      <span className="text-[10px] uppercase tracking-wider">{label}</span>
    </div>
    <span className="text-lg font-bold">{value}</span>
  </div>
);

const SupplyMini: React.FC<{ label: string, val: string | number }> = ({ label, val }) => (
  <div className="text-[10px] font-mono border border-white/10 p-1 px-2 rounded flex justify-between">
    <span className="opacity-50">{label}:</span>
    <span>{val}</span>
  </div>
);

export default OregonTrail;
