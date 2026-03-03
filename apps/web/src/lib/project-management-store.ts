import { PROJECT_TEMPLATES } from "@/data/admin-project-templates"
import { projectsData } from "@/data/projects"
import type {
  ManagedProjectRecord,
  ManagedProjectSnapshot,
  ManagedProjectStatus,
  ManagedProjectVersion,
  NewManagedProjectInput,
} from "@/types/admin-project"
const STORAGE_KEY = "portfolio_project_management_v1"
const MAX_VERSIONS_PER_PROJECT = 15
interface StorageLike {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}
const memoryStorageData = new Map<string, string>()
const memoryStorage: StorageLike = {
  getItem: (key) => memoryStorageData.get(key) ?? null,
  setItem: (key, value) => {
    memoryStorageData.set(key, value)
  },
  removeItem: (key) => {
    memoryStorageData.delete(key)
  },
}
function isStorageLike(value: unknown): value is StorageLike {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<StorageLike>
  return (
    typeof candidate.getItem === "function" &&
    typeof candidate.setItem === "function" &&
    typeof candidate.removeItem === "function"
  )
}
function getStorage(): StorageLike {
  if (typeof window !== "undefined" && isStorageLike(window.localStorage)) return window.localStorage
  if (typeof globalThis !== "undefined" && isStorageLike(globalThis.localStorage)) return globalThis.localStorage
  return memoryStorage
}
function nowIso(): string { return new Date().toISOString() }

function snapshotFromRecord(record: ManagedProjectRecord): ManagedProjectSnapshot {
  return {
    title: record.title,
    slug: record.slug,
    shortDescription: record.shortDescription,
    detailsMarkdown: record.detailsMarkdown,
    problem: record.problem,
    approach: record.approach,
    solution: record.solution,
    results: record.results,
    techStack: [...record.techStack],
    tags: [...record.tags],
    status: record.status,
    githubRepo: record.githubRepo,
    liveDemoUrl: record.liveDemoUrl,
    images: [...record.images],
    analytics: { ...record.analytics },
    templateId: record.templateId,
  }
}

function newVersion(snapshot: ManagedProjectSnapshot): ManagedProjectVersion {
  const savedAt = nowIso()
  return {
    id: `v-${Date.now()}`,
    label: `Version ${savedAt.slice(0, 10)} ${savedAt.slice(11, 16)}`,
    savedAt,
    snapshot,
  }
}

function seedProjects(): ManagedProjectRecord[] {
  return projectsData.slice(0, 8).map((project, index) => {
    const createdAt = nowIso()
    const snapshot: ManagedProjectSnapshot = {
      title: project.title,
      slug: project.id,
      shortDescription: project.tagline,
      detailsMarkdown: `## Overview\n\n${project.description}`,
      problem: project.description,
      approach: `Designed and built using ${project.tech.slice(0, 5).join(", ")}.`,
      solution: project.features?.[0] ?? "Production-ready implementation delivered.",
      results: project.metrics ?? "Shipped and documented with measurable output.",
      techStack: [...project.tech],
      tags: [project.category.toLowerCase(), project.status],
      status: project.status === "production" ? "published" : "draft",
      githubRepo: project.github,
      liveDemoUrl: project.link,
      images: [],
      analytics: {
        views: Math.max(100, 1300 - index * 80),
        clicks: Math.max(20, 450 - index * 30),
        avgTimeSeconds: Math.max(35, 110 - index * 6),
      },
    }

    return {
      id: `managed-${project.id}`,
      order: index,
      createdAt,
      updatedAt: createdAt,
      versions: [],
      ...snapshot,
    }
  })
}

function normalize(records: ManagedProjectRecord[]): ManagedProjectRecord[] {
  return [...records]
    .sort((a, b) => a.order - b.order)
    .map((record, index) => ({
      ...record,
      order: index,
    }))
}

function parse(raw: string | null): ManagedProjectRecord[] {
  if (!raw) return seedProjects()

  try {
    const parsed = JSON.parse(raw) as ManagedProjectRecord[]
    if (!Array.isArray(parsed) || parsed.length === 0) return seedProjects()
    return normalize(parsed)
  } catch {
    return seedProjects()
  }
}

function persist(records: ManagedProjectRecord[]): ManagedProjectRecord[] {
  const normalized = normalize(records)
  getStorage().setItem(STORAGE_KEY, JSON.stringify(normalized))
  return normalized
}

export function getManagedProjects(): ManagedProjectRecord[] {
  const parsed = parse(getStorage().getItem(STORAGE_KEY))
  if (!getStorage().getItem(STORAGE_KEY)) return persist(parsed)
  return parsed
}

export function resetManagedProjectsStore(): void {
  getStorage().removeItem(STORAGE_KEY)
}
export function createProjectFromTemplate(templateId: string): ManagedProjectRecord | null {
  const template = PROJECT_TEMPLATES.find((item) => item.id === templateId)
  if (!template) return null

  const records = getManagedProjects()
  const createdAt = nowIso()
  const idSuffix = Date.now()
  const slug = `${template.id}-${idSuffix}`
  const nextRecord: ManagedProjectRecord = {
    id: `managed-${slug}`,
    order: records.length,
    createdAt,
    updatedAt: createdAt,
    title: `${template.label} Project`,
    slug,
    shortDescription: template.summary,
    detailsMarkdown: `## ${template.label}\n\n${template.summary}`,
    problem: template.defaultCaseStudy.problem,
    approach: template.defaultCaseStudy.approach,
    solution: template.defaultCaseStudy.solution,
    results: template.defaultCaseStudy.results,
    techStack: [],
    tags: [...template.defaultTags],
    status: "draft",
    images: [],
    analytics: { views: 0, clicks: 0, avgTimeSeconds: 0 },
    versions: [],
    templateId: template.id,
  }

  persist([...records, nextRecord])
  return nextRecord
}
export function createManagedProject(input: NewManagedProjectInput): ManagedProjectRecord {
  const records = getManagedProjects()
  const timestamp = nowIso()
  const next: ManagedProjectRecord = {
    id: `managed-${Date.now()}`,
    order: records.length,
    createdAt: timestamp,
    updatedAt: timestamp,
    versions: [],
    images: input.images ?? [],
    analytics: input.analytics ?? { views: 0, clicks: 0, avgTimeSeconds: 0 },
    ...input,
  }

  persist([...records, next])
  return next
}
export function updateManagedProject(id: string, patch: Partial<ManagedProjectSnapshot>): ManagedProjectRecord | null {
  const records = getManagedProjects()
  const existing = records.find((record) => record.id === id)
  if (!existing) return null

  const previousSnapshot = snapshotFromRecord(existing)
  const nextVersions = [newVersion(previousSnapshot), ...existing.versions].slice(0, MAX_VERSIONS_PER_PROJECT)
  const updated: ManagedProjectRecord = {
    ...existing,
    ...patch,
    updatedAt: nowIso(),
    versions: nextVersions,
  }

  persist(records.map((record) => (record.id === id ? updated : record)))
  return updated
}
export function bulkUpdateProjectStatus(ids: string[], status: ManagedProjectStatus): ManagedProjectRecord[] {
  const idSet = new Set(ids)
  const records = getManagedProjects()
  return persist(
    records.map((record) =>
      idSet.has(record.id)
        ? {
            ...record,
            status,
            updatedAt: nowIso(),
          }
        : record,
    ),
  )
}
export function reorderManagedProjects(draggedId: string, targetId: string): ManagedProjectRecord[] {
  const records = getManagedProjects()
  const draggedIndex = records.findIndex((record) => record.id === draggedId)
  const targetIndex = records.findIndex((record) => record.id === targetId)
  if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) return records

  const next = [...records]
  const [dragged] = next.splice(draggedIndex, 1)
  next.splice(targetIndex, 0, dragged)
  const reindexed = next.map((record, index) => ({
    ...record,
    order: index,
  }))
  return persist(reindexed)
}
export function rollbackManagedProjectVersion(projectId: string, versionId: string): ManagedProjectRecord | null {
  const records = getManagedProjects()
  const project = records.find((record) => record.id === projectId)
  if (!project) return null

  const version = project.versions.find((item) => item.id === versionId)
  if (!version) return null

  const restored: ManagedProjectRecord = {
    ...project,
    ...version.snapshot,
    updatedAt: nowIso(),
  }
  persist(records.map((record) => (record.id === projectId ? restored : record)))
  return restored
}
export async function importProjectFromGithub(repoPath: string): Promise<Partial<ManagedProjectSnapshot> | null> {
  const trimmed = repoPath.trim().replace(/^https:\/\/github\.com\//, "")
  if (!trimmed.includes("/")) return null

  try {
    const response = await fetch(`https://api.github.com/repos/${trimmed}`)
    if (!response.ok) return null
    const repo = (await response.json()) as {
      name: string
      description: string | null
      html_url: string
      homepage: string | null
    }

    const langResponse = await fetch(`https://api.github.com/repos/${trimmed}/languages`)
    const languages = langResponse.ok ? ((await langResponse.json()) as Record<string, number>) : {}

    return {
      title: repo.name,
      slug: repo.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      shortDescription: repo.description ?? "Imported from GitHub repository metadata.",
      detailsMarkdown: `## ${repo.name}\n\n${repo.description ?? "Imported from GitHub."}`,
      techStack: Object.keys(languages),
      githubRepo: repo.html_url,
      liveDemoUrl: repo.homepage ?? undefined,
    }
  } catch {
    return null
  }
}
