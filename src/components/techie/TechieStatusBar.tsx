import { GitBranch, AlertTriangle, XCircle } from "lucide-react"

interface TechieStatusBarProps {
  currentFile: string
  lineCount?: number
}

export function TechieStatusBar({ currentFile, lineCount }: TechieStatusBarProps) {
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
        {currentFile && <span>{currentFile}</span>}
        {lineCount !== undefined && (
          <span>Ln {lineCount}, Col 1</span>
        )}
        <span>UTF-8</span>
        <span>LF</span>
        <span>TypeScript</span>
      </div>
    </div>
  )
}
