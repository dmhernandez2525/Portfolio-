// ============================================================================
// Pokemon RPG — Pokedex Screen
// ============================================================================

import type { PokedexEntry } from '../engine/types';

interface PokedexScreenProps {
  pokedex: Record<number, PokedexEntry>;
  maxId: number;
  onBack: () => void;
}

export default function PokedexScreen({ pokedex, maxId, onBack }: PokedexScreenProps) {
  const entries = Array.from({ length: maxId }, (_, i) => {
    const id = i + 1;
    const entry = pokedex[id];
    return { id, seen: entry?.seen ?? false, caught: entry?.caught ?? false };
  });

  const seenCount = entries.filter(e => e.seen).length;
  const caughtCount = entries.filter(e => e.caught).length;

  return (
    <div className="absolute inset-0 z-40 bg-[#e04040] flex flex-col">
      {/* Header */}
      <div className="p-3 flex justify-between items-center border-b-2 border-[#c03030]">
        <h2 className="font-mono text-white font-bold">POKeDEX</h2>
        <div className="font-mono text-white/80 text-xs">
          Seen: {seenCount} | Caught: {caughtCount}
        </div>
      </div>

      {/* Pokemon list */}
      <div className="flex-1 overflow-y-auto bg-white/90 p-2">
        <div className="grid grid-cols-3 gap-1">
          {entries.map(entry => (
            <div
              key={entry.id}
              className={`px-2 py-1.5 rounded text-center font-mono text-xs
                ${entry.caught ? 'bg-[#e8d8a0] text-black' :
                  entry.seen ? 'bg-neutral-200 text-neutral-500' :
                  'bg-neutral-100 text-neutral-300'}
              `}
            >
              <div className="font-bold">
                {entry.caught ? '\u25CF' : entry.seen ? '\u25CB' : '-'}{' '}
                #{String(entry.id).padStart(3, '0')}
              </div>
              <div className="text-[9px] truncate">
                {entry.seen ? `Pokemon #${entry.id}` : '???'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onBack}
        className="m-2 px-4 py-2 bg-[#c03030] text-white font-mono text-xs font-bold rounded hover:bg-[#b02020]"
      >
        BACK
      </button>
    </div>
  );
}
