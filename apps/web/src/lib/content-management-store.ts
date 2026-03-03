import { CONTENT_TEMPLATES } from "@/data/content-templates"
import type { ContentAuditItem, ContentPostRecord, ContentTemplate, MediaAsset } from "@/types/content-management"

const POSTS_KEY = "content_management_posts_v1"
const MEDIA_KEY = "content_management_media_v1"
const DRAFT_KEY_PREFIX = "content_management_draft_"

interface StorageLike {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

const memoryData = new Map<string, string>()
const memoryStorage: StorageLike = {
  getItem: (key) => memoryData.get(key) ?? null,
  setItem: (key, value) => {
    memoryData.set(key, value)
  },
  removeItem: (key) => {
    memoryData.delete(key)
  },
}

function isStorageLike(value: unknown): value is StorageLike {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<StorageLike>
  return typeof candidate.getItem === "function" && typeof candidate.setItem === "function" && typeof candidate.removeItem === "function"
}

function getStorage(): StorageLike {
  if (typeof window !== "undefined" && isStorageLike(window.localStorage)) return window.localStorage
  if (typeof globalThis !== "undefined" && isStorageLike(globalThis.localStorage)) return globalThis.localStorage
  return memoryStorage
}

function nowIso(): string {
  return new Date().toISOString()
}

function parsePosts(raw: string | null): ContentPostRecord[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as ContentPostRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function parseMedia(raw: string | null): MediaAsset[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as MediaAsset[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistPosts(posts: ContentPostRecord[]): ContentPostRecord[] {
  const sorted = [...posts].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  getStorage().setItem(POSTS_KEY, JSON.stringify(sorted))
  return sorted
}

function persistMedia(mediaAssets: MediaAsset[]): MediaAsset[] {
  const sorted = [...mediaAssets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  getStorage().setItem(MEDIA_KEY, JSON.stringify(sorted))
  return sorted
}

function seedPostFromTemplate(template: ContentTemplate, sessionId: string): ContentPostRecord {
  const createdAt = nowIso()
  const slugBase = `${template.id}-${Date.now()}`
  return {
    id: `post-${Date.now()}`,
    slug: slugBase,
    title: `${template.label} Draft`,
    excerpt: template.markdown.split("\n")[0] ?? "",
    markdown: template.markdown,
    status: "draft",
    category: template.defaultCategory,
    tags: [...template.defaultTags],
    seo: {
      metaTitle: `${template.label} Draft`,
      metaDescription: "Draft meta description",
      ogTitle: `${template.label} Draft`,
      ogDescription: "Draft social description",
    },
    analytics: {
      views: 0,
      readingCompletionRate: 0,
      shares: 0,
    },
    createdAt,
    updatedAt: createdAt,
    revision: 1,
    editorSessionId: sessionId,
  }
}

export function getContentPosts(): ContentPostRecord[] {
  return parsePosts(getStorage().getItem(POSTS_KEY))
}

export function getMediaAssets(): MediaAsset[] {
  return parseMedia(getStorage().getItem(MEDIA_KEY))
}

export function createPostFromTemplate(templateId: string, sessionId: string): ContentPostRecord | null {
  const template = CONTENT_TEMPLATES.find((item) => item.id === templateId)
  if (!template) return null
  const post = seedPostFromTemplate(template, sessionId)
  persistPosts([post, ...getContentPosts()])
  return post
}

export function savePostWithConflictCheck(params: {
  postId: string
  expectedRevision: number
  sessionId: string
  patch: Partial<ContentPostRecord>
}): { post: ContentPostRecord | null; conflict: ContentPostRecord | null } {
  const posts = getContentPosts()
  const current = posts.find((post) => post.id === params.postId)
  if (!current) return { post: null, conflict: null }
  if (current.revision !== params.expectedRevision) return { post: null, conflict: current }

  const updated: ContentPostRecord = {
    ...current,
    ...params.patch,
    updatedAt: nowIso(),
    revision: current.revision + 1,
    editorSessionId: params.sessionId,
  }

  persistPosts(posts.map((post) => (post.id === current.id ? updated : post)))
  return { post: updated, conflict: null }
}

export function schedulePost(postId: string, isoDate: string): ContentPostRecord | null {
  const posts = getContentPosts()
  const current = posts.find((post) => post.id === postId)
  if (!current) return null
  const updated = {
    ...current,
    status: "scheduled" as const,
    scheduledFor: isoDate,
    updatedAt: nowIso(),
    revision: current.revision + 1,
  }
  persistPosts(posts.map((post) => (post.id === postId ? updated : post)))
  return updated
}

export function publishScheduledPosts(now = new Date()): ContentPostRecord[] {
  const posts = getContentPosts()
  const timestamp = now.getTime()
  const updated = posts.map((post) => {
    if (post.status !== "scheduled" || !post.scheduledFor) return post
    if (new Date(post.scheduledFor).getTime() > timestamp) return post
    return {
      ...post,
      status: "published" as const,
      publishedAt: nowIso(),
      updatedAt: nowIso(),
      revision: post.revision + 1,
    }
  })
  return persistPosts(updated)
}

export function addMediaAsset(asset: MediaAsset): MediaAsset[] {
  return persistMedia([asset, ...getMediaAssets()])
}

export function removeMediaAsset(assetId: string): MediaAsset[] {
  return persistMedia(getMediaAssets().filter((asset) => asset.id !== assetId))
}

export function saveDraftAuto(postId: string, markdown: string, sessionId: string): void {
  const key = `${DRAFT_KEY_PREFIX}${postId}`
  getStorage().setItem(
    key,
    JSON.stringify({
      markdown,
      sessionId,
      savedAt: nowIso(),
    }),
  )
}

export function getDraftAuto(postId: string): { markdown: string; sessionId: string; savedAt: string } | null {
  const key = `${DRAFT_KEY_PREFIX}${postId}`
  const raw = getStorage().getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as { markdown: string; sessionId: string; savedAt: string }
  } catch {
    return null
  }
}

export function buildContentAudit(posts: ContentPostRecord[]): ContentAuditItem[] {
  const staleThreshold = Date.now() - 90 * 24 * 60 * 60 * 1000
  return posts
    .map((post) => {
      const reasons: string[] = []
      if (new Date(post.updatedAt).getTime() < staleThreshold) reasons.push("Outdated (90+ days)")
      if (post.analytics.views < 50) reasons.push("Low views")
      if (post.analytics.readingCompletionRate < 35) reasons.push("Low completion rate")
      return { postId: post.id, title: post.title, reasons }
    })
    .filter((item) => item.reasons.length > 0)
}

export function clearContentManagementStore(): void {
  getStorage().removeItem(POSTS_KEY)
  getStorage().removeItem(MEDIA_KEY)
}
