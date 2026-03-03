// ============================================================================
// Pokemon RPG - Dialog Box Component
// ============================================================================

interface DialogBoxProps {
  text: string;
  showContinue: boolean;
  onAdvance: () => void;
}

export default function DialogBox({ text, showContinue, onAdvance }: DialogBoxProps) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-30 cursor-pointer"
      onClick={onAdvance}
    >
      <div className="mx-2 mb-2 bg-[#f8f0d0] border-[3px] border-[#404040] rounded-lg p-3 min-h-[60px] flex flex-col justify-between">
        <p className="text-black font-mono text-sm leading-relaxed">{text}</p>
        {showContinue && (
          <div className="flex justify-end mt-1">
            <span className="text-black animate-bounce text-xs">
              &#9660;
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
