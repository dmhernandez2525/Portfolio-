import { act, fireEvent, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useEasterEggs } from "@/hooks/use-easter-eggs"

function createMemoryStorage(): Storage {
  const backing = new Map<string, string>()

  return {
    get length() {
      return backing.size
    },
    clear() {
      backing.clear()
    },
    getItem(key: string) {
      return backing.get(key) ?? null
    },
    key(index: number) {
      return Array.from(backing.keys())[index] ?? null
    },
    removeItem(key: string) {
      backing.delete(key)
    },
    setItem(key: string, value: string) {
      backing.set(key, value)
    },
  }
}

function typeWord(value: string): void {
  for (const char of value) {
    fireEvent.keyDown(window, { key: char })
  }
}

describe("useEasterEggs", () => {
  beforeEach(() => {
    const storage = createMemoryStorage()
    Object.defineProperty(window, "localStorage", { value: storage, configurable: true })
    Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("detects matrix and mario code words", () => {
    const onMatrix = vi.fn()
    const onMario = vi.fn()

    renderHook(() =>
      useEasterEggs({
        onKonami: vi.fn(),
        onGandalf: vi.fn(),
        onDaniel: vi.fn(),
        onGhost: vi.fn(),
        onMatrix,
        onMario,
      }),
    )

    typeWord("matrix")
    typeWord("mario")

    expect(onMatrix).toHaveBeenCalledTimes(1)
    expect(onMario).toHaveBeenCalledTimes(1)
  })

  it("emits inactivity hints after configured idle delay", () => {
    vi.useFakeTimers()

    const onHint = vi.fn()

    renderHook(() =>
      useEasterEggs({
        onKonami: vi.fn(),
        onGandalf: vi.fn(),
        onDaniel: vi.fn(),
        onGhost: vi.fn(),
        onHint,
        enableInactivityHints: true,
        hintDelayMs: 1500,
      }),
    )

    act(() => {
      vi.advanceTimersByTime(2200)
    })
    expect(onHint).toHaveBeenCalledTimes(1)
  })

  it("unlocks orbit mini-game when corner sequence is completed", () => {
    const onMiniGame = vi.fn()

    renderHook(() =>
      useEasterEggs({
        onKonami: vi.fn(),
        onGandalf: vi.fn(),
        onDaniel: vi.fn(),
        onGhost: vi.fn(),
        onMiniGame,
      }),
    )

    const width = window.innerWidth
    const height = window.innerHeight

    window.dispatchEvent(new MouseEvent("pointerdown", { clientX: 4, clientY: 4 }))
    window.dispatchEvent(new MouseEvent("pointerdown", { clientX: width - 4, clientY: 4 }))
    window.dispatchEvent(new MouseEvent("pointerdown", { clientX: width - 4, clientY: height - 4 }))
    window.dispatchEvent(new MouseEvent("pointerdown", { clientX: 4, clientY: height - 4 }))

    expect(onMiniGame).toHaveBeenCalledWith("orbit-runner")
  })
})
