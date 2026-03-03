import { useState, useCallback, useEffect, useRef } from "react"
import { BOOT_LINES } from "./RetroAsciiArt"
import { executeRetroCommand, type RetroLine, type RetroContext } from "./retro-commands"

const MAX_HISTORY = 50

interface UseRetroTerminalProps {
  onColorChange: (scheme: "green" | "amber") => void
}

interface UseRetroTerminalReturn {
  lines: RetroLine[]
  currentInput: string
  setCurrentInput: (val: string) => void
  handleKeyDown: (e: React.KeyboardEvent) => void
  bootComplete: boolean
}

export function useRetroTerminal({ onColorChange }: UseRetroTerminalProps): UseRetroTerminalReturn {
  const [lines, setLines] = useState<RetroLine[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [bootComplete, setBootComplete] = useState(false)
  const bootRef = useRef(false)

  // Store callbacks in refs to avoid stale closures
  const onColorChangeRef = useRef(onColorChange)
  onColorChangeRef.current = onColorChange

  // Boot sequence
  useEffect(() => {
    if (bootRef.current) return
    bootRef.current = true

    let i = 0
    const timer = setInterval(() => {
      if (i < BOOT_LINES.length) {
        const line = BOOT_LINES[i]
        setLines(prev => [...prev, { text: line, color: i < 2 ? "bright" : undefined }])
        i++
      } else {
        clearInterval(timer)
        setBootComplete(true)
      }
    }, 120)

    return () => clearInterval(timer)
  }, [])

  const addLines = useCallback((newLines: RetroLine[]) => {
    setLines(prev => [...prev, ...newLines])
  }, [])

  const clear = useCallback(() => {
    setLines([])
  }, [])

  const ctxRef = useRef<RetroContext>({ addLines, clear, setColorScheme: onColorChange })
  ctxRef.current = { addLines, clear, setColorScheme: onColorChangeRef.current }

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const input = currentInput.trim()

      // Show the command in output
      setLines(prev => [...prev, { text: `> ${currentInput}`, color: "bright" }])

      if (input) {
        setCommandHistory(prev => [...prev, input].slice(-MAX_HISTORY))
        executeRetroCommand(input, ctxRef.current)
      }

      setCurrentInput("")
      setHistoryIndex(-1)
      return
    }

    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (commandHistory.length === 0) return
      const newIdx = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(newIdx)
      setCurrentInput(commandHistory[newIdx])
      return
    }

    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex === -1) return
      if (historyIndex >= commandHistory.length - 1) {
        setHistoryIndex(-1)
        setCurrentInput("")
      } else {
        const newIdx = historyIndex + 1
        setHistoryIndex(newIdx)
        setCurrentInput(commandHistory[newIdx])
      }
      return
    }

    if (e.ctrlKey && e.key === "l") {
      e.preventDefault()
      clear()
      return
    }

    if (e.ctrlKey && e.key === "c") {
      e.preventDefault()
      setLines(prev => [...prev, { text: `> ${currentInput}^C`, color: "dim" }])
      setCurrentInput("")
      return
    }
  }, [currentInput, commandHistory, historyIndex, clear])

  return {
    lines,
    currentInput,
    setCurrentInput,
    handleKeyDown,
    bootComplete,
  }
}
