// ============================================================================
// Pokemon RPG — Bag Screen
// ============================================================================

import { useState } from 'react';
import type { BagItem, BagCategory } from '../engine/types';
import { getItemData, getItemsByCategory } from '../engine/inventory-system';

interface BagScreenProps {
  bag: BagItem[];
  onUse: (itemId: string) => void;
  onBack: () => void;
}

const CATEGORIES: { key: BagCategory; label: string; color: string }[] = [
  { key: 'items', label: 'ITEMS', color: 'bg-blue-600' },
  { key: 'medicine', label: 'MEDICINE', color: 'bg-green-600' },
  { key: 'pokeballs', label: 'POKe BALLS', color: 'bg-red-600' },
  { key: 'tms', label: 'TMs & HMs', color: 'bg-purple-600' },
  { key: 'berries', label: 'BERRIES', color: 'bg-orange-600' },
  { key: 'key_items', label: 'KEY ITEMS', color: 'bg-yellow-600' },
];

export default function BagScreen({ bag, onUse, onBack }: BagScreenProps) {
  const [category, setCategory] = useState<BagCategory>('items');
  const [selectedIdx, setSelectedIdx] = useState(0);

  const items = getItemsByCategory(bag, category);

  return (
    <div className="absolute inset-0 z-40 bg-[#f8f0d0] flex flex-col">
      {/* Category tabs */}
      <div className="flex border-b-2 border-[#c0b080]">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => { setCategory(cat.key); setSelectedIdx(0); }}
            className={`flex-1 px-1 py-2 text-[9px] font-mono font-bold transition-colors
              ${category === cat.key ? `${cat.color} text-white` : 'text-neutral-600 hover:bg-[#e8d8a0]'}
            `}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Item list */}
      <div className="flex-1 overflow-y-auto p-2">
        {items.length === 0 ? (
          <div className="text-center text-neutral-400 font-mono text-sm py-8">
            No items in this pocket.
          </div>
        ) : (
          items.map((item, i) => {
            const data = getItemData(item.itemId);
            return (
              <button
                key={item.itemId}
                onClick={() => setSelectedIdx(i)}
                onDoubleClick={() => onUse(item.itemId)}
                className={`w-full text-left px-3 py-2 rounded flex justify-between items-center transition-colors
                  ${i === selectedIdx ? 'bg-[#e8d8a0]' : 'hover:bg-[#f0e8c0]'}
                `}
              >
                <span className="font-mono text-sm text-black font-bold">
                  {data?.name ?? item.itemId}
                </span>
                <span className="font-mono text-xs text-neutral-500">
                  x{item.quantity}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Description box */}
      <div className="border-t-2 border-[#c0b080] p-3 min-h-[60px]">
        {items[selectedIdx] && (
          <p className="font-mono text-xs text-black">
            {getItemData(items[selectedIdx].itemId)?.description ?? ''}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 p-2 border-t-2 border-[#c0b080]">
        {items[selectedIdx] && (
          <button
            onClick={() => onUse(items[selectedIdx].itemId)}
            className="flex-1 px-4 py-2 bg-[#4080c0] text-white font-mono text-xs font-bold rounded hover:bg-[#5090d0]"
          >
            USE
          </button>
        )}
        <button
          onClick={onBack}
          className="px-4 py-2 bg-neutral-400 text-white font-mono text-xs font-bold rounded hover:bg-neutral-500"
        >
          BACK
        </button>
      </div>
    </div>
  );
}
