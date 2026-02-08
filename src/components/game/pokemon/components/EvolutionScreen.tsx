// ============================================================================
// Pokemon RPG — Evolution Animation Screen
// ============================================================================

import { useState, useEffect } from 'react';

interface EvolutionScreenProps {
  fromSpeciesId: number;
  toSpeciesId: number;
  fromName: string;
  toName: string;
  onComplete: () => void;
}

export default function EvolutionScreen({
  fromSpeciesId, toSpeciesId, fromName, toName, onComplete,
}: EvolutionScreenProps) {
  const [phase, setPhase] = useState<'start' | 'evolving' | 'done'>('start');
  const [flashOpacity, setFlashOpacity] = useState(0);

  useEffect(() => {
    // Start phase
    const t1 = setTimeout(() => setPhase('evolving'), 2000);

    // Flash animation during evolution
    const t2 = setTimeout(() => {
      let count = 0;
      const interval = setInterval(() => {
        setFlashOpacity(o => o > 0.5 ? 0 : 1);
        count++;
        if (count >= 10) {
          clearInterval(interval);
          setFlashOpacity(0);
          setPhase('done');
        }
      }, 200);
      return () => clearInterval(interval);
    }, 2500);

    return () => { clearTimeout(t1); clearTimeout(t2); };
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
      </div>
    </div>
  );
}
