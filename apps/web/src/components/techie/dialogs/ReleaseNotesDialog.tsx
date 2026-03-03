interface ReleaseNotesDialogProps {
  onClose: () => void
}

interface ReleaseNote {
  version: string
  date: string
  highlights: string[]
}

const releaseNotes: ReleaseNote[] = [
  {
    version: "1.0.0",
    date: "2026-02-07",
    highlights: [
      "Initial release of DH OS",
      "Four viewing modes: Business Card, Resume, Creative, Techie",
      "Integrated terminal with 25+ commands",
      "6 built-in games: Snake, Tetris, Chess, Falling Blocks, Cookie Clicker, Agar",
      "Matrix rain easter egg (Help > Panic!)",
      "VS Code-inspired dark theme",
    ],
  },
  {
    version: "0.9.0",
    date: "2025-12-15",
    highlights: [
      "Added file explorer with tree navigation",
      "Tab system with drag-to-close",
      "Status bar with live git branch indicator",
      "Breadcrumb navigation",
    ],
  },
  {
    version: "0.5.0",
    date: "2025-10-01",
    highlights: [
      "Prototype: basic terminal emulator",
      "First game integration (Snake)",
      "Dark mode only (light mode is for quitters)",
    ],
  },
  {
    version: "0.1.0",
    date: "2025-08-15",
    highlights: [
      "Initial concept: what if a portfolio was an IDE?",
      "Learned that CSS grid is both a blessing and a curse",
      "Coffee consumption increased by 300%",
      "Bug count: yes",
    ],
  },
]

export function ReleaseNotesDialog({ onClose }: ReleaseNotesDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-[550px] max-w-[90vw] max-h-[80vh] bg-[#252526] border border-[#454545] shadow-2xl flex flex-col font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#323233] border-b border-[#3c3c3c]">
          <span className="text-sm text-[#cccccc]">Release Notes</span>
          <button
            onClick={onClose}
            className="text-[#858585] hover:text-[#cccccc] text-xs px-2 py-0.5 hover:bg-[#3c3c3c] transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 space-y-6">
          <div className="text-center">
            <div className="text-[#569cd6] text-lg font-bold">DH OS</div>
            <div className="text-[#858585] text-xs mt-1">Changelog & Release History</div>
          </div>

          {releaseNotes.map((note) => (
            <div key={note.version} className="border-l-2 border-[#3c3c3c] pl-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[#4ec9b0] text-sm font-bold">
                  v{note.version}
                </span>
                <span className="text-[#858585] text-[10px]">{note.date}</span>
                {note.version === "1.0.0" && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-[#608b4e]/20 text-[#608b4e] border border-[#608b4e]/30">
                    LATEST
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {note.highlights.map((highlight) => (
                  <div key={highlight} className="flex gap-2 text-xs">
                    <span className="text-[#608b4e] shrink-0">+</span>
                    <span className="text-[#d4d4d4]">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="text-center text-[10px] text-[#858585] pt-2 border-t border-[#3c3c3c]">
            Built with React, TypeScript, Tailwind, and an unreasonable amount of coffee.
          </div>
        </div>
      </div>
    </div>
  )
}
