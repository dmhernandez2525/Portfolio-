import { describe, expect, it } from "vitest"
import { buildOpenGraphTags, buildTwitterCardTags, getCanonicalUrl, getPageMeta } from "@/lib/seo/meta-tags"

describe("getCanonicalUrl", () => {
  it("returns full URL for path", () => {
    expect(getCanonicalUrl("/projects")).toBe("https://portfolio-site.onrender.com/projects")
  })
})

describe("getPageMeta", () => {
  it("returns specific meta for known routes", () => {
    const meta = getPageMeta("/blog")
    expect(meta.title).toContain("Blog")
    expect(meta.path).toBe("/blog")
  })

  it("returns default meta for unknown routes", () => {
    const meta = getPageMeta("/unknown-page")
    expect(meta.title).toContain("Portfolio")
  })
})

describe("buildOpenGraphTags", () => {
  it("includes required og tags", () => {
    const tags = buildOpenGraphTags({
      title: "Test",
      description: "Desc",
      path: "/test",
    })
    expect(tags["og:title"]).toBe("Test")
    expect(tags["og:description"]).toBe("Desc")
    expect(tags["og:url"]).toContain("/test")
    expect(tags["og:type"]).toBe("website")
  })
})

describe("buildTwitterCardTags", () => {
  it("includes summary_large_image card type", () => {
    const tags = buildTwitterCardTags({
      title: "Test",
      description: "Desc",
      path: "/test",
    })
    expect(tags["twitter:card"]).toBe("summary_large_image")
  })
})
