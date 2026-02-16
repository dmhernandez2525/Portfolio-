import { describe, expect, it, vi } from "vitest"
import { renderHook } from "@testing-library/react"
import { useMobileDetect } from "@/hooks/use-mobile-detect"

describe("useMobileDetect", () => {
  it("detects mobile viewport", () => {
    vi.stubGlobal("window", {
      ...window,
      innerWidth: 375,
      innerHeight: 812,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    Object.defineProperty(navigator, "maxTouchPoints", { value: 5, configurable: true })

    const { result } = renderHook(() => useMobileDetect())
    expect(result.current.isMobile).toBe(true)
    expect(result.current.orientation).toBe("portrait")
  })

  it("detects desktop viewport", () => {
    vi.stubGlobal("window", {
      ...window,
      innerWidth: 1920,
      innerHeight: 1080,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })

    const { result } = renderHook(() => useMobileDetect())
    expect(result.current.isMobile).toBe(false)
    expect(result.current.isTablet).toBe(false)
  })
})
