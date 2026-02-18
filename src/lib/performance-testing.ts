/**
 * Performance benchmarking utilities for FPS monitoring,
 * memory tracking, bundle size analysis, and Core Web Vitals regression checks.
 */

// ── FPS Monitor ──────────────────────────────────────────────

export interface FpsSample {
  timestamp: number
  fps: number
}

export interface FpsStats {
  current: number
  average: number
  min: number
  max: number
  samples: FpsSample[]
}

export function createFpsMonitor(maxSamples = 120): {
  tick: (now: number) => void
  getStats: () => FpsStats
  reset: () => void
} {
  let lastTime = 0
  let frameCount = 0
  let accumulatedTime = 0
  const samples: FpsSample[] = []

  function tick(now: number): void {
    if (lastTime === 0) {
      lastTime = now
      return
    }
    const delta = now - lastTime
    lastTime = now
    frameCount++
    accumulatedTime += delta

    if (accumulatedTime >= 1000) {
      const fps = Math.round((frameCount / accumulatedTime) * 1000)
      samples.push({ timestamp: now, fps })
      if (samples.length > maxSamples) {
        samples.shift()
      }
      frameCount = 0
      accumulatedTime = 0
    }
  }

  function getStats(): FpsStats {
    if (samples.length === 0) {
      return { current: 0, average: 0, min: 0, max: 0, samples: [] }
    }
    const fpsValues = samples.map((s) => s.fps)
    const current = fpsValues[fpsValues.length - 1]
    const average = Math.round(
      fpsValues.reduce((sum, v) => sum + v, 0) / fpsValues.length
    )
    const min = Math.min(...fpsValues)
    const max = Math.max(...fpsValues)
    return { current, average, min, max, samples: [...samples] }
  }

  function reset(): void {
    lastTime = 0
    frameCount = 0
    accumulatedTime = 0
    samples.length = 0
  }

  return { tick, getStats, reset }
}

// ── Memory Tracker ───────────────────────────────────────────

export interface MemorySnapshot {
  timestamp: number
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

export interface MemoryTrend {
  snapshots: MemorySnapshot[]
  averageUsed: number
  peakUsed: number
  isLeaking: boolean
}

export function captureMemorySnapshot(
  timestamp: number,
  perf: { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }
): MemorySnapshot | null {
  if (!perf.memory) return null
  return {
    timestamp,
    usedJSHeapSize: perf.memory.usedJSHeapSize,
    totalJSHeapSize: perf.memory.totalJSHeapSize,
    jsHeapSizeLimit: perf.memory.jsHeapSizeLimit,
  }
}

export function analyzeMemoryTrend(snapshots: MemorySnapshot[]): MemoryTrend {
  if (snapshots.length === 0) {
    return { snapshots: [], averageUsed: 0, peakUsed: 0, isLeaking: false }
  }

  const usedValues = snapshots.map((s) => s.usedJSHeapSize)
  const averageUsed = Math.round(
    usedValues.reduce((sum, v) => sum + v, 0) / usedValues.length
  )
  const peakUsed = Math.max(...usedValues)

  const minSamplesForDetection = 5
  let isLeaking = false
  if (snapshots.length >= minSamplesForDetection) {
    const recent = usedValues.slice(-minSamplesForDetection)
    let growthCount = 0
    for (let i = 1; i < recent.length; i++) {
      if (recent[i] > recent[i - 1]) growthCount++
    }
    isLeaking = growthCount === recent.length - 1
  }

  return { snapshots: [...snapshots], averageUsed, peakUsed, isLeaking }
}

// ── Bundle Size Analysis ─────────────────────────────────────

export interface BundleEntry {
  name: string
  sizeBytes: number
  gzipBytes?: number
}

export interface BundleAnalysis {
  totalSize: number
  totalGzip: number
  entries: BundleEntry[]
  largestEntry: BundleEntry | null
  exceedsBudget: boolean
}

export function analyzeBundleSize(
  entries: BundleEntry[],
  budgetBytes = 500_000
): BundleAnalysis {
  if (entries.length === 0) {
    return {
      totalSize: 0,
      totalGzip: 0,
      entries: [],
      largestEntry: null,
      exceedsBudget: false,
    }
  }

  const totalSize = entries.reduce((sum, e) => sum + e.sizeBytes, 0)
  const totalGzip = entries.reduce((sum, e) => sum + (e.gzipBytes ?? 0), 0)

  let largestEntry = entries[0]
  for (const entry of entries) {
    if (entry.sizeBytes > largestEntry.sizeBytes) {
      largestEntry = entry
    }
  }

  return {
    totalSize,
    totalGzip,
    entries: [...entries],
    largestEntry,
    exceedsBudget: totalSize > budgetBytes,
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  const k = 1024
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    units.length - 1
  )
  const value = bytes / Math.pow(k, i)
  return `${parseFloat(value.toFixed(2))} ${units[i]}`
}

// ── Core Web Vitals Regression Checks ────────────────────────

export interface VitalThresholds {
  lcp: number
  fid: number
  cls: number
  fcp: number
  ttfb: number
}

export interface VitalMeasurement {
  lcp?: number
  fid?: number
  cls?: number
  fcp?: number
  ttfb?: number
}

export interface RegressionResult {
  metric: string
  current: number
  threshold: number
  passed: boolean
  delta: number
}

const DEFAULT_THRESHOLDS: VitalThresholds = {
  lcp: 2500,
  fid: 100,
  cls: 0.1,
  fcp: 1800,
  ttfb: 800,
}

export function checkVitalRegressions(
  measurement: VitalMeasurement,
  thresholds: Partial<VitalThresholds> = {}
): RegressionResult[] {
  const merged = { ...DEFAULT_THRESHOLDS, ...thresholds }
  const results: RegressionResult[] = []

  const metrics = ["lcp", "fid", "cls", "fcp", "ttfb"] as const
  for (const metric of metrics) {
    const current = measurement[metric]
    if (current === undefined) continue
    const threshold = merged[metric]
    results.push({
      metric,
      current,
      threshold,
      passed: current <= threshold,
      delta: current - threshold,
    })
  }

  return results
}

export function hasRegressions(results: RegressionResult[]): boolean {
  return results.some((r) => !r.passed)
}
