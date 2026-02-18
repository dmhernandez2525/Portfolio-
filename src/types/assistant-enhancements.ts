export type AssistantPersonality = "professional" | "casual" | "playful"

export type AssistantLocale = "en-US" | "es-ES" | "fr-FR" | "de-DE"

export type AssistantHistoryRoleFilter = "all" | "user" | "assistant"

export interface AssistantHistoryEntry {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  isNavigation?: boolean
}

export interface ProactiveSuggestion {
  id: string
  text: string
  reason: string
}
