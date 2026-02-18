import { describe, expect, it } from "vitest"
import { blogPosts } from "@/data/blog"
import { BLOG_RSS_OPTIONS } from "@/data/blog-rss-options"
import {
  buildBlogRssXml,
  calculateReadTime,
  extractMarkdownHeadings,
  filterBlogPosts,
  paginateBlogPosts,
} from "@/lib/blog-utils"

describe("blog-utils", () => {
  it("calculates reading time at 200 words per minute", () => {
    const markdown = Array.from({ length: 401 }, () => "word").join(" ")
    expect(calculateReadTime(markdown)).toBe(3)
  })

  it("extracts heading structure for table of contents", () => {
    const markdown = "# Intro\n\n## Overview\n\n### Details"
    const headings = extractMarkdownHeadings(markdown)

    expect(headings).toEqual([
      { id: "intro", level: 1, text: "Intro" },
      { id: "overview", level: 2, text: "Overview" },
      { id: "details", level: 3, text: "Details" },
    ])
  })

  it("filters posts by full text query across title, content, and tags", () => {
    const titleMatch = filterBlogPosts(blogPosts, {
      query: "solo developer",
      category: "All",
      tag: "",
    })
    expect(titleMatch.map((post) => post.id)).toContain("vr-game-development")

    const tagMatch = filterBlogPosts(blogPosts, {
      query: "",
      category: "All",
      tag: "game-dev",
    })
    expect(tagMatch).toHaveLength(1)
    expect(tagMatch[0]?.id).toBe("vr-game-development")

    const contentMatch = filterBlogPosts(blogPosts, {
      query: "feedback loop",
      category: "All",
      tag: "",
    })
    expect(contentMatch.map((post) => post.id)).toContain("systems-thinking-real-world")
  })

  it("paginates and bounds out-of-range pages", () => {
    const pageOne = paginateBlogPosts(blogPosts, 1, 2)
    expect(pageOne.items).toHaveLength(2)
    expect(pageOne.pagination.totalPages).toBe(3)

    const outOfRange = paginateBlogPosts(blogPosts, 99, 2)
    expect(outOfRange.pagination.page).toBe(3)
    expect(outOfRange.items).toHaveLength(1)
  })

  it("generates RSS xml with one item per post", () => {
    const xml = buildBlogRssXml(blogPosts, BLOG_RSS_OPTIONS)

    expect(xml.startsWith("<?xml version=\"1.0\" encoding=\"UTF-8\"?>")).toBe(true)
    expect(xml.includes("<rss version=\"2.0\">")).toBe(true)
    expect((xml.match(/<item>/g) ?? []).length).toBe(blogPosts.length)
    expect(xml.includes("https://portfolio-site.onrender.com/blog?post=building-without-degree")).toBe(true)
  })
})
