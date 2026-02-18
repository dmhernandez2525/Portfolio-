import type { BlogCategory, BlogPostMetadata } from "../types/blog"

export const BLOG_CATEGORIES: readonly BlogCategory[] = [
  "Engineering",
  "Philosophy",
  "Projects",
  "Life",
] as const

export const BLOG_PAGE_SIZES: readonly number[] = [10, 20, 50] as const

export const BLOG_POST_METADATA: readonly BlogPostMetadata[] = [
  {
    id: "building-without-degree",
    title: "Building a Tech Career Without a Degree",
    excerpt:
      "How consistent output and proof-of-work can outperform credentials in a hiring market focused on results.",
    category: "Engineering",
    tags: ["career", "self-taught", "portfolio", "engineering"],
    author: "Daniel Hernandez",
    date: "2024-12-15",
    lastUpdated: "2026-02-15",
    featured: true,
  },
  {
    id: "systems-thinking-real-world",
    title: "Systems Thinking in the Real World",
    excerpt:
      "A practical framework for identifying leverage points instead of repeatedly treating symptoms.",
    category: "Philosophy",
    tags: ["systems", "architecture", "debugging", "performance"],
    author: "Daniel Hernandez",
    date: "2024-11-28",
    lastUpdated: "2026-02-15",
  },
  {
    id: "why-i-build-tools",
    title: "Why I Build Tools Instead of Products",
    excerpt: "Why reusable systems compound impact faster than single-path product bets.",
    category: "Philosophy",
    tags: ["product", "tooling", "strategy", "engineering"],
    author: "Daniel Hernandez",
    date: "2024-11-10",
    lastUpdated: "2026-02-15",
  },
  {
    id: "vr-game-development",
    title: "Building VR Games as a Solo Developer",
    excerpt: "Lessons from building immersive gameplay while balancing comfort and frame-time budgets.",
    category: "Projects",
    tags: ["vr", "game-dev", "performance", "design"],
    author: "Daniel Hernandez",
    date: "2024-10-22",
    lastUpdated: "2026-02-15",
  },
  {
    id: "parenting-and-engineering",
    title: "What Parenting Taught Me About Engineering",
    excerpt: "How parenting principles map directly to resilient systems and healthier team dynamics.",
    category: "Life",
    tags: ["leadership", "systems", "team", "life"],
    author: "Daniel Hernandez",
    date: "2024-09-15",
    lastUpdated: "2026-02-15",
  },
]
