import { beforeEach, describe, expect, it } from "vitest"
import { appendAssistantHistory, exportAssistantHistory, filterAssistantHistory, loadAssistantHistory, saveAssistantHistory } from "@/lib/voice-assistant/history"
import type { AssistantHistoryEntry } from "@/types/assistant-enhancements"

function createMemoryStorage(): Storage {
  const backing = new Map<string, string>()

  return {
    get length() {
      return backing.size
    },
    clear() {
      backing.clear()
    },
    getItem(key: string) {
      return backing.get(key) ?? null
    },
    key(index: number) {
      return Array.from(backing.keys())[index] ?? null
    },
    removeItem(key: string) {
      backing.delete(key)
    },
    setItem(key: string, value: string) {
      backing.set(key, value)
    },
  }
}

function entry(id: string, role: "user" | "assistant", content: string): AssistantHistoryEntry {
  return {
    id,
    role,
    content,
    timestamp: Date.now(),
  }
}

describe("assistant history", () => {
  beforeEach(() => {
    const storage = createMemoryStorage()
    Object.defineProperty(window, "localStorage", { value: storage, configurable: true })
    Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true })
  })

  it("persists and loads history", () => {
    const entries = [entry("1", "user", "hello"), entry("2", "assistant", "hi")]
    saveAssistantHistory(entries)

    const loaded = loadAssistantHistory()
    expect(loaded).toHaveLength(2)
    expect(loaded[0].content).toBe("hello")
  })

  it("supports append + filter + export", () => {
    const base = [entry("1", "user", "show projects")]
    const next = appendAssistantHistory(base, entry("2", "assistant", "Here are projects"))
    saveAssistantHistory(next)

    const filtered = filterAssistantHistory(next, "projects", "assistant")
    expect(filtered).toHaveLength(1)

    const exported = exportAssistantHistory(next)
    expect(exported).toContain("show projects")
    expect(exported).toContain("Here are projects")
  })
})
