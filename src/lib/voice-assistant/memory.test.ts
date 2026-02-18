import { describe, expect, it } from "vitest"
import { buildConversationMemory } from "@/lib/voice-assistant/memory"
import type { AssistantHistoryEntry } from "@/types/assistant-enhancements"

function message(id: string, role: "user" | "assistant", content: string): AssistantHistoryEntry {
  return { id, role, content, timestamp: Date.now() }
}

describe("conversation memory", () => {
  it("retains latest user turns for context", () => {
    const entries: AssistantHistoryEntry[] = [
      message("1", "user", "Tell me about AI projects"),
      message("2", "assistant", "Here are AI projects"),
      message("3", "user", "Which ones are production?"),
      message("4", "assistant", "Several are production"),
      message("5", "user", "Focus on voice projects"),
    ]

    const memory = buildConversationMemory(entries, 2)
    expect(memory).toContain("Which ones are production?")
    expect(memory).toContain("Focus on voice projects")
    expect(memory).not.toContain("Tell me about AI projects")
  })

  it("returns no-context message when no user messages exist", () => {
    const memory = buildConversationMemory([message("a", "assistant", "Hello")])
    expect(memory).toBe("No prior user context.")
  })
})
