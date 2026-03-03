import type { AssistantHistoryEntry } from "@/types/assistant-enhancements"

export function buildConversationMemory(entries: AssistantHistoryEntry[], maxTurns: number = 4): string {
  const relevant = entries
    .filter((entry) => entry.role === "user")
    .slice(-maxTurns)
    .map((entry, index) => `Turn ${index + 1}: ${entry.content}`)

  if (relevant.length === 0) {
    return "No prior user context."
  }

  return relevant.join("\n")
}
