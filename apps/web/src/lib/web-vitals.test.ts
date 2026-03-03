import { beforeEach, describe, expect, it, vi } from "vitest"
import { getStoredWebVitals, initWebVitals } from "@/lib/web-vitals"

const storageMock = new Map<string, string>()

beforeEach(() => {
  storageMock.clear()
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storageMock.get(key) ?? null,
    setItem: (key: string, value: string) => storageMock.set(key, value),
    removeItem: (key: string) => storageMock.delete(key),
  })
})

describe("getStoredWebVitals", () => {
  it("returns empty array when nothing persisted", () => {
    expect(getStoredWebVitals()).toEqual([])
  })

  it("returns persisted metrics", () => {
    const metrics = [{ name: "LCP", value: 1200, rating: "good" }]
    storageMock.set("portfolio:web-vitals:v1", JSON.stringify(metrics))
    expect(getStoredWebVitals()).toEqual(metrics)
  })

  it("returns empty array on corrupt data", () => {
    storageMock.set("portfolio:web-vitals:v1", "not json")
    expect(getStoredWebVitals()).toEqual([])
  })
})

describe("initWebVitals", () => {
  it("does not throw when PerformanceObserver is unavailable", () => {
    vi.stubGlobal("PerformanceObserver", undefined)
    expect(() => initWebVitals()).not.toThrow()
  })

  it("does not throw on server (no window)", () => {
    const original = globalThis.window
    vi.stubGlobal("window", undefined)
    expect(() => initWebVitals()).not.toThrow()
    vi.stubGlobal("window", original)
  })
})
