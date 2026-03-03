export type ThemeName = "vs-dark" | "one-dark" | "monokai" | "github-dark" | "solarized-dark" | "dracula"

export interface EditorSettings {
  theme: ThemeName
  vimMode: boolean
  fontSize: number
  tabSize: 2 | 4 | 8
  wordWrap: boolean
  minimap: boolean
  lineNumbers: boolean
  bracketPairColors: boolean
}

export interface CursorPosition {
  line: number
  col: number
}

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  theme: "vs-dark",
  vimMode: false,
  fontSize: 13,
  tabSize: 2,
  wordWrap: true,
  minimap: false,
  lineNumbers: true,
  bracketPairColors: true,
}

const STORAGE_KEY = "dh-os-editor-settings"

export function loadEditorSettings(): EditorSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return { ...DEFAULT_EDITOR_SETTINGS }
    const parsed = JSON.parse(stored) as Partial<EditorSettings>
    return { ...DEFAULT_EDITOR_SETTINGS, ...parsed }
  } catch {
    return { ...DEFAULT_EDITOR_SETTINGS }
  }
}

export function saveEditorSettings(settings: EditorSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // localStorage full or unavailable
  }
}

export const THEME_LABELS: Record<ThemeName, string> = {
  "vs-dark": "VS Code Dark+",
  "one-dark": "One Dark",
  "monokai": "Monokai",
  "github-dark": "GitHub Dark",
  "solarized-dark": "Solarized Dark",
  "dracula": "Dracula",
}
