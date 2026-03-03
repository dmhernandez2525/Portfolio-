import { DEFAULT_TESTIMONIALS } from "@/data/testimonials"
import type { NewTestimonialInput, TestimonialRecord, UpdateTestimonialInput } from "@/types/testimonials"

const STORAGE_KEY = "portfolio_testimonials_v1"

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

function normalizeRecord(input: TestimonialRecord, fallbackOrder: number): TestimonialRecord {
  const rating = Number.isFinite(input.rating) ? Math.max(1, Math.min(5, Math.round(input.rating))) : 5

  return {
    ...input,
    rating,
    tags: Array.isArray(input.tags) ? input.tags.filter(Boolean) : [],
    order: Number.isFinite(input.order) ? input.order : fallbackOrder,
  }
}

function normalizeRecords(records: TestimonialRecord[]): TestimonialRecord[] {
  return records
    .map((record, index) => normalizeRecord(record, index))
    .sort((a, b) => a.order - b.order)
    .map((record, index) => ({ ...record, order: index }))
}

function persist(records: TestimonialRecord[]): TestimonialRecord[] {
  const normalized = normalizeRecords(records)
  getStorage().setItem(STORAGE_KEY, JSON.stringify(normalized))
  return normalized
}

function parseRecords(rawValue: string | null): TestimonialRecord[] {
  if (!rawValue) return DEFAULT_TESTIMONIALS

  try {
    const parsed = JSON.parse(rawValue) as TestimonialRecord[]
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_TESTIMONIALS
    return normalizeRecords(parsed)
  } catch {
    return DEFAULT_TESTIMONIALS
  }
}

function withTimestamp(record: TestimonialRecord): TestimonialRecord {
  return {
    ...record,
    updatedAt: new Date().toISOString(),
  }
}

function loadAllRecords(): TestimonialRecord[] {
  const records = parseRecords(getStorage().getItem(STORAGE_KEY))
  if (!getStorage().getItem(STORAGE_KEY)) {
    return persist(records)
  }
  return records
}

export function getAllTestimonials(): TestimonialRecord[] {
  return loadAllRecords()
}

export function getPublishedTestimonials(): TestimonialRecord[] {
  return loadAllRecords().filter((record) => record.approved)
}

export function createTestimonial(input: NewTestimonialInput): TestimonialRecord {
  const records = loadAllRecords()
  const timestamp = new Date().toISOString()
  const next: TestimonialRecord = {
    id: `tm-${Date.now()}`,
    createdAt: timestamp,
    updatedAt: timestamp,
    order: records.length,
    ...input,
    rating: Math.max(1, Math.min(5, Math.round(input.rating))),
    tags: input.tags.filter(Boolean),
  }

  persist([...records, next])
  return next
}

export function updateTestimonial(input: UpdateTestimonialInput): TestimonialRecord | null {
  const records = loadAllRecords()
  const existing = records.find((record) => record.id === input.id)
  if (!existing) return null

  const merged: TestimonialRecord = withTimestamp({
    ...existing,
    ...input,
    rating:
      input.rating === undefined
        ? existing.rating
        : Math.max(1, Math.min(5, Math.round(input.rating))),
    tags: input.tags ? input.tags.filter(Boolean) : existing.tags,
  })

  persist(records.map((record) => (record.id === input.id ? merged : record)))
  return merged
}

export function deleteTestimonial(id: string): boolean {
  const records = loadAllRecords()
  const next = records.filter((record) => record.id !== id)
  if (next.length === records.length) return false
  persist(next)
  return true
}

export function moveTestimonial(id: string, direction: "up" | "down"): TestimonialRecord[] {
  const records = loadAllRecords()
  const index = records.findIndex((record) => record.id === id)
  if (index === -1) return records

  const targetIndex = direction === "up" ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= records.length) return records

  const next = [...records]
  const current = next[index]
  next[index] = next[targetIndex]
  next[targetIndex] = current
  const reindexed = next.map((record, recordIndex) => ({
    ...record,
    order: recordIndex,
  }))
  return persist(reindexed)
}

export function replaceTestimonials(records: TestimonialRecord[]): TestimonialRecord[] {
  return persist(records)
}

export function resetTestimonialsStore(): void {
  getStorage().removeItem(STORAGE_KEY)
}
