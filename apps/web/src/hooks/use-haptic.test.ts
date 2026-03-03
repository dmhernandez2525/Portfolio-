import { describe, expect, it, vi } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useHaptic } from "@/hooks/use-haptic"

describe("useHaptic", () => {
  it("reports supported when vibrate is available", () => {
    vi.stubGlobal("navigator", { vibrate: vi.fn() })
    const { result } = renderHook(() => useHaptic())
    expect(result.current.supported).toBe(true)
  })

  it("reports unsupported when vibrate is missing", () => {
    vi.stubGlobal("navigator", {})
    const { result } = renderHook(() => useHaptic())
    expect(result.current.supported).toBe(false)
  })

  it("calls navigator.vibrate with the correct pattern", () => {
    const vibrateMock = vi.fn()
    vi.stubGlobal("navigator", { vibrate: vibrateMock })
    const { result } = renderHook(() => useHaptic())
    act(() => result.current.vibrate("success"))
    expect(vibrateMock).toHaveBeenCalledWith([15, 50, 15])
  })

  it("does not throw when vibrate is unavailable", () => {
    vi.stubGlobal("navigator", {})
    const { result } = renderHook(() => useHaptic())
    expect(() => act(() => result.current.vibrate("light"))).not.toThrow()
  })
})
