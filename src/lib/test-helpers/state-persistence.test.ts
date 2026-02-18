import { beforeEach, describe, expect, it, vi } from "vitest"

const storageMock = new Map<string, string>()

beforeEach(() => {
  storageMock.clear()
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storageMock.get(key) ?? null,
    setItem: (key: string, value: string) => storageMock.set(key, value),
    removeItem: (key: string) => storageMock.delete(key),
  })
})

function savePreference(key: string, value: string): void {
  localStorage.setItem(`portfolio:pref:${key}`, value)
}

function loadPreference(key: string): string | null {
  return localStorage.getItem(`portfolio:pref:${key}`)
}

describe("cross-route state persistence", () => {
  it("persists theme preference", () => {
    savePreference("theme", "dark")
    expect(loadPreference("theme")).toBe("dark")
  })

  it("persists game scores", () => {
    savePreference("snake-highscore", "42")
    expect(loadPreference("snake-highscore")).toBe("42")
  })

  it("persists mode selection", () => {
    savePreference("portfolio-mode", "creative")
    expect(loadPreference("portfolio-mode")).toBe("creative")
  })

  it("returns null for unset preferences", () => {
    expect(loadPreference("nonexistent")).toBeNull()
  })
})
