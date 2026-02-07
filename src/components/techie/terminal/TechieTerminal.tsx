import { useRef, useEffect } from "react"
import { X } from "lucide-react"
import { useTerminal } from "./useTerminal"
import { displayPath } from "./terminal-filesystem"
import type { OutputLine } from "./terminal-commands"

interface TechieTerminalProps {
  openFile: (contentKey: string, fileName: string) => void
  onClose: () => void
  setHackerMode: (on: boolean) => void
  triggerMatrix: () => void
}

function OutputLineView({ line }: { line: OutputLine }) {
  if (line.parts) {
    return (
      <div className="whitespace-pre-wrap break-words">
        {line.parts.map((part, i) => (
          <span
            key={i}
            style={{ color: part.color }}
            className={line.bold ? "font-bold" : ""}
          >
            {part.text}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div
      className={`whitespace-pre-wrap break-words ${line.bold ? "font-bold" : ""}`}
      style={{ color: line.color }}
    >
      {line.text}
    </div>
  )
}

export function TechieTerminal({
  openFile,
  onClose,
  setHackerMode,
  triggerMatrix,
}: TechieTerminalProps) {
  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    outputLines,
    currentInput,
    cwd,
    setCurrentInput,
    handleKeyDown,
  } = useTerminal({ openFile, setHackerMode, triggerMatrix })

  // Auto-scroll to bottom on new output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [outputLines])

  // Focus input on mount and when clicking the terminal area
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  return (
    <div
      className="flex flex-col h-full bg-[#1a1a1a] font-mono text-xs select-text"
      onClick={handleContainerClick}
    >
      {/* Terminal toolbar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#252526] border-b border-[#3c3c3c] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[#cccccc] text-[10px] uppercase tracking-wider">
            Terminal
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="p-0.5 hover:bg-[#3c3c3c] text-[#858585] hover:text-[#cccccc] transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Scrollable output area */}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-2 text-[#d4d4d4] leading-5"
      >
        {outputLines.map((line, i) => (
          <OutputLineView key={i} line={line} />
        ))}
      </div>

      {/* Input line */}
      <div className="flex items-center px-2 py-1.5 border-t border-[#3c3c3c] shrink-0">
        <span className="text-[#608b4e] whitespace-nowrap shrink-0 mr-1">
          daniel@dh-os:{displayPath(cwd)}$
        </span>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-[#d4d4d4] outline-none caret-[#aeafad] min-w-0"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
    </div>
  )
}
