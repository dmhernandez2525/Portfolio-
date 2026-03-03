import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  clearAnalyticsEvents,
  getAnalyticsEvents,
  trackGoal,
  trackPageView,
  trackScrollDepth,
} from "@/lib/analytics-store"

describe("analytics-store", () => {
  beforeEach(() => {
    clearAnalyticsEvents()
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-02-15T12:00:00.000Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("tracks page views, engagement, and goal events", () => {
    trackPageView("/projects", "Projects")
    trackScrollDepth("/projects", 75)
    trackGoal("/resume", "resume_download")

    const events = getAnalyticsEvents()
    const eventTypes = events.map((event) => event.type)
    expect(eventTypes).toContain("session_start")
    expect(eventTypes).toContain("page_view")
    expect(eventTypes).toContain("scroll_depth")
    expect(eventTypes).toContain("goal")
  })

  it("filters events by date range", () => {
    trackPageView("/")
    vi.setSystemTime(new Date("2026-02-20T12:00:00.000Z"))
    trackPageView("/projects")

    const filtered = getAnalyticsEvents({
      start: "2026-02-19T00:00:00.000Z",
      end: "2026-02-21T23:59:59.000Z",
    })

    expect(filtered.some((event) => event.path === "/projects")).toBe(true)
    expect(filtered.some((event) => event.path === "/")).toBe(false)
  })
})
