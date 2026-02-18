export type BlogCategory = "Engineering" | "Philosophy" | "Projects" | "Life"

export interface BlogPostMetadata {
  id: string
  title: string
  excerpt: string
  category: BlogCategory
  tags: string[]
  author: string
  date: string
  lastUpdated: string
  featured?: boolean
}

export interface BlogPost extends BlogPostMetadata {
  content: string
  readTime: number
  wordCount: number
}

export type BlogCategoryFilter = BlogCategory | "All"

export interface BlogFilters {
  query: string
  category: BlogCategoryFilter
  tag: string
}

export interface BlogPagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface PaginatedBlogPosts {
  items: BlogPost[]
  pagination: BlogPagination
}

export interface TocHeading {
  id: string
  level: number
  text: string
}

export interface RssOptions {
  siteUrl: string
  feedPath: string
  title: string
  description: string
  language: string
}
