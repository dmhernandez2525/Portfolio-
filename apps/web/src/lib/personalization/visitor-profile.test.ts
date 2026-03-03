import { describe, expect, it } from "vitest"
import {
  buildVisitorProfile,
  detectVisitorType,
  getIndustryView,
  getViewEmphasis,
  personalizeContentOrder,
  trackPageVisit,
} from "@/lib/personalization/visitor-profile"
import type { PageVisit } from "@/lib/personalization/visitor-profile"

describe("trackPageVisit", () => {
  it("appends a new visit", () => {
    const visits = trackPageVisit([], "/projects", 5000)
    expect(visits).toHaveLength(1)
    expect(visits[0].path).toBe("/projects")
    expect(visits[0].timeSpentMs).toBe(5000)
  })

  it("preserves existing visits", () => {
    const initial: PageVisit[] = [{ path: "/", timeSpentMs: 1000, timestamp: 1 }]
    const updated = trackPageVisit(initial, "/about", 2000)
    expect(updated).toHaveLength(2)
  })
})

describe("buildVisitorProfile", () => {
  it("computes total time and top sections", () => {
    const visits: PageVisit[] = [
      { path: "/projects/app1", timeSpentMs: 10000, timestamp: 1 },
      { path: "/projects/app2", timeSpentMs: 8000, timestamp: 2 },
      { path: "/blog/post1", timeSpentMs: 3000, timestamp: 3 },
      { path: "/games/snake", timeSpentMs: 2000, timestamp: 4 },
    ]
    const profile = buildVisitorProfile(visits)
    expect(profile.totalTimeMs).toBe(23000)
    expect(profile.topSections[0]).toBe("projects")
  })

  it("handles empty visits", () => {
    const profile = buildVisitorProfile([])
    expect(profile.totalTimeMs).toBe(0)
    expect(profile.topSections).toEqual([])
    expect(profile.detectedType).toBe("general")
  })

  it("detects developer from browsing pattern", () => {
    const visits: PageVisit[] = [
      { path: "/projects", timeSpentMs: 15000, timestamp: 1 },
      { path: "/blog", timeSpentMs: 10000, timestamp: 2 },
    ]
    const profile = buildVisitorProfile(visits)
    expect(profile.detectedType).toBe("developer")
  })
})

describe("detectVisitorType", () => {
  it("detects recruiter from resume and experience visits", () => {
    const visits: PageVisit[] = [
      { path: "/resume", timeSpentMs: 20000, timestamp: 1 },
      { path: "/experience", timeSpentMs: 15000, timestamp: 2 },
    ]
    expect(detectVisitorType(visits)).toBe("recruiter")
  })

  it("detects developer from project and blog visits", () => {
    const visits: PageVisit[] = [
      { path: "/projects", timeSpentMs: 20000, timestamp: 1 },
      { path: "/blog", timeSpentMs: 5000, timestamp: 2 },
    ]
    expect(detectVisitorType(visits)).toBe("developer")
  })

  it("detects designer from design page visits", () => {
    const visits: PageVisit[] = [
      { path: "/design", timeSpentMs: 20000, timestamp: 1 },
    ]
    expect(detectVisitorType(visits)).toBe("designer")
  })

  it("returns general for no signal pages", () => {
    const visits: PageVisit[] = [
      { path: "/", timeSpentMs: 5000, timestamp: 1 },
    ]
    expect(detectVisitorType(visits)).toBe("general")
  })
})

describe("personalizeContentOrder", () => {
  it("puts experience first for recruiters", () => {
    const ordered = personalizeContentOrder("recruiter")
    expect(ordered[0].id).toBe("experience")
  })

  it("puts projects first for developers", () => {
    const ordered = personalizeContentOrder("developer")
    expect(ordered[0].id).toBe("projects")
  })

  it("puts design first for designers", () => {
    const ordered = personalizeContentOrder("designer")
    expect(ordered[0].id).toBe("design")
  })

  it("maintains all sections", () => {
    const ordered = personalizeContentOrder("general")
    expect(ordered.length).toBeGreaterThanOrEqual(7)
  })
})

describe("getIndustryView", () => {
  it("maps recruiter to business view", () => {
    expect(getIndustryView("recruiter")).toBe("business")
  })

  it("maps developer to tech view", () => {
    expect(getIndustryView("developer")).toBe("tech")
  })

  it("maps designer to design view", () => {
    expect(getIndustryView("designer")).toBe("design")
  })
})

describe("getViewEmphasis", () => {
  it("returns tech emphasis items", () => {
    const emphasis = getViewEmphasis("tech")
    expect(emphasis).toContain("code samples")
    expect(emphasis).toContain("tech stack details")
  })

  it("returns business emphasis items", () => {
    const emphasis = getViewEmphasis("business")
    expect(emphasis).toContain("impact metrics")
  })

  it("returns design emphasis items", () => {
    const emphasis = getViewEmphasis("design")
    expect(emphasis).toContain("visual portfolio")
  })

  it("returns general emphasis items", () => {
    const emphasis = getViewEmphasis("general")
    expect(emphasis.length).toBeGreaterThan(0)
  })
})
