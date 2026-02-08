// ============================================================================
// Pokemon RPG — Main Entry Point
// ============================================================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { GameVersion } from './engine/types';
import GameSelector from './components/GameSelector';
import PokemonCanvas from './components/PokemonCanvas';

export function PokemonGame() {
  const [screen, setScreen] = useState<'select' | 'playing'>('select');
  const [_version, setVersion] = useState<GameVersion | null>(null);

  const handleSelect = (version: GameVersion) => {
    setVersion(version);
    setScreen('playing');
  };

  const handleBack = () => {
    setScreen('select');
    setVersion(null);
  };

  if (screen === 'select') {
    return (
      <GameSelector
        onSelect={handleSelect}
        onBack={() => window.history.back()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-2 sm:p-4 gap-4">
      <PokemonCanvas onBack={handleBack} />
      <Link
        to="/games"
        className="text-white/20 hover:text-white/60 text-xs transition-colors"
      >
        Back to Games Portal
      </Link>
    </div>
  );
}
