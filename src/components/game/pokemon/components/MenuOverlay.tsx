// ============================================================================
// Pokemon RPG — Menu Overlay (Start Menu)
// ============================================================================

interface MenuOverlayProps {
  onResume: () => void;
  onPokedex: () => void;
  onParty: () => void;
  onBag: () => void;
  onSave: () => void;
  onOption: () => void;
  playerName: string;
  badges: number;
  playTime: string;
}

const MENU_ITEMS = [
  { key: 'pokedex', label: 'POKeDEX' },
  { key: 'party', label: 'POKeMON' },
  { key: 'bag', label: 'BAG' },
  { key: 'save', label: 'SAVE' },
  { key: 'option', label: 'OPTION' },
  { key: 'close', label: 'CLOSE' },
] as const;

export default function MenuOverlay({
  onResume, onPokedex, onParty, onBag, onSave, onOption,
  playerName, badges, playTime,
}: MenuOverlayProps) {
  const handlers: Record<string, () => void> = {
    pokedex: onPokedex,
    party: onParty,
    bag: onBag,
    save: onSave,
    option: onOption,
    close: onResume,
  };

  return (
    <div className="absolute inset-0 z-40 flex">
      {/* Transparent left side — tap to close */}
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
          {MENU_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={handlers[item.key]}
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
