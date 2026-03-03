import type { ProactiveSuggestion } from "@/types/assistant-enhancements"

function mapPathToSuggestion(pathname: string): ProactiveSuggestion {
  if (pathname.includes("/games")) {
    return { id: "games-tips", text: "Want a game strategy walkthrough?", reason: "games" }
  }

  if (pathname.includes("/projects")) {
    return { id: "project-deep-dive", text: "Ask for a project case-study deep dive.", reason: "projects" }
  }

  if (pathname.includes("/blog")) {
    return { id: "blog-summary", text: "I can summarize any post and suggest related reads.", reason: "blog" }
  }

  return { id: "portfolio-tour", text: "Want a guided tour tailored to your interests?", reason: "default" }
}

export function getProactiveSuggestions(pathname: string, timeOnPageMs: number): ProactiveSuggestion[] {
  const suggestions: ProactiveSuggestion[] = [mapPathToSuggestion(pathname)]

  if (timeOnPageMs > 90000) {
    suggestions.push({
      id: "time-based",
      text: "I can jump you straight to the most relevant sections.",
      reason: "time-on-page",
    })
  }

  if (timeOnPageMs > 180000) {
    suggestions.push({
      id: "career-focus",
      text: "Need recruiter mode? I can highlight impact metrics only.",
      reason: "extended-session",
    })
  }

  return suggestions.slice(0, 3)
}
