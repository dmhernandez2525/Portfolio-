// ============================================================================
// Pokemon RPG — Party Screen
// ============================================================================

import type { Pokemon } from '../engine/types';
import { COLORS, getNatureInfo } from '../engine/constants';

interface PartyScreenProps {
  party: Pokemon[];
  onSelect?: (index: number) => void;
  onBack: () => void;
  mode: 'view' | 'switch' | 'item';
}

export default function PartyScreen({ party, onSelect, onBack, mode }: PartyScreenProps) {
  return (
    <div className="absolute inset-0 z-40 bg-[#3068a8] flex flex-col p-2 gap-1">
      <div className="font-mono text-white text-sm font-bold mb-1">
        {mode === 'switch' ? 'Choose a POKeMON.' : mode === 'item' ? 'Use on which POKeMON?' : 'POKeMON'}
      </div>

      {party.map((poke, i) => {
        const hpRatio = poke.currentHp / poke.stats.hp;
        const hpColor = hpRatio > 0.5 ? COLORS.hpGreen : hpRatio > 0.2 ? COLORS.hpYellow : COLORS.hpRed;
        const isFainted = poke.currentHp <= 0;

        return (
          <button
            key={poke.uid}
            onClick={() => onSelect?.(i)}
            disabled={mode === 'switch' && isFainted}
            className={`flex items-center gap-3 p-2 rounded-lg transition-colors
              ${isFainted ? 'bg-red-900/40' : 'bg-[#4080c0] hover:bg-[#5090d0]'}
              ${mode === 'switch' && isFainted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {/* Pokemon sprite placeholder */}
            <div className="w-10 h-10 bg-[#3068a8] rounded-full flex items-center justify-center text-white font-mono text-xs font-bold">
              #{poke.speciesId}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="font-mono text-white text-xs font-bold truncate">
                  {poke.nickname ?? `#${poke.speciesId}`}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-white/50 text-[8px]">
                    {getNatureInfo(poke.nature).label}
                  </span>
                  <span className="font-mono text-white/70 text-[10px]">
                    Lv{poke.level}
                  </span>
                </div>
              </div>

              {/* Ability */}
              {poke.ability && (
                <span className="font-mono text-[8px] text-yellow-300/60">
                  {poke.ability.charAt(0).toUpperCase() + poke.ability.slice(1).replace(/_/g, ' ')}
                </span>
              )}

              {/* HP bar */}
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-[8px] text-white/60 font-bold">HP</span>
                <div className="flex-1 h-2 bg-[#204060] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${hpRatio * 100}%`, backgroundColor: hpColor }}
                  />
                </div>
                <span className="font-mono text-[10px] text-white/80 min-w-[60px] text-right">
                  {poke.currentHp}/{poke.stats.hp}
                </span>
              </div>
            </div>

            {/* Status */}
            {poke.status && (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold text-white bg-purple-600">
                {poke.status === 'bad_poison' ? 'PSN' : poke.status.slice(0, 3).toUpperCase()}
              </span>
            )}
          </button>
        );
      })}

      {/* Empty slots */}
      {Array.from({ length: 6 - party.length }).map((_, i) => (
        <div key={`empty-${i}`} className="h-[52px] rounded-lg border border-white/10" />
      ))}

      <button
        onClick={onBack}
        className="mt-auto font-mono text-white text-xs bg-[#204060] hover:bg-[#305070] rounded px-4 py-2 self-end"
      >
        BACK
      </button>
    </div>
  );
}
