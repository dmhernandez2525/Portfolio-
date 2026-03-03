export type ContentPostStatus = "draft" | "scheduled" | "published" | "archived"

export type MediaAssetType = "image" | "video" | "document"

export interface SeoMetadata {
  metaTitle: string
  metaDescription: string
  ogTitle: string
  ogDescription: string
  ogImage?: string
}

export interface ContentAnalytics {
  views: number
  readingCompletionRate: number
  shares: number
}

export interface ContentPostRecord {
  id: string
  slug: string
  title: string
  excerpt: string
  markdown: string
  status: ContentPostStatus
  category: string
  tags: string[]
  seo: SeoMetadata
  analytics: ContentAnalytics
  scheduledFor?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
  revision: number
  editorSessionId: string
}

export interface MediaAsset {
  id: string
  type: MediaAssetType
  name: string
  url: string
  sizeKb: number
  createdAt: string
}

export interface ContentTemplate {
  id: string
  label: string
  markdown: string
  defaultCategory: string
  defaultTags: string[]
}

export interface ContentAuditItem {
  postId: string
  title: string
  reasons: string[]
}
