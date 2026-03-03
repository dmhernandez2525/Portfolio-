// ============================================================================
// Pokemon RPG - Shop Screen (Buy/Sell)
// ============================================================================

import { useState } from 'react';
import type { BagItem, ItemData } from '../engine/types';
import { getItemData } from '../engine/inventory-system';

type ShopMode = 'menu' | 'buy' | 'sell';

interface ShopScreenProps {
  shopItems: string[];
  bag: BagItem[];
  money: number;
  onBuy: (itemId: string, quantity: number) => void;
  onSell: (itemId: string, quantity: number) => void;
  onBack: () => void;
}

export default function ShopScreen({ shopItems, bag, money, onBuy, onSell, onBack }: ShopScreenProps) {
  const [mode, setMode] = useState<ShopMode>('menu');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');

  if (mode === 'menu') {
    return (
      <div className="absolute inset-0 z-40 bg-[#f8f0d0] flex flex-col items-center justify-center gap-3 p-4">
        <div className="font-mono text-black text-sm font-bold mb-2">
          Welcome! How may I help you?
        </div>
        <button
          onClick={() => { setMode('buy'); setSelectedIdx(0); setQuantity(1); setMessage(''); }}
          className="w-40 px-4 py-3 bg-[#4080c0] text-white font-mono text-sm font-bold rounded hover:bg-[#5090d0]"
        >
          BUY
        </button>
        <button
          onClick={() => { setMode('sell'); setSelectedIdx(0); setQuantity(1); setMessage(''); }}
          className="w-40 px-4 py-3 bg-[#40a060] text-white font-mono text-sm font-bold rounded hover:bg-[#50b070]"
        >
          SELL
        </button>
        <button
          onClick={onBack}
          className="w-40 px-4 py-3 bg-neutral-400 text-white font-mono text-sm font-bold rounded hover:bg-neutral-500"
        >
          SEE YA!
        </button>
        <div className="font-mono text-xs text-neutral-600 mt-2">${money}</div>
      </div>
    );
  }

  const isBuy = mode === 'buy';
  const items: { id: string; data: ItemData; qty?: number }[] = isBuy
    ? shopItems.map(id => ({ id, data: getItemData(id)! })).filter(i => i.data)
    : bag.map(b => ({ id: b.itemId, data: getItemData(b.itemId)!, qty: b.quantity }))
        .filter(i => i.data && !i.data.isKeyItem);

  const selected = items[selectedIdx];
  const price = selected ? (isBuy ? selected.data.price : Math.floor(selected.data.price / 2)) : 0;
  const totalCost = price * quantity;
  const maxBuyQty = selected ? Math.max(1, Math.floor(money / selected.data.price)) : 1;
  const maxQty = isBuy ? Math.min(99, maxBuyQty) : (selected?.qty ?? 1);

  const handleConfirm = () => {
    if (!selected) return;

    if (isBuy) {
      if (totalCost > money) {
        setMessage("You don't have enough money.");
        return;
      }
      onBuy(selected.id, quantity);
      setMessage(`Bought ${quantity} ${selected.data.name}!`);
    } else {
      onSell(selected.id, quantity);
      setMessage(`Sold ${quantity} ${selected.data.name}!`);
    }
    setQuantity(1);
  };

  return (
    <div className="absolute inset-0 z-40 bg-[#f8f0d0] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b-2 border-[#c0b080]">
        <span className="font-mono text-black text-sm font-bold">{isBuy ? 'BUY' : 'SELL'}</span>
        <span className="font-mono text-xs text-neutral-600">${money}</span>
      </div>

      {/* Item list */}
      <div className="flex-1 overflow-y-auto p-2">
        {items.length === 0 ? (
          <div className="text-center text-neutral-400 font-mono text-sm py-8">
            {isBuy ? 'Nothing for sale.' : 'Nothing to sell.'}
          </div>
        ) : (
          items.map((item, i) => (
            <button
              key={item.id}
              onClick={() => { setSelectedIdx(i); setQuantity(1); setMessage(''); }}
              className={`w-full text-left px-3 py-2 rounded flex justify-between items-center transition-colors
                ${i === selectedIdx ? 'bg-[#e8d8a0]' : 'hover:bg-[#f0e8c0]'}
              `}
            >
              <span className="font-mono text-sm text-black font-bold">
                {item.data.name}
              </span>
              <span className="font-mono text-xs text-neutral-500">
                ${isBuy ? item.data.price : Math.floor(item.data.price / 2)}
                {!isBuy && item.qty !== undefined && ` x${item.qty}`}
              </span>
            </button>
          ))
        )}
      </div>

      {/* Description + quantity */}
      <div className="border-t-2 border-[#c0b080] p-3">
        {selected && (
          <>
            <p className="font-mono text-xs text-black mb-2">{selected.data.description}</p>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-neutral-600">Qty:</span>
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-7 h-7 bg-[#c0b080] text-black font-mono font-bold rounded hover:bg-[#d0c090]"
              >-</button>
              <span className="font-mono text-sm text-black font-bold w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                className="w-7 h-7 bg-[#c0b080] text-black font-mono font-bold rounded hover:bg-[#d0c090]"
              >+</button>
              <span className="font-mono text-xs text-neutral-600 ml-auto">
                Total: ${totalCost}
              </span>
            </div>
          </>
        )}
        {message && (
          <p className="font-mono text-xs text-green-700 mt-1">{message}</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 p-2 border-t-2 border-[#c0b080]">
        {selected && (
          <button
            onClick={handleConfirm}
            disabled={isBuy && totalCost > money}
            className="flex-1 px-4 py-2 bg-[#4080c0] text-white font-mono text-xs font-bold rounded hover:bg-[#5090d0] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isBuy ? 'BUY' : 'SELL'}
          </button>
        )}
        <button
          onClick={() => setMode('menu')}
          className="px-4 py-2 bg-neutral-400 text-white font-mono text-xs font-bold rounded hover:bg-neutral-500"
        >
          BACK
        </button>
      </div>
    </div>
  );
}
