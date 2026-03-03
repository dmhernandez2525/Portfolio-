import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  getCreatureDexCompletion,
  loadCreatureDexState,
  registerCreatureCatch,
  saveCreatureDexState,
} from "@/lib/creature-system/storage"
import type { CreatureDexState } from "@/types/creature-system"

const storageMock = new Map<string, string>()

beforeEach(() => {
  storageMock.clear()
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => storageMock.get(key) ?? null,
      setItem: (key: string, value: string) => storageMock.set(key, value),
      removeItem: (key: string) => storageMock.delete(key),
    },
    dispatchEvent: vi.fn(),
    CustomEvent: class extends Event {
      detail: unknown
      constructor(type: string, init?: { detail?: unknown }) {
        super(type)
        this.detail = init?.detail
      }
    },
  })
})

describe("loadCreatureDexState", () => {
  it("returns empty state when nothing is persisted", () => {
    const state = loadCreatureDexState()
    expect(state.completionPercentage).toBe(0)
    expect(Object.keys(state.entries)).toHaveLength(0)
  })

  it("restores persisted state", () => {
    const initial: CreatureDexState = {
      entries: { bug: { speciesId: "bug", catches: 2, firstCaughtAt: 100, lastCaughtAt: 200, rarity: "common" } },
      unlockedLore: ["bug"],
      completionPercentage: 0,
    }
    saveCreatureDexState(initial)
    const loaded = loadCreatureDexState()
    expect(loaded.entries["bug"].catches).toBe(2)
    expect(loaded.unlockedLore).toContain("bug")
  })
})

describe("registerCreatureCatch", () => {
  it("registers first catch and unlocks lore", () => {
    const result = registerCreatureCatch("bug")
    expect(result.state.entries["bug"].catches).toBe(1)
    expect(result.state.unlockedLore).toContain("bug")
  })

  it("increments catch count on subsequent catches", () => {
    registerCreatureCatch("bug")
    const result = registerCreatureCatch("bug")
    expect(result.state.entries["bug"].catches).toBe(2)
  })

  it("reports evolution when crossing threshold", () => {
    registerCreatureCatch("phoenix")
    registerCreatureCatch("phoenix")
    registerCreatureCatch("phoenix")
    const result = registerCreatureCatch("phoenix")
    expect(result.evolvedTo).toBe("phoenix-spark")
  })

  it("returns null evolvedTo for species without evolution", () => {
    const result = registerCreatureCatch("bug")
    expect(result.evolvedTo).toBeNull()
  })

  it("does not change state for unknown species", () => {
    const result = registerCreatureCatch("nonexistent-creature-xyz")
    expect(Object.keys(result.state.entries)).toHaveLength(0)
  })
})

describe("getCreatureDexCompletion", () => {
  it("returns 0 when no creatures caught", () => {
    expect(getCreatureDexCompletion()).toBe(0)
  })

  it("increases after catching a creature", () => {
    registerCreatureCatch("bug")
    expect(getCreatureDexCompletion()).toBeGreaterThan(0)
  })
})
