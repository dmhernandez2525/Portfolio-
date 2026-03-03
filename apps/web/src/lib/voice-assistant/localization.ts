import type { AssistantLocale } from "@/types/assistant-enhancements"

export const ASSISTANT_LOCALE_STORAGE_KEY = "assistant:locale:v1"

export const SUPPORTED_ASSISTANT_LOCALES: Record<AssistantLocale, { label: string; recognition: string }> = {
  "en-US": { label: "English", recognition: "en-US" },
  "es-ES": { label: "Español", recognition: "es-ES" },
  "fr-FR": { label: "Français", recognition: "fr-FR" },
  "de-DE": { label: "Deutsch", recognition: "de-DE" },
}

const QUICK_QUESTIONS: Record<AssistantLocale, string[]> = {
  "en-US": ["Give me a tour", "Go to games", "Show me projects", "What can Daniel do?"],
  "es-ES": ["Dame un tour", "Ir a juegos", "Muéstrame proyectos", "¿Qué puede hacer Daniel?"],
  "fr-FR": ["Fais-moi une visite", "Aller aux jeux", "Montre-moi les projets", "Que peut faire Daniel ?"],
  "de-DE": ["Gib mir eine Tour", "Zu Spielen gehen", "Zeig mir Projekte", "Was kann Daniel?"]
}

const TOUR_PREFIX: Record<AssistantLocale, string> = {
  "en-US": "",
  "es-ES": "[ES] ",
  "fr-FR": "[FR] ",
  "de-DE": "[DE] ",
}

const FOLLOW_UP_PREFIX: Record<AssistantLocale, string> = {
  "en-US": "Follow-up",
  "es-ES": "Siguiente",
  "fr-FR": "Suivi",
  "de-DE": "Nächste",
}

export function parseAssistantLocale(value: string | null | undefined): AssistantLocale {
  if (value === "es-ES" || value === "fr-FR" || value === "de-DE" || value === "en-US") {
    return value
  }
  return "en-US"
}

export function getQuickQuestions(locale: AssistantLocale): string[] {
  return QUICK_QUESTIONS[locale]
}

export function localizeTourScript(text: string, locale: AssistantLocale): string {
  if (locale === "en-US") {
    return text
  }

  const prefix = TOUR_PREFIX[locale]
  return `${prefix}${text}`
}

export function getFollowUpLabel(locale: AssistantLocale): string {
  return FOLLOW_UP_PREFIX[locale]
}

export function getVoiceFilterPrefix(locale: AssistantLocale): string {
  return locale.split("-")[0]
}
