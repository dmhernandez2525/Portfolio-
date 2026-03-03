import type {
  BlogFilters,
  BlogPost,
  PaginatedBlogPosts,
  RssOptions,
  TocHeading,
} from "@/types/blog"

const WORDS_PER_MINUTE = 200
const HEADING_PATTERN = /^(#{1,6})\s+(.+)$/gm

export function stripMarkdown(markdown: string): string {
  const withoutCodeBlocks = markdown.replace(/```[\s\S]*?```/g, " ")
  const withoutInlineCode = withoutCodeBlocks.replace(/`([^`]+)`/g, "$1")
  const withoutImages = withoutInlineCode.replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
  const withoutLinks = withoutImages.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
  const withoutFormatting = withoutLinks.replace(/[>#*_~\-|]/g, " ")

  return withoutFormatting.replace(/\s+/g, " ").trim()
}

export function countWords(markdown: string): number {
  const plainText = stripMarkdown(markdown)
  if (!plainText) return 0
  return plainText.split(/\s+/).length
}

export function calculateReadTime(markdown: string): number {
  const words = countWords(markdown)
  if (!words) return 1
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export function extractMarkdownHeadings(markdown: string): TocHeading[] {
  const headings: TocHeading[] = []
  const slugCounts = new Map<string, number>()

  for (const match of markdown.matchAll(HEADING_PATTERN)) {
    const hashes = match[1]
    const headingText = match[2]?.trim() ?? ""
    if (!hashes || !headingText) continue

    const baseSlug = slugifyHeading(headingText)
    const seenCount = slugCounts.get(baseSlug) ?? 0
    slugCounts.set(baseSlug, seenCount + 1)

    const uniqueSlug = seenCount > 0 ? `${baseSlug}-${seenCount + 1}` : baseSlug

    headings.push({
      id: uniqueSlug,
      level: hashes.length,
      text: headingText,
    })
  }

  return headings
}

function createSearchText(post: BlogPost): string {
  return [post.title, post.excerpt, post.content, post.tags.join(" ")].join(" ").toLowerCase()
}

export function filterBlogPosts(posts: BlogPost[], filters: BlogFilters): BlogPost[] {
  const normalizedQuery = filters.query.toLowerCase().trim()
  const normalizedTag = filters.tag.toLowerCase().trim()
  const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean)

  return posts.filter((post) => {
    if (filters.category !== "All" && post.category !== filters.category) {
      return false
    }

    if (normalizedTag && !post.tags.map((tag) => tag.toLowerCase()).includes(normalizedTag)) {
      return false
    }

    if (!queryTerms.length) {
      return true
    }

    const searchableText = createSearchText(post)
    return queryTerms.every((term) => searchableText.includes(term))
  })
}

export function paginateBlogPosts(posts: BlogPost[], page: number, pageSize: number): PaginatedBlogPosts {
  if (!posts.length) {
    return {
      items: [],
      pagination: {
        page: 1,
        pageSize,
        totalItems: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    }
  }

  const totalPages = Math.ceil(posts.length / pageSize)
  const boundedPage = Math.min(Math.max(page, 1), totalPages)
  const startIndex = (boundedPage - 1) * pageSize

  return {
    items: posts.slice(startIndex, startIndex + pageSize),
    pagination: {
      page: boundedPage,
      pageSize,
      totalItems: posts.length,
      totalPages,
      hasPreviousPage: boundedPage > 1,
      hasNextPage: boundedPage < totalPages,
    },
  }
}

export function getRelatedPosts(posts: BlogPost[], source: BlogPost, maxResults = 3): BlogPost[] {
  const sourceTags = new Set(source.tags.map((tag) => tag.toLowerCase()))

  return posts
    .filter((candidate) => candidate.id !== source.id)
    .map((candidate) => {
      const sharedTagCount = candidate.tags.reduce((count, tag) => {
        return sourceTags.has(tag.toLowerCase()) ? count + 1 : count
      }, 0)
      const sameCategoryBonus = candidate.category === source.category ? 1 : 0
      const score = sharedTagCount * 2 + sameCategoryBonus

      return { candidate, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return new Date(b.candidate.date).getTime() - new Date(a.candidate.date).getTime()
    })
    .slice(0, maxResults)
    .map((entry) => entry.candidate)
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function toRfc2822Date(isoDate: string): string {
  return new Date(isoDate).toUTCString()
}

export function buildBlogRssXml(posts: BlogPost[], options: RssOptions): string {
  const sortedPosts = posts
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const latestDate = sortedPosts[0]?.lastUpdated ?? sortedPosts[0]?.date ?? new Date().toISOString()
  const channelLink = `${options.siteUrl}${options.feedPath}`

  const itemsXml = sortedPosts
    .map((post) => {
      const postLink = `${options.siteUrl}/blog?post=${encodeURIComponent(post.id)}`
      const description = escapeXml(post.excerpt)

      return [
        "<item>",
        `<title>${escapeXml(post.title)}</title>`,
        `<link>${escapeXml(postLink)}</link>`,
        `<guid isPermaLink=\"false\">${escapeXml(post.id)}</guid>`,
        `<description>${description}</description>`,
        `<author>${escapeXml(post.author)}</author>`,
        `<category>${escapeXml(post.category)}</category>`,
        ...post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`),
        `<pubDate>${toRfc2822Date(post.date)}</pubDate>`,
        "</item>",
      ].join("")
    })
    .join("")

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "<channel>",
    `<title>${escapeXml(options.title)}</title>`,
    `<link>${escapeXml(channelLink)}</link>`,
    `<description>${escapeXml(options.description)}</description>`,
    `<language>${escapeXml(options.language)}</language>`,
    `<lastBuildDate>${toRfc2822Date(latestDate)}</lastBuildDate>`,
    itemsXml,
    "</channel>",
    "</rss>",
  ].join("")
}
