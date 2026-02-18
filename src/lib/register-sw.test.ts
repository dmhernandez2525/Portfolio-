import { describe, expect, it, vi } from "vitest"
import { registerServiceWorker } from "@/lib/register-sw"

describe("registerServiceWorker", () => {
  it("does not throw when serviceWorker is unavailable", () => {
    vi.stubGlobal("navigator", {})
    expect(() => registerServiceWorker()).not.toThrow()
  })

  it("does not throw on server (no window)", () => {
    const original = globalThis.window
    vi.stubGlobal("window", undefined)
    expect(() => registerServiceWorker()).not.toThrow()
    vi.stubGlobal("window", original)
  })
})
