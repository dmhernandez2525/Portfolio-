export interface PortfolioMetric {
  label: string
  value: number
  suffix?: string
}

const METRICS: PortfolioMetric[] = [
  { label: "Projects Built", value: 34, suffix: "+" },
  { label: "Browser Games", value: 10 },
  { label: "Technologies", value: 25, suffix: "+" },
  { label: "Years Experience", value: 5, suffix: "+" },
]

export function getPortfolioMetrics(): PortfolioMetric[] {
  return METRICS
}

export function formatMetricValue(metric: PortfolioMetric): string {
  return `${metric.value}${metric.suffix ?? ""}`
}

export interface TrustBadge {
  id: string
  label: string
  description: string
  icon: string
}

const BADGES: TrustBadge[] = [
  { id: "open-source", label: "Open Source Contributor", description: "Active contributor to open source projects", icon: "code" },
  { id: "full-stack", label: "Full-Stack Developer", description: "Proficient across frontend, backend, and infrastructure", icon: "layers" },
  { id: "game-dev", label: "Game Developer", description: "Built 10+ playable browser games", icon: "gamepad" },
  { id: "ai-builder", label: "AI Builder", description: "Experience with ML models and AI-powered applications", icon: "brain" },
]

export function getTrustBadges(): TrustBadge[] {
  return BADGES
}

const VISITOR_COUNT_KEY = "portfolio:visitor-count"

export function incrementVisitorCount(): number {
  try {
    const raw = localStorage.getItem(VISITOR_COUNT_KEY)
    const current = raw ? parseInt(raw, 10) : 0
    const next = current + 1
    localStorage.setItem(VISITOR_COUNT_KEY, String(next))
    return next
  } catch {
    return 0
  }
}

export function getVisitorCount(): number {
  try {
    const raw = localStorage.getItem(VISITOR_COUNT_KEY)
    return raw ? parseInt(raw, 10) : 0
  } catch {
    return 0
  }
}
