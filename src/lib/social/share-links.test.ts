import { describe, expect, it } from "vitest"
import { getShareUrl } from "@/lib/social/share-links"

describe("getShareUrl", () => {
  const config = { title: "Test Project", url: "https://example.com/project" }

  it("generates Twitter share URL", () => {
    const url = getShareUrl("twitter", config)
    expect(url).toContain("twitter.com/intent/tweet")
    expect(url).toContain(encodeURIComponent(config.url))
  })

  it("generates LinkedIn share URL", () => {
    const url = getShareUrl("linkedin", config)
    expect(url).toContain("linkedin.com/sharing")
    expect(url).toContain(encodeURIComponent(config.url))
  })

  it("returns raw URL for copy platform", () => {
    const url = getShareUrl("copy", config)
    expect(url).toBe(config.url)
  })
})
