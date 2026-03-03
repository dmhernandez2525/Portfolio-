// ============================================================================
// Pokemon RPG - Menu Overlay (Start Menu)
// ============================================================================

import { isMuted, setMuted, playSFX } from '../engine/audio-manager';
import { useState } from 'react';

interface MenuOverlayProps {
  onResume: () => void;
  onPokedex: () => void;
  onParty: () => void;
  onBag: () => void;
  onSave: () => void;
  playerName: string;
  badges: number;
  playTime: string;
}

export default function MenuOverlay({
  onResume, onPokedex, onParty, onBag, onSave,
  playerName, badges, playTime,
}: MenuOverlayProps) {
  const [muted, setMutedState] = useState<boolean>(isMuted());

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) playSFX('select');
  };

  const menuItems = [
    { key: 'pokedex', label: 'POKeDEX', action: onPokedex },
    { key: 'party', label: 'POKeMON', action: onParty },
    { key: 'bag', label: 'BAG', action: onBag },
    { key: 'save', label: 'SAVE', action: onSave },
    { key: 'sound', label: muted ? 'SOUND: OFF' : 'SOUND: ON', action: toggleMute },
    { key: 'close', label: 'CLOSE', action: onResume },
  ];

  return (
    <div className="absolute inset-0 z-40 flex">
      {/* Transparent left side, tap to close */}
      <div className="flex-1" onClick={onResume} />

      {/* Menu panel */}
      <div className="w-44 bg-[#f8f0d0] border-l-[3px] border-[#404040] flex flex-col">
        {/* Player info */}
        <div className="p-3 border-b-2 border-[#c0b080]">
          <div className="font-mono text-xs text-black font-bold">{playerName}</div>
          <div className="font-mono text-[10px] text-neutral-600">
            Badges: {badges} | {playTime}
          </div>
        </div>

        {/* Menu items */}
        <div className="flex-1 p-2">
          {menuItems.map(item => (
            <button
              key={item.key}
              onClick={() => { playSFX('select'); item.action(); }}
              className="w-full text-left px-3 py-2 font-mono text-sm text-black hover:bg-[#e8d8a0] rounded transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
