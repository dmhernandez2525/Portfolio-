import { beforeEach, describe, expect, it, vi } from "vitest"
import { confirmSubscription, getSubscriberCount, isValidEmail, subscribe, unsubscribe } from "@/lib/newsletter/subscription"

const storageMock = new Map<string, string>()

beforeEach(() => {
  storageMock.clear()
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storageMock.get(key) ?? null,
    setItem: (key: string, value: string) => storageMock.set(key, value),
    removeItem: (key: string) => storageMock.delete(key),
  })
})

describe("subscribe", () => {
  it("subscribes a valid email", () => {
    const result = subscribe("test@example.com", ["blog"], "weekly")
    expect(result.success).toBe(true)
  })

  it("rejects invalid emails", () => {
    const result = subscribe("not-an-email", ["blog"], "weekly")
    expect(result.success).toBe(false)
    expect(result.error).toBe("Invalid email address")
  })

  it("prevents duplicate subscriptions", () => {
    subscribe("test@example.com", ["blog"], "weekly")
    const result = subscribe("test@example.com", ["games"], "monthly")
    expect(result.success).toBe(false)
    expect(result.error).toBe("Already subscribed")
  })
})

describe("unsubscribe", () => {
  it("removes a subscriber", () => {
    subscribe("test@example.com", ["blog"], "weekly")
    expect(unsubscribe("test@example.com")).toBe(true)
  })

  it("returns false for non-existent email", () => {
    expect(unsubscribe("unknown@example.com")).toBe(false)
  })
})

describe("confirmSubscription", () => {
  it("confirms a pending subscription", () => {
    subscribe("test@example.com", ["blog"], "weekly")
    expect(confirmSubscription("test@example.com")).toBe(true)
  })

  it("returns false for unknown email", () => {
    expect(confirmSubscription("unknown@example.com")).toBe(false)
  })
})

describe("getSubscriberCount", () => {
  it("counts only confirmed subscribers", () => {
    subscribe("a@example.com", ["blog"], "weekly")
    subscribe("b@example.com", ["blog"], "weekly")
    confirmSubscription("a@example.com")
    expect(getSubscriberCount()).toBe(1)
  })
})

describe("isValidEmail", () => {
  it("validates correct email formats", () => {
    expect(isValidEmail("user@domain.com")).toBe(true)
    expect(isValidEmail("a@b.co")).toBe(true)
  })

  it("rejects invalid formats", () => {
    expect(isValidEmail("not-email")).toBe(false)
    expect(isValidEmail("@domain.com")).toBe(false)
    expect(isValidEmail("")).toBe(false)
  })
})
