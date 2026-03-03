import { useState } from "react"
import type { EditorSettings, ThemeName } from "../editor-settings"
import { THEME_LABELS } from "../editor-settings"

interface SettingsDialogProps {
  settings: EditorSettings
  onUpdateSettings: (partial: Partial<EditorSettings>) => void
  onClose: () => void
}

interface SettingRowProps {
  label: string
  description: string
  children: React.ReactNode
}

function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-[#3c3c3c]">
      <div className="flex-1 min-w-0 mr-4">
        <div className="text-xs text-[#cccccc]">{label}</div>
        <div className="text-[10px] text-[#858585] mt-0.5">{description}</div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${
        checked ? "bg-[#007acc]" : "bg-[#3c3c3c]"
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full bg-white transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  )
}

const themeNames = Object.keys(THEME_LABELS) as ThemeName[]
const tabSizes: (2 | 4 | 8)[] = [2, 4, 8]

export function SettingsDialog({ settings, onUpdateSettings, onClose }: SettingsDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const query = searchQuery.toLowerCase()

  const allSettings: { label: string; description: string; render: () => React.ReactNode }[] = [
    {
      label: "Color Theme",
      description: "Specifies the color theme used in the editor",
      render: () => (
        <select
          value={settings.theme}
          onChange={(e) => onUpdateSettings({ theme: e.target.value as ThemeName })}
          className="bg-[#3c3c3c] border border-[#555555] text-[#cccccc] text-xs px-2 py-1 outline-none focus:border-[#007acc] font-mono"
        >
          {themeNames.map((name) => (
            <option key={name} value={name}>
              {THEME_LABELS[name]}
            </option>
          ))}
        </select>
      ),
    },
    {
      label: "Vim Mode",
      description: "Enable Vim keybindings in the editor",
      render: () => (
        <Toggle checked={settings.vimMode} onChange={(v) => onUpdateSettings({ vimMode: v })} />
      ),
    },
    {
      label: "Font Size",
      description: "Controls the font size in pixels (12-24)",
      render: () => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateSettings({ fontSize: Math.max(12, settings.fontSize - 1) })}
            className="w-6 h-6 flex items-center justify-center bg-[#3c3c3c] text-[#cccccc] hover:bg-[#505050] transition-colors text-xs"
          >
            -
          </button>
          <span className="text-xs text-[#cccccc] w-6 text-center font-mono">{settings.fontSize}</span>
          <button
            onClick={() => onUpdateSettings({ fontSize: Math.min(24, settings.fontSize + 1) })}
            className="w-6 h-6 flex items-center justify-center bg-[#3c3c3c] text-[#cccccc] hover:bg-[#505050] transition-colors text-xs"
          >
            +
          </button>
        </div>
      ),
    },
    {
      label: "Tab Size",
      description: "The number of spaces a tab is equal to",
      render: () => (
        <div className="flex gap-1">
          {tabSizes.map((size) => (
            <button
              key={size}
              onClick={() => onUpdateSettings({ tabSize: size })}
              className={`px-2 py-1 text-xs font-mono transition-colors ${
                settings.tabSize === size
                  ? "bg-[#007acc] text-white"
                  : "bg-[#3c3c3c] text-[#cccccc] hover:bg-[#505050]"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      ),
    },
    {
      label: "Word Wrap",
      description: "Controls how lines should wrap",
      render: () => (
        <Toggle checked={settings.wordWrap} onChange={(v) => onUpdateSettings({ wordWrap: v })} />
      ),
    },
    {
      label: "Minimap",
      description: "Controls whether the minimap is shown",
      render: () => (
        <Toggle checked={settings.minimap} onChange={(v) => onUpdateSettings({ minimap: v })} />
      ),
    },
    {
      label: "Line Numbers",
      description: "Controls the display of line numbers",
      render: () => (
        <Toggle checked={settings.lineNumbers} onChange={(v) => onUpdateSettings({ lineNumbers: v })} />
      ),
    },
    {
      label: "Bracket Pair Colorization",
      description: "Controls whether bracket pair colorization is enabled",
      render: () => (
        <Toggle
          checked={settings.bracketPairColors}
          onChange={(v) => onUpdateSettings({ bracketPairColors: v })}
        />
      ),
    },
  ]

  const filteredSettings = allSettings.filter(
    (s) => s.label.toLowerCase().includes(query) || s.description.toLowerCase().includes(query)
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-[550px] max-w-[90vw] max-h-[80vh] bg-[#252526] border border-[#454545] shadow-2xl flex flex-col font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#323233] border-b border-[#3c3c3c]">
          <span className="text-sm text-[#cccccc]">Settings</span>
          <button
            onClick={onClose}
            className="text-[#858585] hover:text-[#cccccc] text-xs px-2 py-0.5 hover:bg-[#3c3c3c] transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b border-[#3c3c3c]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search settings..."
            autoFocus
            className="w-full px-3 py-1.5 text-xs bg-[#3c3c3c] border border-[#3c3c3c] text-[#cccccc] placeholder-[#858585] outline-none focus:border-[#007acc] font-mono"
          />
        </div>

        {/* Settings list */}
        <div className="overflow-y-auto p-4 flex-1">
          <div className="text-[#569cd6] text-xs font-bold mb-3 uppercase tracking-wider">
            Editor
          </div>
          {filteredSettings.map((setting) => (
            <SettingRow key={setting.label} label={setting.label} description={setting.description}>
              {setting.render()}
            </SettingRow>
          ))}
          {filteredSettings.length === 0 && (
            <div className="text-center text-[#858585] text-xs py-8">
              No settings match "{searchQuery}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[#3c3c3c] text-[10px] text-[#858585] text-center">
          Press Escape to close | Settings are saved automatically
        </div>
      </div>
    </div>
  )
}
