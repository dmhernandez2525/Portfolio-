import { beforeEach, describe, expect, it, vi } from "vitest"
import { formatMetricValue, getPortfolioMetrics, getTrustBadges, getVisitorCount, incrementVisitorCount } from "@/lib/social-proof/metrics"

const storageMock = new Map<string, string>()

beforeEach(() => {
  storageMock.clear()
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storageMock.get(key) ?? null,
    setItem: (key: string, value: string) => storageMock.set(key, value),
  })
})

describe("getPortfolioMetrics", () => {
  it("returns metrics array with expected entries", () => {
    const metrics = getPortfolioMetrics()
    expect(metrics.length).toBeGreaterThan(0)
    expect(metrics.find((m) => m.label === "Projects Built")).toBeDefined()
  })
})

describe("formatMetricValue", () => {
  it("formats value with suffix", () => {
    expect(formatMetricValue({ label: "Test", value: 34, suffix: "+" })).toBe("34+")
  })

  it("formats value without suffix", () => {
    expect(formatMetricValue({ label: "Test", value: 10 })).toBe("10")
  })
})

describe("getTrustBadges", () => {
  it("returns badges with required fields", () => {
    const badges = getTrustBadges()
    for (const badge of badges) {
      expect(badge.id).toBeTruthy()
      expect(badge.label).toBeTruthy()
      expect(badge.description).toBeTruthy()
    }
  })
})

describe("visitor counter", () => {
  it("starts at 0", () => {
    expect(getVisitorCount()).toBe(0)
  })

  it("increments correctly", () => {
    incrementVisitorCount()
    incrementVisitorCount()
    expect(getVisitorCount()).toBe(2)
  })
})
