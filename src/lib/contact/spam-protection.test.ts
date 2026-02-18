import { beforeEach, describe, expect, it, vi } from "vitest"
import { isHoneypotFilled, isRateLimited, recordSubmission } from "@/lib/contact/spam-protection"

const storageMock = new Map<string, string>()

beforeEach(() => {
  storageMock.clear()
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storageMock.get(key) ?? null,
    setItem: (key: string, value: string) => storageMock.set(key, value),
    removeItem: (key: string) => storageMock.delete(key),
  })
})

describe("isRateLimited", () => {
  it("returns false when no submissions exist", () => {
    expect(isRateLimited()).toBe(false)
  })

  it("returns true after max submissions", () => {
    recordSubmission()
    recordSubmission()
    recordSubmission()
    expect(isRateLimited()).toBe(true)
  })
})

describe("isHoneypotFilled", () => {
  it("returns false for empty value", () => {
    expect(isHoneypotFilled("")).toBe(false)
  })

  it("returns true for non-empty value", () => {
    expect(isHoneypotFilled("spam")).toBe(true)
  })
})
