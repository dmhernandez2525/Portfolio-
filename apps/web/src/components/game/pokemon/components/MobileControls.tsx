// ============================================================================
// Pokemon RPG - Mobile Touch Controls (D-pad + A/B buttons)
// ============================================================================

import type { InputState } from '../engine/types';

interface MobileControlsProps {
  input: {
    setButton: (button: keyof InputState, pressed: boolean) => void;
  };
}

function DPadButton({
  direction,
  label,
  input,
  className = '',
}: {
  direction: keyof InputState;
  label: string;
  input: MobileControlsProps['input'];
  className?: string;
}) {
  return (
    <button
      className={`w-12 h-12 bg-neutral-800 active:bg-neutral-600 rounded-lg flex items-center justify-center text-white font-bold select-none touch-none ${className}`}
      onTouchStart={(e) => { e.preventDefault(); input.setButton(direction, true); }}
      onTouchEnd={(e) => { e.preventDefault(); input.setButton(direction, false); }}
      onMouseDown={() => input.setButton(direction, true)}
      onMouseUp={() => input.setButton(direction, false)}
      onMouseLeave={() => input.setButton(direction, false)}
    >
      {label}
    </button>
  );
}

export default function MobileControls({ input }: MobileControlsProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-[480px] md:hidden px-4 py-2">
      {/* D-Pad */}
      <div className="grid grid-cols-3 gap-1">
        <div />
        <DPadButton direction="up" label="^" input={input} />
        <div />
        <DPadButton direction="left" label="<" input={input} />
        <div className="w-12 h-12 bg-neutral-900 rounded-lg" />
        <DPadButton direction="right" label=">" input={input} />
        <div />
        <DPadButton direction="down" label="v" input={input} />
        <div />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 items-center">
        <button
          className="w-14 h-14 bg-red-700 active:bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg select-none touch-none"
          onTouchStart={(e) => { e.preventDefault(); input.setButton('b', true); }}
          onTouchEnd={(e) => { e.preventDefault(); input.setButton('b', false); }}
          onMouseDown={() => input.setButton('b', true)}
          onMouseUp={() => input.setButton('b', false)}
          onMouseLeave={() => input.setButton('b', false)}
        >
          B
        </button>
        <button
          className="w-14 h-14 bg-green-700 active:bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg select-none touch-none"
          onTouchStart={(e) => { e.preventDefault(); input.setButton('a', true); }}
          onTouchEnd={(e) => { e.preventDefault(); input.setButton('a', false); }}
          onMouseDown={() => input.setButton('a', true)}
          onMouseUp={() => input.setButton('a', false)}
          onMouseLeave={() => input.setButton('a', false)}
        >
          A
        </button>
      </div>

      {/* Start/Select */}
      <div className="flex flex-col gap-1">
        <button
          className="px-3 py-1 bg-neutral-700 active:bg-neutral-500 rounded text-[10px] text-white font-bold select-none touch-none"
          onTouchStart={(e) => { e.preventDefault(); input.setButton('start', true); }}
          onTouchEnd={(e) => { e.preventDefault(); input.setButton('start', false); }}
          onMouseDown={() => input.setButton('start', true)}
          onMouseUp={() => input.setButton('start', false)}
          onMouseLeave={() => input.setButton('start', false)}
        >
          START
        </button>
        <button
          className="px-3 py-1 bg-neutral-700 active:bg-neutral-500 rounded text-[10px] text-white font-bold select-none touch-none"
          onTouchStart={(e) => { e.preventDefault(); input.setButton('select', true); }}
          onTouchEnd={(e) => { e.preventDefault(); input.setButton('select', false); }}
          onMouseDown={() => input.setButton('select', true)}
          onMouseUp={() => input.setButton('select', false)}
          onMouseLeave={() => input.setButton('select', false)}
        >
          SELECT
        </button>
      </div>
    </div>
  );
}
