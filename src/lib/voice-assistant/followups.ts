import type { AssistantLocale } from "@/types/assistant-enhancements"

const FOLLOW_UP_DEFAULTS: Record<AssistantLocale, string[]> = {
  "en-US": ["Want a project deep dive?", "Need a quick resume summary?", "Should I start a guided tour?"],
  "es-ES": ["¿Quieres un análisis de proyecto?", "¿Necesitas un resumen del currículum?", "¿Inicio una visita guiada?"],
  "fr-FR": ["Tu veux un détail de projet ?", "Besoin d'un résumé du CV ?", "Je lance une visite guidée ?"],
  "de-DE": ["Willst du einen Projekt-Deep-Dive?", "Brauchst du eine Kurzfassung des Lebenslaufs?", "Soll ich eine Tour starten?"],
}

export function buildFollowUpSuggestions(userInput: string, locale: AssistantLocale): string[] {
  const normalized = userInput.toLowerCase()

  if (normalized.includes("project") || normalized.includes("build") || normalized.includes("stack")) {
    return FOLLOW_UP_DEFAULTS[locale].map((question, index) => (index === 0 ? question : FOLLOW_UP_DEFAULTS[locale][index]))
  }

  if (normalized.includes("game")) {
    const gameQuestions: Record<AssistantLocale, string[]> = {
      "en-US": ["Want leaderboard highlights?", "Need controls for a specific game?", "Should I open the games hub?"],
      "es-ES": ["¿Quieres ver el ranking?", "¿Necesitas controles de un juego?", "¿Abro la sección de juegos?"],
      "fr-FR": ["Tu veux les classements ?", "Besoin des contrôles d'un jeu ?", "J'ouvre la section jeux ?"],
      "de-DE": ["Willst du die Bestenliste sehen?", "Brauchst du die Steuerung für ein Spiel?", "Soll ich den Games-Bereich öffnen?"],
    }
    return gameQuestions[locale]
  }

  return FOLLOW_UP_DEFAULTS[locale]
}
