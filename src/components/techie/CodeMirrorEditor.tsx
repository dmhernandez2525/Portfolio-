import { useState, useMemo, useCallback, useEffect } from "react"
import CodeMirror, { type Extension } from "@uiw/react-codemirror"
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
import { Play, X, Trash2 } from "lucide-react"
import { executeSandboxedJS } from "./sandbox"

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

function getLangLabel(ext: string): string {
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

const vscodeDarkTheme = EditorView.theme({
  "&": {
    backgroundColor: "#1e1e1e",
    color: "#d4d4d4",
    fontSize: "13px",
    height: "100%",
  },
  ".cm-content": {
    caretColor: "#aeafad",
    fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
    padding: "8px 0",
  },
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "#aeafad",
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
    backgroundColor: "#264f78",
  },
  ".cm-activeLine": {
    backgroundColor: "#2a2d2e",
  },
  ".cm-gutters": {
    backgroundColor: "#1e1e1e",
    color: "#858585",
    borderRight: "1px solid #3c3c3c",
    fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "#2a2d2e",
    color: "#cccccc",
  },
  ".cm-foldPlaceholder": {
    backgroundColor: "#3c3c3c",
    color: "#858585",
    border: "none",
  },
  ".cm-matchingBracket": {
    backgroundColor: "#3c3c3c",
    color: "#dcdcaa !important",
    outline: "1px solid #888",
  },
  ".cm-nonmatchingBracket": {
    color: "#f44747 !important",
  },
  ".cm-tooltip": {
    backgroundColor: "#252526",
    border: "1px solid #454545",
    color: "#d4d4d4",
  },
  ".cm-tooltip-autocomplete": {
    "& > ul > li[aria-selected]": {
      backgroundColor: "#094771",
    },
  },
}, { dark: true })

interface OutputEntry {
  text: string
  type: "log" | "result" | "error" | "info"
}

interface CodeMirrorEditorProps {
  fileName: string
  content: string
  onChange: (value: string) => void
  onRun: (code: string, lang: string) => void
}

export function CodeMirrorEditor({ fileName, content, onChange }: CodeMirrorEditorProps) {
  const ext = getExtension(fileName)
  const langLabel = getLangLabel(ext)
  const isRunnable = RUNNABLE_LANGS.has(ext)
  const [output, setOutput] = useState<OutputEntry[]>([])
  const [showOutput, setShowOutput] = useState(false)

  const extensions = useMemo(() => {
    const exts: Extension[] = [
      bracketMatching(),
      vscodeDarkTheme,
      EditorView.lineWrapping,
    ]

    const langFactory = LANG_MAP[ext]
    if (langFactory) exts.push(langFactory())

    return exts
  }, [ext])

  const handleRun = useCallback(() => {
    if (!isRunnable) {
      setOutput([{ text: `Execution not supported for ${langLabel}. Only JavaScript/TypeScript can be executed.`, type: "info" }])
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
  }, [content, isRunnable, langLabel])

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
            {langLabel}
          </span>
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

      {/* Editor */}
      <div className={`overflow-hidden ${showOutput ? "flex-1 min-h-0" : "flex-1"}`}>
        <CodeMirror
          value={content}
          onChange={onChange}
          extensions={extensions}
          theme="dark"
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightActiveLine: true,
            foldGutter: true,
            autocompletion: true,
            bracketMatching: false,
            closeBrackets: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            searchKeymap: true,
            tabSize: 2,
          }}
          height="100%"
          style={{ height: "100%" }}
        />
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
