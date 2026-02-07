import { useState, useCallback, useRef } from "react"
import { type OutputLine, executeCommandString, type TerminalContext } from "./terminal-commands"
import { getCompletions, applyCompletion } from "./terminal-autocomplete"
import { HOME_PATH } from "./terminal-filesystem"

interface UseTerminalOptions {
  openFile: (contentKey: string, fileName: string) => void
  setHackerMode: (on: boolean) => void
  triggerMatrix: () => void
}

export interface UseTerminalReturn {
  outputLines: OutputLine[]
  commandHistory: string[]
  currentInput: string
  cwd: string
  setCurrentInput: (value: string) => void
  executeCommand: (input: string) => void
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  clearOutput: () => void
}

const WELCOME_LINES: OutputLine[] = [
  { text: "DH OS Terminal v1.0.0", color: "#569cd6", bold: true },
  { text: 'Type "help" for available commands.', color: "#858585" },
  { text: "" },
]

export function useTerminal({
  openFile,
  setHackerMode,
  triggerMatrix,
}: UseTerminalOptions): UseTerminalReturn {
  const [outputLines, setOutputLines] = useState<OutputLine[]>(WELCOME_LINES)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [currentInput, setCurrentInput] = useState("")
  const [cwd, setCwd] = useState(HOME_PATH)
  const [completionIndex, setCompletionIndex] = useState(-1)
  const completionsRef = useRef<string[]>([])
  const startTimeRef = useRef(Date.now())

  const addOutput = useCallback((lines: OutputLine[]) => {
    setOutputLines((prev) => [...prev, ...lines])
  }, [])

  const clearOutput = useCallback(() => {
    setOutputLines([])
  }, [])

  const executeCommand = useCallback(
    (input: string) => {
      const trimmed = input.trim()
      if (!trimmed) return

      // Show the command in output
      addOutput([
        {
          parts: [
            { text: `daniel@dh-os:${cwd}$ `, color: "#608b4e" },
            { text: trimmed },
          ],
        },
      ])

      // Add to history
      setCommandHistory((prev) => [...prev, trimmed])
      setHistoryIndex(-1)

      // Reset completions
      completionsRef.current = []
      setCompletionIndex(-1)

      // Build context and execute
      const ctx: TerminalContext = {
        cwd,
        setCwd,
        openFile,
        addOutput,
        clearOutput,
        commandHistory,
        setHackerMode,
        triggerMatrix,
        startTime: startTimeRef.current,
      }

      executeCommandString(trimmed, ctx)
      setCurrentInput("")
    },
    [cwd, openFile, addOutput, clearOutput, commandHistory, setHackerMode, triggerMatrix]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Enter: execute command
      if (e.key === "Enter") {
        e.preventDefault()
        executeCommand(currentInput)
        return
      }

      // Up arrow: previous command
      if (e.key === "ArrowUp") {
        e.preventDefault()
        if (commandHistory.length === 0) return
        const newIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setCurrentInput(commandHistory[newIndex])
        completionsRef.current = []
        setCompletionIndex(-1)
        return
      }

      // Down arrow: next command
      if (e.key === "ArrowDown") {
        e.preventDefault()
        if (historyIndex === -1) return
        const newIndex = historyIndex + 1
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1)
          setCurrentInput("")
        } else {
          setHistoryIndex(newIndex)
          setCurrentInput(commandHistory[newIndex])
        }
        completionsRef.current = []
        setCompletionIndex(-1)
        return
      }

      // Tab: autocomplete
      if (e.key === "Tab") {
        e.preventDefault()

        // If we have active completions, cycle through them
        if (completionsRef.current.length > 0) {
          const nextIndex = (completionIndex + 1) % completionsRef.current.length
          setCompletionIndex(nextIndex)
          setCurrentInput(applyCompletion(currentInput, completionsRef.current[nextIndex]))
          return
        }

        // Get new completions
        const completions = getCompletions(currentInput, cwd)
        if (completions.length === 0) return

        if (completions.length === 1) {
          setCurrentInput(applyCompletion(currentInput, completions[0]))
          completionsRef.current = []
          setCompletionIndex(-1)
        } else {
          completionsRef.current = completions
          setCompletionIndex(0)
          setCurrentInput(applyCompletion(currentInput, completions[0]))
        }
        return
      }

      // Ctrl+C: cancel current input
      if (e.ctrlKey && e.key === "c") {
        e.preventDefault()
        addOutput([
          {
            parts: [
              { text: `daniel@dh-os:${cwd}$ `, color: "#608b4e" },
              { text: currentInput + "^C" },
            ],
          },
        ])
        setCurrentInput("")
        setHistoryIndex(-1)
        completionsRef.current = []
        setCompletionIndex(-1)
        return
      }

      // Ctrl+L: clear
      if (e.ctrlKey && e.key === "l") {
        e.preventDefault()
        clearOutput()
        return
      }

      // Any other key resets completions
      if (e.key.length === 1 || e.key === "Backspace" || e.key === "Delete") {
        completionsRef.current = []
        setCompletionIndex(-1)
      }
    },
    [currentInput, cwd, commandHistory, historyIndex, completionIndex, executeCommand, addOutput, clearOutput]
  )

  return {
    outputLines,
    commandHistory,
    currentInput,
    cwd,
    setCurrentInput,
    executeCommand,
    handleKeyDown,
    clearOutput,
  }
}
