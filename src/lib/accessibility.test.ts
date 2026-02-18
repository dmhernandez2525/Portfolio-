import { describe, expect, it } from "vitest"
import { announceToScreenReader, runBasicA11yAudit } from "@/lib/accessibility"

describe("announceToScreenReader", () => {
  it("creates a live region element and removes it", async () => {
    announceToScreenReader("Test announcement")
    const liveRegion = document.querySelector("[aria-live]")
    expect(liveRegion).not.toBeNull()
    expect(liveRegion?.textContent).toBe("Test announcement")

    await new Promise((resolve) => setTimeout(resolve, 1100))
    const removed = document.querySelector("[aria-live]")
    expect(removed).toBeNull()
  })

  it("supports assertive priority", () => {
    announceToScreenReader("Urgent", "assertive")
    const liveRegion = document.querySelector('[aria-live="assertive"]')
    expect(liveRegion).not.toBeNull()
  })
})

describe("runBasicA11yAudit", () => {
  it("detects images without alt text", () => {
    const img = document.createElement("img")
    img.src = "test.png"
    document.body.appendChild(img)

    const results = runBasicA11yAudit()
    expect(results.some((r) => r.issue === "Image missing alt text")).toBe(true)

    img.remove()
  })

  it("does not flag images with alt text", () => {
    const img = document.createElement("img")
    img.src = "test.png"
    img.alt = "Test image"
    document.body.appendChild(img)

    const results = runBasicA11yAudit()
    const imgIssues = results.filter((r) => r.issue === "Image missing alt text")
    expect(imgIssues.length).toBe(0)

    img.remove()
  })

  it("detects buttons without accessible names", () => {
    const button = document.createElement("button")
    document.body.appendChild(button)

    const results = runBasicA11yAudit()
    expect(results.some((r) => r.issue === "Button has no accessible name")).toBe(true)

    button.remove()
  })
})
