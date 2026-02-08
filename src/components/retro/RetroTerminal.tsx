import { useRef, useEffect } from "react"
import { useRetroTerminal } from "./useRetroTerminal"
import type { RetroLine } from "./retro-commands"

interface RetroTerminalProps {
  colorScheme: "green" | "amber"
  onColorChange: (scheme: "green" | "amber") => void
}

const COLOR_MAP: Record<string, Record<string, string>> = {
  green: {
    green: "#33ff33",
    bright: "#66ff66",
    dim: "#1a9a1a",
    cyan: "#33ffcc",
    red: "#ff4444",
    amber: "#ffb700",
  },
  amber: {
    green: "#ffb700",
    bright: "#ffd966",
    dim: "#996d00",
    cyan: "#ffe066",
    red: "#ff4444",
    amber: "#ffb700",
  },
}

function getLineColor(line: RetroLine, scheme: "green" | "amber"): string {
  const colors = COLOR_MAP[scheme]
  if (!line.color) return colors.green
  return colors[line.color] ?? colors.green
}

export function RetroTerminal({ colorScheme, onColorChange }: RetroTerminalProps) {
  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    lines,
    currentInput,
    setCurrentInput,
    handleKeyDown,
    bootComplete,
  } = useRetroTerminal({ onColorChange })

  // Auto-scroll
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [lines])

  // Focus input when boot completes
  useEffect(() => {
    if (bootComplete) {
      inputRef.current?.focus()
    }
  }, [bootComplete])

  const baseColor = colorScheme === "green" ? "#33ff33" : "#ffb700"

  return (
    <div
      className="flex flex-col h-full font-mono text-xs sm:text-sm select-text p-3 sm:p-6"
      style={{ backgroundColor: "#0a0a0a", color: baseColor }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Scrollable output */}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto overflow-x-hidden leading-6 whitespace-pre-wrap break-words"
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{ color: getLineColor(line, colorScheme) }}
            className="retro-text-glow"
          >
            {line.text || "\u00A0"}
          </div>
        ))}
      </div>

      {/* Input line */}
      {bootComplete && (
        <div className="flex items-center mt-2 shrink-0">
          <span style={{ color: baseColor }} className="retro-text-glow mr-1">
            {">"}{" "}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none min-w-0"
            style={{ color: baseColor, caretColor: baseColor }}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
          <span className="retro-cursor" style={{ color: baseColor }}>
            _
          </span>
        </div>
      )}
    </div>
  )
}
