import { describe, expect, it } from "vitest"
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatRelativeTime,
  getIntlLocale,
} from "@/lib/i18n/formatting"

describe("formatDate", () => {
  const date = new Date("2025-06-15T12:00:00Z")

  it("formats short date in English", () => {
    const result = formatDate(date, "en", "short")
    expect(result).toMatch(/06\/15\/2025/)
  })

  it("formats long date in French", () => {
    const result = formatDate(date, "fr", "long")
    expect(result).toContain("2025")
    expect(result).toContain("juin")
  })

  it("formats long date in German", () => {
    const result = formatDate(date, "de", "long")
    expect(result).toContain("Juni")
  })
})

describe("formatNumber", () => {
  it("formats with US commas", () => {
    expect(formatNumber(1234567, "en")).toBe("1,234,567")
  })

  it("formats with German dots", () => {
    expect(formatNumber(1234567, "de")).toBe("1.234.567")
  })

  it("formats with French spaces", () => {
    const result = formatNumber(1234567, "fr")
    // French uses narrow no-break space as thousands separator
    expect(result.replace(/\s/g, " ")).toMatch(/1\s234\s567/)
  })
})

describe("formatCurrency", () => {
  it("formats USD in English", () => {
    const result = formatCurrency(99.99, "en")
    expect(result).toContain("$")
    expect(result).toContain("99.99")
  })

  it("formats EUR in German", () => {
    const result = formatCurrency(99.99, "de", "EUR")
    expect(result).toContain("99,99")
  })
})

describe("formatRelativeTime", () => {
  it("formats days ago", () => {
    const now = new Date("2025-06-15T12:00:00Z")
    const past = new Date("2025-06-12T12:00:00Z")
    const result = formatRelativeTime(past, "en", now)
    expect(result).toContain("3")
    expect(result).toMatch(/day/i)
  })

  it("formats hours ago", () => {
    const now = new Date("2025-06-15T12:00:00Z")
    const past = new Date("2025-06-15T07:00:00Z")
    const result = formatRelativeTime(past, "en", now)
    expect(result).toContain("5")
    expect(result).toMatch(/hour/i)
  })

  it("formats in Spanish", () => {
    const now = new Date("2025-06-15T12:00:00Z")
    const past = new Date("2025-06-14T12:00:00Z")
    const result = formatRelativeTime(past, "es", now)
    expect(result).toMatch(/ayer|1/i)
  })
})

describe("getIntlLocale", () => {
  it("maps supported locales to Intl locales", () => {
    expect(getIntlLocale("en")).toBe("en-US")
    expect(getIntlLocale("es")).toBe("es-ES")
    expect(getIntlLocale("fr")).toBe("fr-FR")
    expect(getIntlLocale("de")).toBe("de-DE")
  })
})
