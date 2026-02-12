interface AboutDialogProps {
  onClose: () => void
}

export function AboutDialog({ onClose }: AboutDialogProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-[#f0f0f0] text-[#333] border border-[#999] shadow-xl w-[360px] font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-b from-[#e8e8e8] to-[#d0d0d0] border-b border-[#999]">
          <span className="text-xs font-semibold">About DH OS</span>
          <button
            onClick={onClose}
            className="w-4 h-4 flex items-center justify-center text-[#666] hover:text-[#000] text-lg leading-none"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center py-8 px-6">
          <div className="text-4xl mb-4">&#x2699;&#xFE0F;</div>
          <h2 className="text-lg font-bold mb-1">DH OS v1.0.0</h2>
          <p className="text-sm text-[#555] mb-1">Built with React, TypeScript, & Tailwind.</p>
          <p className="text-sm text-[#555] mb-6 italic">Runs on caffeine and curiosity.</p>

          <div className="text-xs text-[#888] mb-6 text-center space-y-0.5">
            <p>28+ projects shipped</p>
            <p>10+ years engineering</p>
            <p>16 easter eggs hidden</p>
          </div>

          <button
            onClick={onClose}
            className="px-8 py-1.5 bg-[#e74c3c] hover:bg-[#c0392b] text-white text-sm font-semibold rounded transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
