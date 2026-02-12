// ============================================================================
// Pokemon RPG - Start Screen (New Game / Continue)
// ============================================================================

import { useState } from 'react';
import type { GameVersion } from '../engine/types';
import { hasSave } from '../engine/save-manager';

interface StartScreenProps {
  version: GameVersion;
  onNewGame: (playerName: string, rivalName: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function StartScreen({ version, onNewGame, onContinue, onBack }: StartScreenProps) {
  const [screen, setScreen] = useState<'main' | 'new_game'>('main');
  const [playerName, setPlayerName] = useState('RED');
  const [rivalName, setRivalName] = useState('BLUE');
  const canContinue = hasSave(version);

  const versionTitles: Record<GameVersion, string> = {
    'red-blue': 'POKeMON RED',
    'gold-silver': 'POKeMON GOLD',
    'ruby-sapphire': 'POKeMON RUBY',
  };

  if (screen === 'new_game') {
    return (
      <div className="absolute inset-0 z-40 bg-black flex flex-col items-center justify-center gap-4 p-4">
        <h2 className="font-mono text-white text-lg font-bold">NEW GAME</h2>

        <div className="w-full max-w-[200px]">
          <label className="font-mono text-white/60 text-xs block mb-1">Your name:</label>
          <input
            type="text"
            value={playerName}
            onChange={e => setPlayerName(e.target.value.toUpperCase().slice(0, 7))}
            className="w-full bg-[#f8f0d0] text-black font-mono text-sm px-3 py-2 rounded border-2 border-[#404040]"
            maxLength={7}
          />
        </div>

        <div className="w-full max-w-[200px]">
          <label className="font-mono text-white/60 text-xs block mb-1">Rival's name:</label>
          <input
            type="text"
            value={rivalName}
            onChange={e => setRivalName(e.target.value.toUpperCase().slice(0, 7))}
            className="w-full bg-[#f8f0d0] text-black font-mono text-sm px-3 py-2 rounded border-2 border-[#404040]"
            maxLength={7}
          />
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => onNewGame(playerName || 'RED', rivalName || 'BLUE')}
            className="px-6 py-2 bg-green-600 text-white font-mono text-sm font-bold rounded hover:bg-green-500"
          >
            START
          </button>
          <button
            onClick={() => setScreen('main')}
            className="px-6 py-2 bg-neutral-600 text-white font-mono text-sm font-bold rounded hover:bg-neutral-500"
          >
            BACK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-40 bg-black flex flex-col items-center justify-center gap-6">
      {/* Title */}
      <div className="text-center">
        <h1 className="font-mono text-white text-2xl font-bold tracking-wider">
          {versionTitles[version]}
        </h1>
        <p className="font-mono text-neutral-500 text-xs mt-2">
          Press START
        </p>
      </div>

      {/* Menu */}
      <div className="flex flex-col gap-3 w-48">
        {canContinue && (
          <button
            onClick={onContinue}
            className="w-full px-4 py-3 bg-[#4080c0] text-white font-mono text-sm font-bold rounded hover:bg-[#5090d0] transition-colors"
          >
            CONTINUE
          </button>
        )}
        <button
          onClick={() => setScreen('new_game')}
          className="w-full px-4 py-3 bg-[#e04040] text-white font-mono text-sm font-bold rounded hover:bg-[#c03030] transition-colors"
        >
          NEW GAME
        </button>
        <button
          onClick={onBack}
          className="w-full px-4 py-3 bg-neutral-700 text-white font-mono text-sm font-bold rounded hover:bg-neutral-600 transition-colors"
        >
          BACK
        </button>
      </div>
    </div>
  );
}
