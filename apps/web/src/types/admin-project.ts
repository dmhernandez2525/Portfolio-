export type ManagedProjectStatus = "draft" | "published" | "archived"

export interface ManagedProjectImage {
  id: string
  name: string
  dataUrl: string
  width: number
  height: number
  compressedSizeKb: number
}

export interface ManagedProjectAnalytics {
  views: number
  clicks: number
  avgTimeSeconds: number
}

export interface ManagedProjectTemplate {
  id: string
  label: string
  summary: string
  defaultTags: string[]
  defaultCaseStudy: {
    problem: string
    approach: string
    solution: string
    results: string
  }
}

export interface ManagedProjectSnapshot {
  title: string
  slug: string
  shortDescription: string
  detailsMarkdown: string
  problem: string
  approach: string
  solution: string
  results: string
  techStack: string[]
  tags: string[]
  status: ManagedProjectStatus
  githubRepo?: string
  liveDemoUrl?: string
  images: ManagedProjectImage[]
  analytics: ManagedProjectAnalytics
  templateId?: string
}

export interface ManagedProjectVersion {
  id: string
  label: string
  savedAt: string
  snapshot: ManagedProjectSnapshot
}

export interface ManagedProjectRecord extends ManagedProjectSnapshot {
  id: string
  order: number
  createdAt: string
  updatedAt: string
  versions: ManagedProjectVersion[]
}

export interface NewManagedProjectInput extends Omit<ManagedProjectSnapshot, "analytics" | "images"> {
  images?: ManagedProjectImage[]
  analytics?: ManagedProjectAnalytics
}
