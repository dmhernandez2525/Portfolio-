import type { AssistantHistoryEntry, AssistantHistoryRoleFilter } from "@/types/assistant-enhancements"

const HISTORY_STORAGE_KEY = "assistant:history:v1"
const MAX_HISTORY_ITEMS = 200

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null
  }
  return window.localStorage
}

function parseEntries(raw: string | null): AssistantHistoryEntry[] {
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as AssistantHistoryEntry[]
    return Array.isArray(parsed)
      ? parsed.filter((entry) => typeof entry.id === "string" && typeof entry.content === "string")
      : []
  } catch {
    return []
  }
}

export function loadAssistantHistory(): AssistantHistoryEntry[] {
  const storage = getStorage()
  if (!storage) {
    return []
  }
  return parseEntries(storage.getItem(HISTORY_STORAGE_KEY))
}

export function saveAssistantHistory(entries: AssistantHistoryEntry[]): void {
  const storage = getStorage()
  if (!storage) {
    return
  }

  const sanitized = entries.slice(-MAX_HISTORY_ITEMS)
  storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(sanitized))
}

export function appendAssistantHistory(entries: AssistantHistoryEntry[], next: AssistantHistoryEntry): AssistantHistoryEntry[] {
  const merged = [...entries, next]
  return merged.slice(-MAX_HISTORY_ITEMS)
}

export function filterAssistantHistory(
  entries: AssistantHistoryEntry[],
  searchTerm: string,
  roleFilter: AssistantHistoryRoleFilter,
): AssistantHistoryEntry[] {
  const normalizedSearch = searchTerm.trim().toLowerCase()

  return entries.filter((entry) => {
    const roleMatched = roleFilter === "all" || entry.role === roleFilter
    if (!roleMatched) {
      return false
    }

    if (!normalizedSearch) {
      return true
    }

    return entry.content.toLowerCase().includes(normalizedSearch)
  })
}

export function exportAssistantHistory(entries: AssistantHistoryEntry[]): string {
  return JSON.stringify(entries, null, 2)
}
