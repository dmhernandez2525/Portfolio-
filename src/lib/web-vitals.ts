import { trackAnalyticsEvent } from "@/lib/analytics-store"

interface PerformanceEntryLike {
  name: string
  startTime: number
  duration: number
  entryType: string
}

interface LayoutShiftEntry extends PerformanceEntryLike {
  hadRecentInput: boolean
  value: number
}

interface LargestContentfulPaintEntry extends PerformanceEntryLike {
  renderTime: number
  loadTime: number
}

interface WebVitalMetric {
  name: string
  value: number
  rating: "good" | "needs-improvement" | "poor"
}

const WEB_VITALS_STORAGE_KEY = "portfolio:web-vitals:v1"

function getRating(name: string, value: number): WebVitalMetric["rating"] {
  const thresholds: Record<string, [number, number]> = {
    CLS: [0.1, 0.25],
    LCP: [2500, 4000],
    FID: [100, 300],
    TTFB: [800, 1800],
    INP: [200, 500],
  }

  const bounds = thresholds[name]
  if (!bounds) return "good"
  if (value <= bounds[0]) return "good"
  if (value <= bounds[1]) return "needs-improvement"
  return "poor"
}

function persistMetric(metric: WebVitalMetric): void {
  try {
    const raw = localStorage.getItem(WEB_VITALS_STORAGE_KEY)
    const entries: WebVitalMetric[] = raw ? JSON.parse(raw) : []
    entries.push({ ...metric, value: Math.round(metric.value * 100) / 100 })

    if (entries.length > 200) {
      entries.splice(0, entries.length - 200)
    }

    localStorage.setItem(WEB_VITALS_STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // Storage full or unavailable
  }
}

function reportMetric(name: string, value: number): void {
  const metric: WebVitalMetric = { name, value, rating: getRating(name, value) }
  persistMetric(metric)
  trackAnalyticsEvent({ type: "web_vital", path: window.location.pathname, metadata: { name, value: String(value), rating: metric.rating } })
}

function observeCLS(): void {
  if (typeof PerformanceObserver === "undefined") return

  let clsValue = 0

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const shift = entry as unknown as LayoutShiftEntry
      if (!shift.hadRecentInput) {
        clsValue += shift.value
      }
    }
  })

  try {
    observer.observe({ type: "layout-shift", buffered: true })
  } catch {
    return
  }

  const report = () => reportMetric("CLS", clsValue)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      report()
      observer.disconnect()
    }
  })
}

function observeLCP(): void {
  if (typeof PerformanceObserver === "undefined") return

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    const last = entries[entries.length - 1] as unknown as LargestContentfulPaintEntry | undefined
    if (last) {
      reportMetric("LCP", last.renderTime || last.startTime)
    }
  })

  try {
    observer.observe({ type: "largest-contentful-paint", buffered: true })
  } catch {
    return
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      observer.disconnect()
    }
  })
}

function observeFID(): void {
  if (typeof PerformanceObserver === "undefined") return

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      reportMetric("FID", entry.duration)
    }
  })

  try {
    observer.observe({ type: "first-input", buffered: true })
  } catch {
    return
  }
}

function measureTTFB(): void {
  if (typeof performance === "undefined") return

  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
  if (nav) {
    reportMetric("TTFB", nav.responseStart - nav.requestStart)
  }
}

export function initWebVitals(): void {
  if (typeof window === "undefined") return

  observeCLS()
  observeLCP()
  observeFID()
  measureTTFB()
}

export function getStoredWebVitals(): WebVitalMetric[] {
  try {
    const raw = localStorage.getItem(WEB_VITALS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
