import { describe, expect, it } from "vitest"
import { formatTimeInTimezone, getAvailability, getVisitorTimezone, isCurrentlyAvailable } from "@/lib/contact/availability"

describe("getAvailability", () => {
  it("returns weekday schedule", () => {
    const schedule = getAvailability()
    expect(schedule).toHaveLength(5)
    expect(schedule[0].day).toBe("Monday")
    expect(schedule[0].startHour).toBe(9)
  })
})

describe("isCurrentlyAvailable", () => {
  it("returns false for empty schedule", () => {
    expect(isCurrentlyAvailable([])).toBe(false)
  })
})

describe("getVisitorTimezone", () => {
  it("returns a non-empty string", () => {
    expect(getVisitorTimezone().length).toBeGreaterThan(0)
  })
})

describe("formatTimeInTimezone", () => {
  it("formats hour into readable time", () => {
    const result = formatTimeInTimezone(14, "America/New_York")
    expect(result).toBeTruthy()
  })
})
