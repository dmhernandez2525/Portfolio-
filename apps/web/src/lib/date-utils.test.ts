import { describe, expect, it } from "vitest"

function formatRelativeDate(date: Date): string {
  const now = Date.now()
  const diff = now - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 30) return date.toLocaleDateString()
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return "just now"
}

function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

describe("formatRelativeDate", () => {
  it("returns 'just now' for recent timestamps", () => {
    expect(formatRelativeDate(new Date())).toBe("just now")
  })

  it("returns minutes ago", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60000)
    expect(formatRelativeDate(fiveMinAgo)).toBe("5m ago")
  })

  it("returns hours ago", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600000)
    expect(formatRelativeDate(threeHoursAgo)).toBe("3h ago")
  })

  it("returns days ago", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000)
    expect(formatRelativeDate(twoDaysAgo)).toBe("2d ago")
  })
})

describe("isToday", () => {
  it("returns true for today", () => {
    expect(isToday(new Date())).toBe(true)
  })

  it("returns false for yesterday", () => {
    const yesterday = new Date(Date.now() - 86400000)
    expect(isToday(yesterday)).toBe(false)
  })
})
