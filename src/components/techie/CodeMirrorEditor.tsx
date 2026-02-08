import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import CodeMirror, { type Extension, type ReactCodeMirrorRef } from "@uiw/react-codemirror"
import { EditorView } from "@codemirror/view"
import { javascript } from "@codemirror/lang-javascript"
import { python } from "@codemirror/lang-python"
import { html } from "@codemirror/lang-html"
import { css } from "@codemirror/lang-css"
import { json } from "@codemirror/lang-json"
import { markdown } from "@codemirror/lang-markdown"
import { xml } from "@codemirror/lang-xml"
import { java } from "@codemirror/lang-java"
import { cpp } from "@codemirror/lang-cpp"
import { php } from "@codemirror/lang-php"
import { rust } from "@codemirror/lang-rust"
import { sql } from "@codemirror/lang-sql"
import { bracketMatching } from "@codemirror/language"
import { oneDark } from "@codemirror/theme-one-dark"
import { monokai } from "@uiw/codemirror-theme-monokai"
import { githubDark } from "@uiw/codemirror-theme-github"
import { solarizedDark } from "@uiw/codemirror-theme-solarized"
import { dracula } from "@uiw/codemirror-theme-dracula"
import { vscodeDark } from "@uiw/codemirror-theme-vscode"
import { vim } from "@replit/codemirror-vim"
import { Play, X, Trash2 } from "lucide-react"
import { executeSandboxedJS } from "./sandbox"
import type { EditorSettings, CursorPosition, ThemeName } from "./editor-settings"
import { DEFAULT_EDITOR_SETTINGS } from "./editor-settings"

const LANG_MAP: Record<string, () => Extension> = {
  js: () => javascript(),
  jsx: () => javascript({ jsx: true }),
  ts: () => javascript({ typescript: true }),
  tsx: () => javascript({ jsx: true, typescript: true }),
  py: () => python(),
  html: () => html(),
  htm: () => html(),
  css: () => css(),
  json: () => json(),
  md: () => markdown(),
  xml: () => xml(),
  svg: () => xml(),
  java: () => java(),
  c: () => cpp(),
  cpp: () => cpp(),
  h: () => cpp(),
  hpp: () => cpp(),
  php: () => php(),
  rs: () => rust(),
  sql: () => sql(),
}

const RUNNABLE_LANGS = new Set(["js", "jsx", "ts", "tsx"])

function getExtension(fileName: string): string {
  const parts = fileName.split(".")
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ""
}

export function getLangLabel(ext: string): string {
  const labels: Record<string, string> = {
    js: "JavaScript",
    jsx: "JavaScript (JSX)",
    ts: "TypeScript",
    tsx: "TypeScript (TSX)",
    py: "Python",
    html: "HTML",
    htm: "HTML",
    css: "CSS",
    json: "JSON",
    md: "Markdown",
    xml: "XML",
    svg: "SVG",
    java: "Java",
    c: "C",
    cpp: "C++",
    h: "C Header",
    hpp: "C++ Header",
    php: "PHP",
    rs: "Rust",
    sql: "SQL",
  }
  return labels[ext] ?? "Plain Text"
}

export function getLangLabelFromFile(fileName: string): string {
  return getLangLabel(getExtension(fileName))
}

const THEME_MAP: Record<ThemeName, Extension> = {
  "vs-dark": vscodeDark,
  "one-dark": oneDark,
  "monokai": monokai,
  "github-dark": githubDark,
  "solarized-dark": solarizedDark,
  "dracula": dracula,
}

interface OutputEntry {
  text: string
  type: "log" | "result" | "error" | "info"
}

interface CodeMirrorEditorProps {
  fileName: string
  content: string
  onChange: (value: string) => void
  onRun: (code: string, lang: string) => void
  settings?: EditorSettings
  onCursorChange?: (pos: CursorPosition) => void
}

export function CodeMirrorEditor({
  fileName,
  content,
  onChange,
  settings = DEFAULT_EDITOR_SETTINGS,
  onCursorChange,
}: CodeMirrorEditorProps) {
  const ext = getExtension(fileName)
  const isRunnable = RUNNABLE_LANGS.has(ext)
  const [output, setOutput] = useState<OutputEntry[]>([])
  const [showOutput, setShowOutput] = useState(false)
  const editorRef = useRef<ReactCodeMirrorRef>(null)
  const minimapRef = useRef<HTMLDivElement>(null)

  const extensions = useMemo(() => {
    const exts: Extension[] = []

    // Vim mode
    if (settings.vimMode) {
      exts.push(vim())
    }

    // Bracket matching
    if (settings.bracketPairColors) {
      exts.push(bracketMatching())
    }

    // Theme
    exts.push(THEME_MAP[settings.theme] ?? vscodeDark)

    // Word wrap
    if (settings.wordWrap) {
      exts.push(EditorView.lineWrapping)
    }

    // Font size
    exts.push(EditorView.theme({
      ".cm-content": {
        fontSize: `${settings.fontSize}px`,
        fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
      },
      ".cm-gutters": {
        fontSize: `${settings.fontSize}px`,
        fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
      },
    }))

    // Cursor tracking
    exts.push(EditorView.updateListener.of((update) => {
      if (update.selectionSet || update.docChanged) {
        const pos = update.state.selection.main.head
        const line = update.state.doc.lineAt(pos)
        onCursorChange?.({
          line: line.number,
          col: pos - line.from + 1,
        })
      }
    }))

    // Language
    const langFactory = LANG_MAP[ext]
    if (langFactory) exts.push(langFactory())

    return exts
  }, [ext, settings.vimMode, settings.bracketPairColors, settings.theme, settings.wordWrap, settings.fontSize, onCursorChange])

  const handleRun = useCallback(() => {
    if (!isRunnable) {
      setOutput([{ text: `Execution not supported for ${getLangLabel(ext)}. Only JavaScript/TypeScript can be executed.`, type: "info" }])
      setShowOutput(true)
      return
    }

    const { logs, result, error } = executeSandboxedJS(content)
    const entries: OutputEntry[] = []

    for (const log of logs) {
      entries.push({ text: log, type: "log" })
    }
    if (error) {
      entries.push({ text: `Error: ${error}`, type: "error" })
    } else if (result !== null) {
      entries.push({ text: `→ ${result}`, type: "result" })
    }
    if (entries.length === 0) {
      entries.push({ text: "→ undefined", type: "result" })
    }

    setOutput(entries)
    setShowOutput(true)
  }, [content, isRunnable, ext])

  // Keyboard shortcut: Ctrl/Cmd+Shift+Enter to run
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "Enter") {
        e.preventDefault()
        handleRun()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [handleRun])

  // Minimap content
  const minimapLines = useMemo(() => {
    if (!settings.minimap) return []
    return content.split("\n").slice(0, 500)
  }, [content, settings.minimap])

  // Minimap scroll sync
  const handleMinimapClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientY - rect.top) / rect.height
    const view = editorRef.current?.view
    if (view) {
      const targetLine = Math.floor(ratio * view.state.doc.lines) + 1
      const line = view.state.doc.line(Math.min(targetLine, view.state.doc.lines))
      view.dispatch({
        effects: EditorView.scrollIntoView(line.from, { y: "start" }),
      })
    }
  }, [])

  const outputColors: Record<OutputEntry["type"], string> = {
    log: "#d4d4d4",
    result: "#b5cea8",
    error: "#f44747",
    info: "#858585",
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#252526] border-b border-[#3c3c3c] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[10px] px-2 py-0.5 bg-[#1e1e1e] border border-[#3c3c3c] text-[#858585] font-mono">
            {getLangLabel(ext)}
          </span>
          {settings.vimMode && (
            <span className="text-[10px] px-2 py-0.5 bg-[#388a34]/20 border border-[#388a34]/40 text-[#4ec9b0] font-mono">
              VIM
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isRunnable && (
            <button
              onClick={handleRun}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono bg-[#388a34] hover:bg-[#45a041] text-white transition-colors"
              title="Run Code (Ctrl+Shift+Enter)"
            >
              <Play className="w-3 h-3" />
              Run
            </button>
          )}
          {!isRunnable && ext && (
            <span className="text-[10px] text-[#858585] font-mono">
              Syntax highlighting only
            </span>
          )}
        </div>
      </div>

      {/* Editor + Minimap */}
      <div className={`flex overflow-hidden ${showOutput ? "flex-1 min-h-0" : "flex-1"}`}>
        <div className="flex-1 overflow-hidden">
          <CodeMirror
            ref={editorRef}
            value={content}
            onChange={onChange}
            extensions={extensions}
            theme="dark"
            basicSetup={{
              lineNumbers: settings.lineNumbers,
              highlightActiveLineGutter: true,
              highlightActiveLine: true,
              foldGutter: true,
              autocompletion: true,
              bracketMatching: false,
              closeBrackets: true,
              indentOnInput: true,
              syntaxHighlighting: true,
              searchKeymap: true,
              tabSize: settings.tabSize,
            }}
            height="100%"
            style={{ height: "100%" }}
          />
        </div>

        {/* Minimap */}
        {settings.minimap && (
          <div
            ref={minimapRef}
            className="w-[60px] shrink-0 bg-[#1e1e1e] border-l border-[#3c3c3c] overflow-hidden cursor-pointer relative"
            onClick={handleMinimapClick}
            title="Click to scroll"
          >
            <pre className="text-[1.5px] leading-[2px] p-1 text-[#858585] pointer-events-none select-none overflow-hidden whitespace-pre font-mono">
              {minimapLines.map((line, i) => (
                <div key={i}>{line || " "}</div>
              ))}
            </pre>
          </div>
        )}
      </div>

      {/* Output panel */}
      {showOutput && (
        <div className="h-[140px] shrink-0 border-t border-[#3c3c3c] flex flex-col bg-[#1a1a1a]">
          <div className="flex items-center justify-between px-3 py-1 bg-[#252526] border-b border-[#3c3c3c] shrink-0">
            <span className="text-[10px] text-[#cccccc] uppercase tracking-wider font-mono">Output</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setOutput([])}
                className="p-0.5 hover:bg-[#3c3c3c] text-[#858585] hover:text-[#cccccc] transition-colors"
                title="Clear output"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              <button
                onClick={() => setShowOutput(false)}
                className="p-0.5 hover:bg-[#3c3c3c] text-[#858585] hover:text-[#cccccc] transition-colors"
                title="Close output"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-2 font-mono text-xs leading-5">
            {output.map((entry, i) => (
              <div key={i} style={{ color: outputColors[entry.type] }} className="whitespace-pre-wrap break-words">
                {entry.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
