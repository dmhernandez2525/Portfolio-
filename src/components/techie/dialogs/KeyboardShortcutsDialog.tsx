interface KeyboardShortcutsDialogProps {
  onClose: () => void
}

interface ShortcutEntry {
  label: string
  keys: string
}

interface ShortcutSection {
  title: string
  shortcuts: ShortcutEntry[]
}

const sections: ShortcutSection[] = [
  {
    title: "General",
    shortcuts: [
      { label: "New File", keys: "\u2318N" },
      { label: "Close Tab", keys: "\u2318W" },
      { label: "Save", keys: "\u2318S" },
      { label: "Print", keys: "\u2318P" },
      { label: "Exit to Gateway", keys: "\u2318Q" },
    ],
  },
  {
    title: "View",
    shortcuts: [
      { label: "Toggle Sidebar", keys: "\u2318B" },
      { label: "Toggle Terminal", keys: "\u2318`" },
      { label: "Full Screen", keys: "F11" },
      { label: "Zen Mode", keys: "\u2318K Z" },
      { label: "Command Palette", keys: "\u2318P" },
    ],
  },
  {
    title: "Terminal",
    shortcuts: [
      { label: "Clear Terminal", keys: "Ctrl+L" },
      { label: "Cancel Command", keys: "Ctrl+C" },
      { label: "Previous Command", keys: "\u2191" },
      { label: "Next Command", keys: "\u2193" },
      { label: "Autocomplete", keys: "Tab" },
    ],
  },
  {
    title: "Navigation",
    shortcuts: [
      { label: "Go to File", keys: "\u2318P" },
      { label: "Close All Tabs", keys: "\u2318\u21E7W" },
    ],
  },
]

export function KeyboardShortcutsDialog({ onClose }: KeyboardShortcutsDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-[500px] max-w-[90vw] max-h-[80vh] bg-[#252526] border border-[#454545] shadow-2xl flex flex-col font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#323233] border-b border-[#3c3c3c]">
          <span className="text-sm text-[#cccccc]">Keyboard Shortcuts</span>
          <button
            onClick={onClose}
            className="text-[#858585] hover:text-[#cccccc] text-xs px-2 py-0.5 hover:bg-[#3c3c3c] transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 space-y-4">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="text-[#569cd6] text-xs font-bold mb-2 uppercase tracking-wider">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.label}
                    className="flex items-center justify-between py-1 text-xs"
                  >
                    <span className="text-[#cccccc]">{shortcut.label}</span>
                    <kbd className="px-2 py-0.5 bg-[#1a1a1a] border border-[#3c3c3c] text-[#d7ba7d] text-[10px] min-w-[60px] text-center">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[#3c3c3c] text-[10px] text-[#858585] text-center">
          Press Escape to close
        </div>
      </div>
    </div>
  )
}
