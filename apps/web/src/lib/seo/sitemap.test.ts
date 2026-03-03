import { describe, expect, it } from "vitest"
import { generateRobotsTxt, generateSitemapXml } from "@/lib/seo/sitemap"

describe("generateSitemapXml", () => {
  it("produces valid XML with static routes", () => {
    const xml = generateSitemapXml()
    expect(xml).toContain('<?xml version="1.0"')
    expect(xml).toContain("<urlset")
    expect(xml).toContain("<loc>https://portfolio-site.onrender.com/</loc>")
    expect(xml).toContain("<loc>https://portfolio-site.onrender.com/projects</loc>")
  })

  it("includes project slugs when provided", () => {
    const xml = generateSitemapXml(["my-project", "another-project"])
    expect(xml).toContain("/projects/my-project")
    expect(xml).toContain("/projects/another-project")
  })
})

describe("generateRobotsTxt", () => {
  it("allows all crawlers and includes sitemap", () => {
    const txt = generateRobotsTxt()
    expect(txt).toContain("User-agent: *")
    expect(txt).toContain("Allow: /")
    expect(txt).toContain("Sitemap:")
  })
})
