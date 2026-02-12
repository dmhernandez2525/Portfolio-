// ============================================================================
// Pokemon RPG — Evolution Animation Screen
// ============================================================================

import { useState, useEffect, useRef } from 'react';

interface EvolutionScreenProps {
  fromSpeciesId: number;
  toSpeciesId: number;
  fromName: string;
  toName: string;
  onComplete: () => void;
  onCancel: () => void;
}

export default function EvolutionScreen({
  fromSpeciesId, toSpeciesId, fromName, toName, onComplete, onCancel,
}: EvolutionScreenProps) {
  const [phase, setPhase] = useState<'start' | 'evolving' | 'done' | 'cancelled'>('start');
  const [flashOpacity, setFlashOpacity] = useState(0);
  const cancelledRef = useRef(false);

  // B-button cancellation: listen for Escape or X key during start/evolving phases
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.key === 'Escape' || e.key === 'x' || e.key === 'X') && !cancelledRef.current && phase !== 'done') {
        cancelledRef.current = true;
        setPhase('cancelled');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase]);

  useEffect(() => {
    const t1 = setTimeout(() => {
      if (!cancelledRef.current) setPhase('evolving');
    }, 2000);

    let interval: ReturnType<typeof setInterval> | null = null;
    const t2 = setTimeout(() => {
      if (cancelledRef.current) return;
      let count = 0;
      interval = setInterval(() => {
        if (cancelledRef.current) {
          if (interval) clearInterval(interval);
          return;
        }
        setFlashOpacity(o => o > 0.5 ? 0 : 1);
        count++;
        if (count >= 10) {
          if (interval) clearInterval(interval);
          interval = null;
          setFlashOpacity(0);
          setPhase('done');
        }
      }, 200);
    }, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center gap-4">
      {/* Flash overlay */}
      <div
        className="absolute inset-0 bg-white pointer-events-none transition-opacity"
        style={{ opacity: flashOpacity }}
      />

      {/* Pokemon display */}
      <div className="relative z-10 w-24 h-24 rounded-full flex items-center justify-center text-white font-mono font-bold text-xl"
        style={{
          backgroundColor: phase === 'done' ? '#5090d0' : '#4080c0',
          transform: phase === 'evolving' ? 'scale(1.2)' : 'scale(1)',
          transition: 'transform 0.5s ease-in-out',
        }}
      >
        #{phase === 'done' ? toSpeciesId : fromSpeciesId}
      </div>

      {/* Text */}
      <div className="relative z-10 text-center">
        {phase === 'start' && (
          <p className="font-mono text-white text-sm">
            What? {fromName} is evolving!
          </p>
        )}
        {phase === 'evolving' && (
          <p className="font-mono text-white text-sm animate-pulse">
            ...
          </p>
        )}
        {phase === 'done' && (
          <>
            <p className="font-mono text-white text-sm mb-4">
              Congratulations! Your {fromName} evolved into {toName}!
            </p>
            <button
              onClick={onComplete}
              className="px-6 py-2 bg-green-600 text-white font-mono text-sm font-bold rounded hover:bg-green-500"
            >
              OK
            </button>
          </>
        )}
        {phase === 'cancelled' && (
          <>
            <p className="font-mono text-white text-sm mb-4">
              {fromName} stopped evolving!
            </p>
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-yellow-600 text-white font-mono text-sm font-bold rounded hover:bg-yellow-500"
            >
              OK
            </button>
          </>
        )}
      </div>
    </div>
  );
}
