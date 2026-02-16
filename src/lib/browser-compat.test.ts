import { describe, expect, it, vi } from "vitest"
import { checkFeatureSupport, detectBrowser, getGracefulFallback } from "@/lib/browser-compat"

describe("detectBrowser", () => {
  it("detects Chrome", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36" })
    const info = detectBrowser()
    expect(info.name).toBe("Chrome")
    expect(info.engine).toBe("Blink")
  })

  it("detects Firefox", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 Firefox/121.0" })
    expect(detectBrowser().name).toBe("Firefox")
  })

  it("detects Edge", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 Chrome/120 Edg/120.0" })
    expect(detectBrowser().name).toBe("Edge")
  })

  it("returns unknown for unrecognized UA", () => {
    vi.stubGlobal("navigator", { userAgent: "CustomBot/1.0" })
    expect(detectBrowser().name).toBe("unknown")
  })
})

describe("checkFeatureSupport", () => {
  it("returns all false on server", () => {
    const original = globalThis.window
    vi.stubGlobal("window", undefined)
    const support = checkFeatureSupport()
    expect(support.webgl).toBe(false)
    expect(support.serviceWorker).toBe(false)
    vi.stubGlobal("window", original)
  })
})

describe("getGracefulFallback", () => {
  it("returns fallback for each feature", () => {
    expect(getGracefulFallback("webgl")).toBe("2D canvas rendering")
    expect(getGracefulFallback("webxr")).toBe("Standard 3D view")
    expect(getGracefulFallback("serviceWorker")).toBe("Online-only mode")
  })
})
