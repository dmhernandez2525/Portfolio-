import type { ResumeDownloadEvent, ResumeExportFormat, ResumePresetId, ResumeVersionId } from "@/types/resume"

const STORAGE_KEY = "resume_download_events"
const MAX_EVENTS = 100

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
  if (typeof window !== "undefined" && isStorageLike(window.localStorage)) {
    return window.localStorage
  }

  if (typeof globalThis !== "undefined" && isStorageLike(globalThis.localStorage)) {
    return globalThis.localStorage
  }

  return memoryStorage
}

function parseEvents(rawValue: string | null): ResumeDownloadEvent[] {
  if (!rawValue) return []

  try {
    const parsed = JSON.parse(rawValue) as ResumeDownloadEvent[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function getResumeDownloadEvents(): ResumeDownloadEvent[] {
  return parseEvents(getStorage().getItem(STORAGE_KEY))
}

export function trackResumeDownload(params: {
  format: ResumeExportFormat
  versionId: ResumeVersionId
  presetId: ResumePresetId
}): ResumeDownloadEvent {
  const event: ResumeDownloadEvent = {
    id: `${Date.now()}-${params.format}`,
    format: params.format,
    versionId: params.versionId,
    presetId: params.presetId,
    timestamp: new Date().toISOString(),
  }

  const currentEvents = getResumeDownloadEvents()
  const nextEvents = [event, ...currentEvents].slice(0, MAX_EVENTS)
  getStorage().setItem(STORAGE_KEY, JSON.stringify(nextEvents))

  return event
}

export function clearResumeDownloadEvents(): void {
  getStorage().removeItem(STORAGE_KEY)
}
