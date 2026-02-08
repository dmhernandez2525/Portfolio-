// ============================================================================
// Pokemon RPG — PC Storage Screen
// ============================================================================

import { useState } from 'react';
import type { PCBox, Pokemon } from '../engine/types';
import { PC_BOX_SIZE } from '../engine/constants';

interface PCStorageScreenProps {
  boxes: PCBox[];
  party: Pokemon[];
  onDeposit: (partyIndex: number, boxIndex: number, slot: number) => void;
  onWithdraw: (boxIndex: number, slot: number) => void;
  onBack: () => void;
}

export default function PCStorageScreen({
  boxes, party, onDeposit, onWithdraw, onBack,
}: PCStorageScreenProps) {
  const [currentBox, setCurrentBox] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const box = boxes[currentBox];
  if (!box) return null;

  const prevBox = () => setCurrentBox(i => (i - 1 + boxes.length) % boxes.length);
  const nextBox = () => setCurrentBox(i => (i + 1) % boxes.length);

  return (
    <div className="absolute inset-0 z-40 bg-[#306098] flex flex-col">
      {/* Box navigation */}
      <div className="flex items-center justify-between p-2 border-b-2 border-[#204070]">
        <button onClick={prevBox} className="px-3 py-1 bg-[#204070] text-white font-mono text-sm rounded">
          &lt;
        </button>
        <span className="font-mono text-white font-bold">{box.name}</span>
        <button onClick={nextBox} className="px-3 py-1 bg-[#204070] text-white font-mono text-sm rounded">
          &gt;
        </button>
      </div>

      {/* Box grid */}
      <div className="flex-1 p-2 overflow-y-auto">
        <div className="grid grid-cols-6 gap-1">
          {Array.from({ length: PC_BOX_SIZE }).map((_, slot) => {
            const poke = box.pokemon[slot];
            return (
              <button
                key={slot}
                onClick={() => {
                  if (poke) {
                    setSelectedSlot(slot);
                  } else if (selectedSlot !== null) {
                    setSelectedSlot(null);
                  }
                }}
                className={`aspect-square rounded flex items-center justify-center text-[9px] font-mono font-bold transition-colors
                  ${poke ? 'bg-[#4080c0] text-white hover:bg-[#5090d0]' : 'bg-[#204070] text-white/20'}
                  ${selectedSlot === slot ? 'ring-2 ring-yellow-400' : ''}
                `}
              >
                {poke ? `#${poke.speciesId}` : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="p-2 border-t-2 border-[#204070] flex gap-2">
        {selectedSlot !== null && box.pokemon[selectedSlot] && (
          <button
            onClick={() => {
              onWithdraw(currentBox, selectedSlot);
              setSelectedSlot(null);
            }}
            className="flex-1 px-3 py-2 bg-green-600 text-white font-mono text-xs font-bold rounded hover:bg-green-500"
          >
            WITHDRAW
          </button>
        )}
        {party.length > 1 && (
          <button
            onClick={() => {
              const emptySlot = box.pokemon.findIndex(p => p === null);
              if (emptySlot >= 0 && party.length > 1) {
                onDeposit(party.length - 1, currentBox, emptySlot);
              }
            }}
            className="flex-1 px-3 py-2 bg-orange-600 text-white font-mono text-xs font-bold rounded hover:bg-orange-500"
          >
            DEPOSIT
          </button>
        )}
        <button
          onClick={onBack}
          className="px-4 py-2 bg-neutral-600 text-white font-mono text-xs font-bold rounded hover:bg-neutral-500"
        >
          BACK
        </button>
      </div>
    </div>
  );
}
