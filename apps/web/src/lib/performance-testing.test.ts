import { describe, expect, it } from "vitest"
import {
  analyzeBundleSize,
  analyzeMemoryTrend,
  captureMemorySnapshot,
  checkVitalRegressions,
  createFpsMonitor,
  formatBytes,
  hasRegressions,
} from "@/lib/performance-testing"
import type { MemorySnapshot } from "@/lib/performance-testing"

describe("createFpsMonitor", () => {
  it("returns zero stats when no samples recorded", () => {
    const monitor = createFpsMonitor()
    const stats = monitor.getStats()
    expect(stats.current).toBe(0)
    expect(stats.average).toBe(0)
    expect(stats.samples).toEqual([])
  })

  it("records FPS after sufficient time has passed", () => {
    const monitor = createFpsMonitor()
    monitor.tick(0)
    for (let i = 1; i <= 70; i++) {
      monitor.tick(i * 16)
    }
    const stats = monitor.getStats()
    expect(stats.current).toBeGreaterThan(0)
    expect(stats.samples.length).toBeGreaterThan(0)
  })

  it("respects maxSamples limit", () => {
    const monitor = createFpsMonitor(2)
    monitor.tick(0)
    for (let t = 16; t <= 5000; t += 16) {
      monitor.tick(t)
    }
    const stats = monitor.getStats()
    expect(stats.samples.length).toBeLessThanOrEqual(2)
  })

  it("resets all data", () => {
    const monitor = createFpsMonitor()
    monitor.tick(0)
    for (let i = 1; i <= 120; i++) {
      monitor.tick(i * 16)
    }
    monitor.reset()
    expect(monitor.getStats().samples).toEqual([])
  })

  it("computes min and max correctly", () => {
    const monitor = createFpsMonitor()
    monitor.tick(0)
    // Simulate a burst of 60fps then slower
    for (let i = 1; i <= 60; i++) monitor.tick(i * 16)
    for (let i = 61; i <= 120; i++) monitor.tick(960 + (i - 60) * 33)
    const stats = monitor.getStats()
    expect(stats.min).toBeLessThanOrEqual(stats.max)
    expect(stats.average).toBeGreaterThanOrEqual(stats.min)
    expect(stats.average).toBeLessThanOrEqual(stats.max)
  })

  it("skips first tick as baseline", () => {
    const monitor = createFpsMonitor()
    monitor.tick(100)
    expect(monitor.getStats().samples).toEqual([])
  })
})

describe("captureMemorySnapshot", () => {
  it("returns null when memory API is unavailable", () => {
    const result = captureMemorySnapshot(Date.now(), {})
    expect(result).toBeNull()
  })

  it("captures memory data when available", () => {
    const perf = {
      memory: {
        usedJSHeapSize: 1_000_000,
        totalJSHeapSize: 2_000_000,
        jsHeapSizeLimit: 4_000_000,
      },
    }
    const result = captureMemorySnapshot(1000, perf)
    expect(result).not.toBeNull()
    expect(result?.usedJSHeapSize).toBe(1_000_000)
    expect(result?.timestamp).toBe(1000)
  })
})

describe("analyzeMemoryTrend", () => {
  it("returns empty trend for no snapshots", () => {
    const trend = analyzeMemoryTrend([])
    expect(trend.averageUsed).toBe(0)
    expect(trend.isLeaking).toBe(false)
  })

  it("detects memory leak when usage grows consistently", () => {
    const snapshots: MemorySnapshot[] = Array.from({ length: 6 }, (_, i) => ({
      timestamp: i * 1000,
      usedJSHeapSize: 1_000_000 + i * 100_000,
      totalJSHeapSize: 5_000_000,
      jsHeapSizeLimit: 10_000_000,
    }))
    const trend = analyzeMemoryTrend(snapshots)
    expect(trend.isLeaking).toBe(true)
    expect(trend.peakUsed).toBe(1_500_000)
  })

  it("does not flag stable memory as leaking", () => {
    const snapshots: MemorySnapshot[] = Array.from({ length: 6 }, (_, i) => ({
      timestamp: i * 1000,
      usedJSHeapSize: 1_000_000 + (i % 2 === 0 ? 0 : -50_000),
      totalJSHeapSize: 5_000_000,
      jsHeapSizeLimit: 10_000_000,
    }))
    const trend = analyzeMemoryTrend(snapshots)
    expect(trend.isLeaking).toBe(false)
  })

  it("computes correct average", () => {
    const snapshots: MemorySnapshot[] = [
      { timestamp: 0, usedJSHeapSize: 100, totalJSHeapSize: 200, jsHeapSizeLimit: 400 },
      { timestamp: 1, usedJSHeapSize: 200, totalJSHeapSize: 200, jsHeapSizeLimit: 400 },
    ]
    const trend = analyzeMemoryTrend(snapshots)
    expect(trend.averageUsed).toBe(150)
  })

  it("does not flag leaking with fewer than 5 samples", () => {
    const snapshots: MemorySnapshot[] = Array.from({ length: 4 }, (_, i) => ({
      timestamp: i * 1000,
      usedJSHeapSize: 1_000_000 + i * 500_000,
      totalJSHeapSize: 5_000_000,
      jsHeapSizeLimit: 10_000_000,
    }))
    expect(analyzeMemoryTrend(snapshots).isLeaking).toBe(false)
  })
})

describe("analyzeBundleSize", () => {
  it("returns empty analysis for no entries", () => {
    const result = analyzeBundleSize([])
    expect(result.totalSize).toBe(0)
    expect(result.largestEntry).toBeNull()
  })

  it("calculates totals and finds largest entry", () => {
    const entries = [
      { name: "main.js", sizeBytes: 200_000, gzipBytes: 50_000 },
      { name: "vendor.js", sizeBytes: 300_000, gzipBytes: 80_000 },
    ]
    const result = analyzeBundleSize(entries)
    expect(result.totalSize).toBe(500_000)
    expect(result.totalGzip).toBe(130_000)
    expect(result.largestEntry?.name).toBe("vendor.js")
    expect(result.exceedsBudget).toBe(false)
  })

  it("detects budget exceeded", () => {
    const entries = [
      { name: "big.js", sizeBytes: 600_000 },
    ]
    const result = analyzeBundleSize(entries, 500_000)
    expect(result.exceedsBudget).toBe(true)
  })

  it("handles entries without gzip size", () => {
    const entries = [{ name: "a.js", sizeBytes: 100 }]
    const result = analyzeBundleSize(entries)
    expect(result.totalGzip).toBe(0)
  })

  it("uses custom budget threshold", () => {
    const entries = [{ name: "a.js", sizeBytes: 100 }]
    expect(analyzeBundleSize(entries, 50).exceedsBudget).toBe(true)
    expect(analyzeBundleSize(entries, 200).exceedsBudget).toBe(false)
  })
})

describe("formatBytes", () => {
  it("formats zero bytes", () => {
    expect(formatBytes(0)).toBe("0 B")
  })

  it("formats bytes", () => {
    expect(formatBytes(500)).toBe("500 B")
  })

  it("formats kilobytes", () => {
    expect(formatBytes(1024)).toBe("1 KB")
  })

  it("formats megabytes", () => {
    expect(formatBytes(1_048_576)).toBe("1 MB")
  })

  it("formats with decimals", () => {
    expect(formatBytes(1536)).toBe("1.5 KB")
  })
})

describe("checkVitalRegressions", () => {
  it("returns empty results for empty measurement", () => {
    expect(checkVitalRegressions({})).toEqual([])
  })

  it("passes metrics within default thresholds", () => {
    const results = checkVitalRegressions({
      lcp: 2000,
      fid: 50,
      cls: 0.05,
    })
    expect(results).toHaveLength(3)
    expect(results.every((r) => r.passed)).toBe(true)
  })

  it("fails metrics exceeding thresholds", () => {
    const results = checkVitalRegressions({
      lcp: 5000,
      fid: 200,
    })
    expect(results.every((r) => !r.passed)).toBe(true)
    expect(results[0].delta).toBe(2500)
  })

  it("supports custom thresholds", () => {
    const results = checkVitalRegressions(
      { lcp: 1500 },
      { lcp: 1000 }
    )
    expect(results[0].passed).toBe(false)
    expect(results[0].threshold).toBe(1000)
  })

  it("calculates correct delta", () => {
    const results = checkVitalRegressions({ ttfb: 500 })
    expect(results[0].delta).toBe(-300)
    expect(results[0].passed).toBe(true)
  })
})

describe("hasRegressions", () => {
  it("returns false for all passing", () => {
    expect(hasRegressions([
      { metric: "lcp", current: 1000, threshold: 2500, passed: true, delta: -1500 },
    ])).toBe(false)
  })

  it("returns true when any metric fails", () => {
    expect(hasRegressions([
      { metric: "lcp", current: 1000, threshold: 2500, passed: true, delta: -1500 },
      { metric: "fid", current: 200, threshold: 100, passed: false, delta: 100 },
    ])).toBe(true)
  })

  it("returns false for empty results", () => {
    expect(hasRegressions([])).toBe(false)
  })
})
