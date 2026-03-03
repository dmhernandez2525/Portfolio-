import { describe, expect, it, vi } from "vitest"
import { renderHook } from "@testing-library/react"
import { useSwipeGesture } from "@/hooks/use-swipe-gesture"

function createTouchEvent(clientX: number, clientY: number) {
  return {
    touches: [{ clientX, clientY }],
    changedTouches: [{ clientX, clientY }],
  } as unknown as React.TouchEvent
}

describe("useSwipeGesture", () => {
  it("calls onSwipeLeft for leftward swipe", () => {
    const onSwipeLeft = vi.fn()
    const { result } = renderHook(() => useSwipeGesture({ onSwipeLeft }))

    vi.spyOn(Date, "now")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(100)

    result.current.onTouchStart(createTouchEvent(200, 100))
    result.current.onTouchEnd(createTouchEvent(100, 100))

    expect(onSwipeLeft).toHaveBeenCalledTimes(1)
    vi.restoreAllMocks()
  })

  it("calls onSwipeRight for rightward swipe", () => {
    const onSwipeRight = vi.fn()
    const { result } = renderHook(() => useSwipeGesture({ onSwipeRight }))

    vi.spyOn(Date, "now")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(100)

    result.current.onTouchStart(createTouchEvent(100, 100))
    result.current.onTouchEnd(createTouchEvent(250, 100))

    expect(onSwipeRight).toHaveBeenCalledTimes(1)
    vi.restoreAllMocks()
  })

  it("does not trigger for slow swipes", () => {
    const onSwipeLeft = vi.fn()
    const { result } = renderHook(() => useSwipeGesture({ onSwipeLeft }))

    vi.spyOn(Date, "now")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(500)

    result.current.onTouchStart(createTouchEvent(200, 100))
    result.current.onTouchEnd(createTouchEvent(100, 100))

    expect(onSwipeLeft).not.toHaveBeenCalled()
    vi.restoreAllMocks()
  })
})
