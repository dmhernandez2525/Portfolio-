import { useState } from "react"
import type { EditorSettings, ThemeName } from "./editor-settings"

interface ExtensionItem {
  id: string
  name: string
  publisher: string
  description: string
  icon: string
  getSetting: (s: EditorSettings) => boolean
  toggle: (s: EditorSettings) => Partial<EditorSettings>
}

const extensions: ExtensionItem[] = [
  {
    id: "vim",
    name: "Vim",
    publisher: "vscodevim",
    description: "Vim emulation — real keybindings in the editor",
    icon: "\u{1F4DD}",
    getSetting: (s) => s.vimMode,
    toggle: (s) => ({ vimMode: !s.vimMode }),
  },
  {
    id: "bracket-pair",
    name: "Bracket Pair Colorizer",
    publisher: "CoenraadS",
    description: "Rainbow bracket matching and highlighting",
    icon: "\u{1F308}",
    getSetting: (s) => s.bracketPairColors,
    toggle: (s) => ({ bracketPairColors: !s.bracketPairColors }),
  },
  {
    id: "minimap",
    name: "Minimap",
    publisher: "Microsoft",
    description: "Code overview in the scrollbar area",
    icon: "\u{1F5FA}",
    getSetting: (s) => s.minimap,
    toggle: (s) => ({ minimap: !s.minimap }),
  },
  {
    id: "word-wrap",
    name: "Word Wrap",
    publisher: "Microsoft",
    description: "Toggle automatic word wrapping",
    icon: "\u{21A9}",
    getSetting: (s) => s.wordWrap,
    toggle: (s) => ({ wordWrap: !s.wordWrap }),
  },
  {
    id: "line-numbers",
    name: "Line Numbers",
    publisher: "Microsoft",
    description: "Show or hide line numbers in the gutter",
    icon: "\u{1F522}",
    getSetting: (s) => s.lineNumbers,
    toggle: (s) => ({ lineNumbers: !s.lineNumbers }),
  },
]

interface ThemeExtension {
  id: ThemeName
  name: string
  publisher: string
  description: string
  icon: string
}

const themeExtensions: ThemeExtension[] = [
  {
    id: "vs-dark",
    name: "VS Code Dark+",
    publisher: "Microsoft",
    description: "The default VS Code dark color theme",
    icon: "\u{1F535}",
  },
  {
    id: "one-dark",
    name: "One Dark Pro",
    publisher: "binaryify",
    description: "Atom's iconic One Dark theme for VS Code",
    icon: "\u{1F7E3}",
  },
  {
    id: "monokai",
    name: "Monokai Pro",
    publisher: "monokai",
    description: "Classic Monokai color scheme",
    icon: "\u{1F7E0}",
  },
  {
    id: "github-dark",
    name: "GitHub Dark",
    publisher: "GitHub",
    description: "GitHub's official dark theme",
    icon: "\u26AB",
  },
  {
    id: "solarized-dark",
    name: "Solarized Dark",
    publisher: "ryanolsonx",
    description: "Ethan Schoonover's precision color scheme",
    icon: "\u{1F7E4}",
  },
  {
    id: "dracula",
    name: "Dracula Official",
    publisher: "dracula-theme",
    description: "A dark theme for many editors",
    icon: "\u{1F7E2}",
  },
]

interface ExtensionsPanelProps {
  settings: EditorSettings
  onUpdateSettings: (partial: Partial<EditorSettings>) => void
}

export function ExtensionsPanel({ settings, onUpdateSettings }: ExtensionsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const query = searchQuery.toLowerCase()

  const filteredExtensions = extensions.filter(
    (ext) => ext.name.toLowerCase().includes(query) || ext.description.toLowerCase().includes(query)
  )
  const filteredThemes = themeExtensions.filter(
    (ext) => ext.name.toLowerCase().includes(query) || ext.description.toLowerCase().includes(query)
  )

  return (
    <div className="h-full bg-[#252526] border-r border-[#3c3c3c] overflow-y-auto flex flex-col">
      <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#bbbbbb]">
        Extensions
      </div>

      {/* Search */}
      <div className="px-2 pb-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search extensions..."
          className="w-full px-2 py-1 text-xs bg-[#3c3c3c] border border-[#3c3c3c] text-[#cccccc] placeholder-[#858585] outline-none focus:border-[#007acc] font-mono"
        />
      </div>

      {/* Feature Extensions */}
      {filteredExtensions.length > 0 && (
        <div className="px-2 pb-2">
          <div className="text-[9px] uppercase tracking-wider text-[#858585] px-1 pb-1">Features</div>
          {filteredExtensions.map((ext) => {
            const enabled = ext.getSetting(settings)
            return (
              <button
                key={ext.id}
                onClick={() => onUpdateSettings(ext.toggle(settings))}
                className="w-full flex items-start gap-2 p-2 hover:bg-[#2a2d2e] transition-colors text-left group"
              >
                <span className="text-sm mt-0.5 shrink-0">{ext.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#cccccc] truncate">{ext.name}</span>
                    <div
                      className={`w-7 h-3.5 rounded-full flex items-center px-0.5 transition-colors shrink-0 ${
                        enabled ? "bg-[#007acc]" : "bg-[#3c3c3c]"
                      }`}
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full bg-white transition-transform ${
                          enabled ? "translate-x-3" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                  <div className="text-[10px] text-[#858585] truncate">{ext.publisher}</div>
                  <div className="text-[10px] text-[#6a6a6a] mt-0.5 line-clamp-2">{ext.description}</div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Theme Extensions */}
      {filteredThemes.length > 0 && (
        <div className="px-2 pb-2">
          <div className="text-[9px] uppercase tracking-wider text-[#858585] px-1 pb-1">Color Themes</div>
          {filteredThemes.map((ext) => {
            const isActive = settings.theme === ext.id
            return (
              <button
                key={ext.id}
                onClick={() => onUpdateSettings({ theme: ext.id })}
                className={`w-full flex items-start gap-2 p-2 transition-colors text-left ${
                  isActive ? "bg-[#094771]" : "hover:bg-[#2a2d2e]"
                }`}
              >
                <span className="text-sm mt-0.5 shrink-0">{ext.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#cccccc] truncate">{ext.name}</span>
                    {isActive && (
                      <span className="text-[9px] px-1 py-0.5 bg-[#007acc] text-white shrink-0">Active</span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#858585] truncate">{ext.publisher}</div>
                  <div className="text-[10px] text-[#6a6a6a] mt-0.5 line-clamp-2">{ext.description}</div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Install count Easter egg */}
      <div className="mt-auto px-3 py-2 text-[9px] text-[#555555] border-t border-[#3c3c3c]">
        {extensions.length + themeExtensions.length} extensions installed
      </div>
    </div>
  )
}
