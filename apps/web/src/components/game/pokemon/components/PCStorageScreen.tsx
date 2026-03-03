// ============================================================================
// Pokemon RPG - PC Storage Screen
// ============================================================================

import { useState } from 'react';
import type { PCBox, Pokemon } from '../engine/types';
import { PC_BOX_SIZE } from '../engine/constants';
import { getSpeciesName } from '../engine/evolution-system';

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
  const [depositPartyIdx, setDepositPartyIdx] = useState<number | null>(null);

  const box = boxes[currentBox];
  if (!box) return null;

  const prevBox = () => { setCurrentBox(i => (i - 1 + boxes.length) % boxes.length); setSelectedSlot(null); };
  const nextBox = () => { setCurrentBox(i => (i + 1) % boxes.length); setSelectedSlot(null); };

  // Party member selection for deposit
  if (depositPartyIdx !== null) {
    return (
      <div className="absolute inset-0 z-40 bg-[#306098] flex flex-col">
        <div className="p-2 border-b-2 border-[#204070]">
          <span className="font-mono text-white font-bold text-sm">Choose a Pokemon to deposit:</span>
        </div>
        <div className="flex-1 p-2 overflow-y-auto flex flex-col gap-1">
          {party.map((pkmn, idx) => (
            <button
              key={pkmn.uid}
              disabled={party.length <= 1}
              onClick={() => {
                const emptySlot = box.pokemon.findIndex(p => p === null);
                if (emptySlot >= 0 && party.length > 1) {
                  onDeposit(idx, currentBox, emptySlot);
                }
                setDepositPartyIdx(null);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded font-mono text-xs text-white transition-colors
                ${party.length <= 1 ? 'bg-[#204070] opacity-40' : 'bg-[#4080c0] hover:bg-[#5090d0]'}
              `}
            >
              <span className="font-bold">#{pkmn.speciesId}</span>
              <span>{pkmn.nickname ?? getSpeciesName(pkmn.speciesId)}</span>
              <span className="ml-auto text-white/60">Lv.{pkmn.level} HP:{pkmn.currentHp}/{pkmn.stats.hp}</span>
            </button>
          ))}
        </div>
        <div className="p-2 border-t-2 border-[#204070]">
          <button
            onClick={() => setDepositPartyIdx(null)}
            className="w-full px-4 py-2 bg-neutral-600 text-white font-mono text-xs font-bold rounded hover:bg-neutral-500"
          >
            CANCEL
          </button>
        </div>
      </div>
    );
  }

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
                    setSelectedSlot(selectedSlot === slot ? null : slot);
                  } else {
                    setSelectedSlot(null);
                  }
                }}
                className={`aspect-square rounded flex flex-col items-center justify-center text-[8px] font-mono font-bold transition-colors
                  ${poke ? 'bg-[#4080c0] text-white hover:bg-[#5090d0]' : 'bg-[#204070] text-white/20'}
                  ${selectedSlot === slot ? 'ring-2 ring-yellow-400' : ''}
                `}
              >
                {poke && (
                  <>
                    <span>#{poke.speciesId}</span>
                    <span className="text-[7px] opacity-70">L{poke.level}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Pokemon details */}
        {selectedSlot !== null && box.pokemon[selectedSlot] && (
          <div className="mt-2 p-2 bg-[#204070] rounded font-mono text-white text-xs">
            {(() => {
              const p = box.pokemon[selectedSlot]!;
              return (
                <>
                  <div className="font-bold">{p.nickname ?? getSpeciesName(p.speciesId)} Lv.{p.level}</div>
                  <div className="text-white/60">HP: {p.currentHp}/{p.stats.hp} | {p.status ?? 'Healthy'}</div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-2 border-t-2 border-[#204070] flex gap-2">
        {selectedSlot !== null && box.pokemon[selectedSlot] && (
          <button
            onClick={() => {
              if (party.length >= 6) return;
              onWithdraw(currentBox, selectedSlot);
              setSelectedSlot(null);
            }}
            disabled={party.length >= 6}
            className={`flex-1 px-3 py-2 font-mono text-xs font-bold rounded
              ${party.length >= 6 ? 'bg-green-900 text-white/40' : 'bg-green-600 text-white hover:bg-green-500'}
            `}
          >
            WITHDRAW{party.length >= 6 ? ' (FULL)' : ''}
          </button>
        )}
        {party.length > 1 && (
          <button
            onClick={() => setDepositPartyIdx(0)}
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

      {/* Party summary at bottom */}
      <div className="px-2 pb-2 flex gap-1">
        {party.map(p => (
          <div key={p.uid} className="flex-1 bg-[#204070] rounded px-1 py-0.5 text-center font-mono text-[7px] text-white/70">
            #{p.speciesId} L{p.level}
          </div>
        ))}
      </div>
    </div>
  );
}
