import { GitBranch, AlertTriangle, XCircle, Terminal } from "lucide-react"

interface TechieStatusBarProps {
  currentFile: string
  lineCount?: number
  terminalOpen?: boolean
  onToggleTerminal?: () => void
}

function getLanguageFromFile(fileName: string): string {
  if (!fileName) return "Plain Text"
  const ext = fileName.split(".").pop()?.toLowerCase()
  const languages: Record<string, string> = {
    md: "Markdown",
    txt: "Plain Text",
    log: "Log",
    sh: "Shell Script",
    exe: "Executable",
    lnk: "Shortcut",
    ts: "TypeScript",
    tsx: "TypeScript React",
    js: "JavaScript",
    json: "JSON",
    env: "Environment",
  }
  return languages[ext ?? ""] ?? "Plain Text"
}

export function TechieStatusBar({
  currentFile,
  lineCount,
  terminalOpen,
  onToggleTerminal,
}: TechieStatusBarProps) {
  const language = getLanguageFromFile(currentFile)

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

      <div className="flex items-center gap-4">
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
        {currentFile && <span>{currentFile}</span>}
        {lineCount !== undefined && (
          <span>Ln {lineCount}, Col 1</span>
        )}
        <span>UTF-8</span>
        <span>LF</span>
        <span>{language}</span>
      </div>
    </div>
  )
}
