import { GitBranch, AlertTriangle, XCircle, Terminal } from "lucide-react"
import type { EditorSettings, CursorPosition } from "./editor-settings"
import { THEME_LABELS, type ThemeName } from "./editor-settings"

interface TechieStatusBarProps {
  currentFile: string
  lineCount?: number
  terminalOpen?: boolean
  onToggleTerminal?: () => void
  cursorPosition?: CursorPosition
  language?: string
  editorSettings?: EditorSettings
  onUpdateSettings?: (partial: Partial<EditorSettings>) => void
}

const TAB_SIZES: (2 | 4 | 8)[] = [2, 4, 8]

const THEME_CYCLE: ThemeName[] = ["vs-dark", "one-dark", "monokai", "github-dark", "solarized-dark", "dracula"]

export function TechieStatusBar({
  currentFile,
  lineCount,
  terminalOpen,
  onToggleTerminal,
  cursorPosition,
  language = "Plain Text",
  editorSettings,
  onUpdateSettings,
}: TechieStatusBarProps) {
  const cycleTabSize = () => {
    if (!editorSettings || !onUpdateSettings) return
    const currentIdx = TAB_SIZES.indexOf(editorSettings.tabSize)
    const nextIdx = (currentIdx + 1) % TAB_SIZES.length
    onUpdateSettings({ tabSize: TAB_SIZES[nextIdx] })
  }

  const cycleTheme = () => {
    if (!editorSettings || !onUpdateSettings) return
    const currentIdx = THEME_CYCLE.indexOf(editorSettings.theme)
    const nextIdx = (currentIdx + 1) % THEME_CYCLE.length
    onUpdateSettings({ theme: THEME_CYCLE[nextIdx] })
  }

  return (
    <div className="flex items-center justify-between px-3 py-1 bg-[#007acc] text-white text-xs font-mono select-none">
      <div className="flex items-center gap-4">
        {/* Git branch */}
        <div className="flex items-center gap-1">
          <GitBranch className="h-3 w-3" />
          <span>main</span>
        </div>

        {/* Errors / Warnings */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <XCircle className="h-3 w-3" />
            <span>0</span>
          </div>
          <div className="flex items-center gap-0.5">
            <AlertTriangle className="h-3 w-3" />
            <span>0</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Terminal toggle */}
        {onToggleTerminal && (
          <button
            onClick={onToggleTerminal}
            className={`flex items-center gap-1 hover:bg-white/10 px-1 py-0.5 transition-colors ${
              terminalOpen ? "bg-white/10" : ""
            }`}
          >
            <Terminal className="h-3 w-3" />
          </button>
        )}

        {/* Cursor position */}
        {cursorPosition && (
          <span>Ln {cursorPosition.line}, Col {cursorPosition.col}</span>
        )}
        {!cursorPosition && lineCount !== undefined && (
          <span>Ln {lineCount}, Col 1</span>
        )}

        {/* Tab size (clickable) */}
        {editorSettings && (
          <button
            onClick={cycleTabSize}
            className="hover:bg-white/10 px-1 py-0.5 transition-colors"
            title="Click to change tab size"
          >
            Spaces: {editorSettings.tabSize}
          </button>
        )}

        <span>UTF-8</span>
        <span>LF</span>

        {/* Language */}
        {currentFile && <span>{language}</span>}

        {/* Theme indicator (clickable) */}
        {editorSettings && (
          <button
            onClick={cycleTheme}
            className="hover:bg-white/10 px-1 py-0.5 transition-colors"
            title="Click to cycle themes"
          >
            {THEME_LABELS[editorSettings.theme]}
          </button>
        )}

        {/* Vim badge */}
        {editorSettings?.vimMode && (
          <span className="px-1.5 py-0.5 bg-[#388a34] text-white text-[10px] font-bold">
            VIM
          </span>
        )}
      </div>
    </div>
  )
}
