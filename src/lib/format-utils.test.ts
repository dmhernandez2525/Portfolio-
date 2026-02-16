import { describe, expect, it } from "vitest"

function formatReadingTime(wordCount: number): string {
  const minutes = Math.max(1, Math.ceil(wordCount / 200))
  return `${minutes} min read`
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + "..."
}

describe("formatReadingTime", () => {
  it("returns 1 min for short content", () => {
    expect(formatReadingTime(50)).toBe("1 min read")
  })

  it("calculates correctly for longer content", () => {
    expect(formatReadingTime(600)).toBe("3 min read")
  })

  it("returns at least 1 min", () => {
    expect(formatReadingTime(0)).toBe("1 min read")
  })
})

describe("slugify", () => {
  it("converts text to URL-safe slug", () => {
    expect(slugify("Hello World")).toBe("hello-world")
  })

  it("removes special characters", () => {
    expect(slugify("React & TypeScript!")).toBe("react-typescript")
  })

  it("handles empty string", () => {
    expect(slugify("")).toBe("")
  })
})

describe("truncate", () => {
  it("does not truncate short text", () => {
    expect(truncate("Hello", 10)).toBe("Hello")
  })

  it("truncates long text with ellipsis", () => {
    expect(truncate("This is a long string", 10)).toBe("This is...")
  })
})
