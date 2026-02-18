import buildingWithoutDegreeContent from "@/content/blog/building-without-degree.md?raw"
import systemsThinkingContent from "@/content/blog/systems-thinking-real-world.md?raw"
import whyIBuildToolsContent from "@/content/blog/why-i-build-tools.md?raw"
import vrGameDevelopmentContent from "@/content/blog/vr-game-development.md?raw"
import parentingEngineeringContent from "@/content/blog/parenting-and-engineering.md?raw"
import { BLOG_POST_METADATA } from "@/data/blog-metadata"
import { calculateReadTime, countWords } from "@/lib/blog-utils"
import type { BlogPost, BlogPostMetadata } from "@/types/blog"

export type { BlogCategory, BlogPost } from "@/types/blog"
export { BLOG_CATEGORIES, BLOG_PAGE_SIZES } from "@/data/blog-metadata"

const BLOG_CONTENT_BY_ID: Record<string, string> = {
  "building-without-degree": buildingWithoutDegreeContent,
  "systems-thinking-real-world": systemsThinkingContent,
  "why-i-build-tools": whyIBuildToolsContent,
  "vr-game-development": vrGameDevelopmentContent,
  "parenting-and-engineering": parentingEngineeringContent,
}

function createBlogPost(metadata: BlogPostMetadata): BlogPost {
  const content = BLOG_CONTENT_BY_ID[metadata.id]

  return {
    ...metadata,
    content,
    readTime: calculateReadTime(content),
    wordCount: countWords(content),
  }
}

export const blogPosts: BlogPost[] = BLOG_POST_METADATA
  .map(createBlogPost)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

export const blogTags: string[] = Array.from(
  new Set(blogPosts.flatMap((post) => post.tags).map((tag) => tag.toLowerCase())),
).sort((a, b) => a.localeCompare(b))
