import { describe, expect, it } from "vitest"
import { buildBreadcrumbJsonLd, buildPersonJsonLd, buildWebSiteJsonLd } from "@/lib/seo/structured-data"

describe("buildPersonJsonLd", () => {
  it("produces valid Person schema", () => {
    const json = buildPersonJsonLd({
      name: "Test User",
      jobTitle: "Developer",
      url: "https://example.com",
      sameAs: ["https://github.com/test"],
    })
    const parsed = JSON.parse(json)
    expect(parsed["@type"]).toBe("Person")
    expect(parsed.name).toBe("Test User")
    expect(parsed.sameAs).toContain("https://github.com/test")
  })
})

describe("buildWebSiteJsonLd", () => {
  it("produces valid WebSite schema with search action", () => {
    const json = buildWebSiteJsonLd("My Site", "https://example.com")
    const parsed = JSON.parse(json)
    expect(parsed["@type"]).toBe("WebSite")
    expect(parsed.potentialAction["@type"]).toBe("SearchAction")
  })
})

describe("buildBreadcrumbJsonLd", () => {
  it("produces BreadcrumbList with correct positions", () => {
    const json = buildBreadcrumbJsonLd([
      { name: "Home", url: "https://example.com" },
      { name: "Projects", url: "https://example.com/projects" },
    ])
    const parsed = JSON.parse(json)
    expect(parsed["@type"]).toBe("BreadcrumbList")
    expect(parsed.itemListElement).toHaveLength(2)
    expect(parsed.itemListElement[0].position).toBe(1)
    expect(parsed.itemListElement[1].position).toBe(2)
  })
})
