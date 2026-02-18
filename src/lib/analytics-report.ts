import type { AnalyticsEvent, AnalyticsRange, AnalyticsReport, AnalyticsSummary, ContentStat, FunnelStep, GoalStat } from "@/types/analytics"

const GAME_PATHS = ["/snake", "/tetris", "/chess", "/game", "/tanks", "/agar", "/mafia-wars", "/pokemon", "/shopping-cart-hero", "/cookie-clicker"]

function average(values: number[]): number {
  if (values.length === 0) return 0
  const total = values.reduce((sum, value) => sum + value, 0)
  return Math.round((total / values.length) * 100) / 100
}

function toCountMap(items: string[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const item of items) {
    map[item] = (map[item] ?? 0) + 1
  }
  return map
}

function topCounts(map: Record<string, number>, limit = 8): ContentStat[] {
  return Object.entries(map)
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
}

function calculateSummary(events: AnalyticsEvent[], nowTimestamp: number): AnalyticsSummary {
  const pageViews = events.filter((event) => event.type === "page_view")
  const visitorSet = new Set(pageViews.map((event) => event.visitorId))
  const sessionSet = new Set(events.map((event) => event.sessionId))
  const activeWindow = nowTimestamp - 5 * 60 * 1000
  const activeVisitors = new Set(
    events.filter((event) => new Date(event.timestamp).getTime() >= activeWindow).map((event) => event.visitorId),
  )

  return {
    pageViews: pageViews.length,
    uniqueVisitors: visitorSet.size,
    sessions: sessionSet.size,
    activeVisitors: activeVisitors.size,
  }
}

function calculateFunnel(events: AnalyticsEvent[]): FunnelStep[] {
  const landingVisitors = new Set<string>()
  const projectsVisitors = new Set<string>()
  const contactVisitors = new Set<string>()

  for (const event of events) {
    if (event.type !== "page_view" && event.type !== "goal") continue

    if (event.type === "page_view" && (event.path === "/" || event.path === "/gateway")) {
      landingVisitors.add(event.visitorId)
    }

    if (event.type === "page_view" && event.path.startsWith("/projects")) {
      projectsVisitors.add(event.visitorId)
    }

    if (
      (event.type === "page_view" && event.path.startsWith("/contact")) ||
      (event.type === "goal" && event.metadata?.goal === "contact_submission")
    ) {
      contactVisitors.add(event.visitorId)
    }
  }

  return [
    { id: "landing", label: "Landing", visitors: landingVisitors.size },
    { id: "projects", label: "Projects", visitors: projectsVisitors.size },
    { id: "contact", label: "Contact", visitors: contactVisitors.size },
  ]
}

function calculateGoals(events: AnalyticsEvent[]): GoalStat[] {
  const map: Record<string, number> = {}
  for (const event of events) {
    if (event.type !== "goal") continue
    const goal = typeof event.metadata?.goal === "string" ? event.metadata.goal : "unknown"
    map[goal] = (map[goal] ?? 0) + 1
  }

  return Object.entries(map)
    .map(([goal, count]) => ({ goal: goal as GoalStat["goal"], count }))
    .sort((a, b) => b.count - a.count)
}

export function buildAnalyticsReport(events: AnalyticsEvent[], nowTimestamp = Date.now()): AnalyticsReport {
  const pageViewEvents = events.filter((event) => event.type === "page_view")
  const topContent = topCounts(toCountMap(pageViewEvents.map((event) => event.path)))
  const topGames = topCounts(
    toCountMap(pageViewEvents.filter((event) => GAME_PATHS.some((path) => event.path.startsWith(path))).map((event) => event.path)),
    5,
  )

  const scrollValues = events
    .filter((event) => event.type === "scroll_depth")
    .map((event) => Number(event.metadata?.percent))
    .filter((value) => Number.isFinite(value))
  const timeValues = events
    .filter((event) => event.type === "time_on_page")
    .map((event) => Number(event.metadata?.seconds))
    .filter((value) => Number.isFinite(value))

  return {
    summary: calculateSummary(events, nowTimestamp),
    funnel: calculateFunnel(events),
    topContent,
    topGames,
    goals: calculateGoals(events),
    averageScrollDepth: average(scrollValues),
    averageTimeOnPageSeconds: average(timeValues),
  }
}

export function createPresetRange(preset: "today" | "7d" | "30d"): AnalyticsRange {
  const now = new Date()
  const end = now.toISOString()
  const startDate = new Date(now)

  if (preset === "today") {
    startDate.setHours(0, 0, 0, 0)
  }
  if (preset === "7d") {
    startDate.setDate(startDate.getDate() - 7)
  }
  if (preset === "30d") {
    startDate.setDate(startDate.getDate() - 30)
  }

  return { start: startDate.toISOString(), end }
}

export function previousRange(range: AnalyticsRange): AnalyticsRange {
  const start = new Date(range.start).getTime()
  const end = new Date(range.end).getTime()
  const duration = end - start
  return {
    start: new Date(start - duration).toISOString(),
    end: new Date(end - duration).toISOString(),
  }
}

export function reportToCsv(report: AnalyticsReport): string {
  const lines: string[] = []
  lines.push("metric,value")
  lines.push(`page_views,${report.summary.pageViews}`)
  lines.push(`unique_visitors,${report.summary.uniqueVisitors}`)
  lines.push(`sessions,${report.summary.sessions}`)
  lines.push(`active_visitors,${report.summary.activeVisitors}`)
  lines.push(`avg_scroll_depth,${report.averageScrollDepth}`)
  lines.push(`avg_time_on_page_seconds,${report.averageTimeOnPageSeconds}`)
  lines.push("")
  lines.push("funnel_step,visitors")
  for (const step of report.funnel) {
    lines.push(`${step.label},${step.visitors}`)
  }
  lines.push("")
  lines.push("top_content_path,views")
  for (const row of report.topContent) {
    lines.push(`"${row.path.replace(/"/g, '""')}",${row.views}`)
  }
  return lines.join("\n")
}

export function downloadAnalyticsFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
