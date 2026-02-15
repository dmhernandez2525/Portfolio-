import { describe, expect, it } from "vitest"
import { buildAnalyticsReport, createPresetRange, previousRange, reportToCsv } from "@/lib/analytics-report"
import type { AnalyticsEvent } from "@/types/analytics"

const EVENTS: AnalyticsEvent[] = [
  {
    id: "1",
    timestamp: "2026-02-15T10:00:00.000Z",
    visitorId: "v1",
    sessionId: "s1",
    type: "page_view",
    path: "/",
  },
  {
    id: "2",
    timestamp: "2026-02-15T10:01:00.000Z",
    visitorId: "v1",
    sessionId: "s1",
    type: "page_view",
    path: "/projects",
  },
  {
    id: "3",
    timestamp: "2026-02-15T10:02:00.000Z",
    visitorId: "v1",
    sessionId: "s1",
    type: "goal",
    path: "/contact",
    metadata: { goal: "contact_submission" },
  },
  {
    id: "4",
    timestamp: "2026-02-15T10:03:00.000Z",
    visitorId: "v2",
    sessionId: "s2",
    type: "page_view",
    path: "/snake",
  },
  {
    id: "5",
    timestamp: "2026-02-15T10:04:00.000Z",
    visitorId: "v2",
    sessionId: "s2",
    type: "scroll_depth",
    path: "/snake",
    metadata: { percent: 80 },
  },
]

describe("analytics-report", () => {
  it("calculates funnel, goals, and top content correctly", () => {
    const report = buildAnalyticsReport(EVENTS, new Date("2026-02-15T10:05:00.000Z").getTime())

    expect(report.summary.pageViews).toBe(3)
    expect(report.summary.uniqueVisitors).toBe(2)
    expect(report.funnel.find((step) => step.id === "landing")?.visitors).toBe(1)
    expect(report.funnel.find((step) => step.id === "projects")?.visitors).toBe(1)
    expect(report.funnel.find((step) => step.id === "contact")?.visitors).toBe(1)
    expect(report.topGames[0]?.path).toBe("/snake")
    expect(report.goals[0]?.goal).toBe("contact_submission")
  })

  it("exports analytics report as CSV output", () => {
    const report = buildAnalyticsReport(EVENTS)
    const csv = reportToCsv(report)

    expect(csv).toContain("metric,value")
    expect(csv).toContain("page_views,3")
    expect(csv).toContain("top_content_path,views")
    expect(csv).toContain("/projects")
  })

  it("builds preset and previous comparison ranges", () => {
    const range = createPresetRange("7d")
    const previous = previousRange(range)

    expect(new Date(range.start).getTime()).toBeLessThan(new Date(range.end).getTime())
    expect(new Date(previous.end).getTime()).toBeLessThanOrEqual(new Date(range.start).getTime())
  })
})
