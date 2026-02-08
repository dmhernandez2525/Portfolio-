// ============================================================================
// Pokemon RPG — Game Selector Screen
// ============================================================================

import type { GameVersion } from '../engine/types';

interface GameSelectorProps {
  onSelect: (version: GameVersion) => void;
  onBack: () => void;
}

const GAMES: { version: GameVersion; title: string; region: string; color: string; available: boolean }[] = [
  { version: 'red-blue', title: 'Red / Blue', region: 'Kanto', color: 'from-red-600 to-blue-600', available: true },
  { version: 'gold-silver', title: 'Gold / Silver', region: 'Johto', color: 'from-yellow-500 to-gray-400', available: true },
  { version: 'ruby-sapphire', title: 'Ruby / Sapphire', region: 'Hoenn', color: 'from-red-700 to-blue-500', available: true },
];

export default function GameSelector({ onSelect, onBack }: GameSelectorProps) {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 gap-6">
      {/* Title */}
      <div className="text-center mb-4">
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter">
          POKeMON
        </h1>
        <p className="text-neutral-400 mt-2">Choose your adventure</p>
      </div>

      {/* Game cards */}
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {GAMES.map(game => (
          <button
            key={game.version}
            onClick={() => game.available && onSelect(game.version)}
            disabled={!game.available}
            className={`relative overflow-hidden rounded-xl p-6 text-left transition-all
              ${game.available
                ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
                : 'cursor-not-allowed opacity-40'
              }`}
          >
            {/* Gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-r ${game.color} opacity-80`} />

            {/* Content */}
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-white">{game.title}</h2>
              <p className="text-white/70 text-sm">{game.region} Region</p>
              {!game.available && (
                <span className="inline-block mt-2 px-2 py-0.5 bg-black/40 rounded text-[10px] text-white/60 font-bold uppercase">
                  Coming Soon
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Back link */}
      <button
        onClick={onBack}
        className="text-neutral-500 hover:text-white text-sm transition-colors mt-4"
      >
        Back to Games Portal
      </button>
    </div>
  );
}
