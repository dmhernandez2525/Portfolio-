import type { AnalyticsEvent, AnalyticsEventType, AnalyticsGoalType, AnalyticsRange } from "@/types/analytics"

const STORAGE_KEY = "portfolio_analytics_events_v1"
const VISITOR_KEY = "portfolio_visitor_id"
const SESSION_KEY = "portfolio_session_id"
const SESSION_STARTED_KEY = "portfolio_session_started"
const MAX_EVENTS = 6000

interface KeyValueStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

const memoryData = new Map<string, string>()
const memorySessionData = new Map<string, string>()

const memoryStorage: KeyValueStorage = {
  getItem: (key) => memoryData.get(key) ?? null,
  setItem: (key, value) => {
    memoryData.set(key, value)
  },
  removeItem: (key) => {
    memoryData.delete(key)
  },
}

const memorySessionStorage: KeyValueStorage = {
  getItem: (key) => memorySessionData.get(key) ?? null,
  setItem: (key, value) => {
    memorySessionData.set(key, value)
  },
  removeItem: (key) => {
    memorySessionData.delete(key)
  },
}

function isStorageLike(value: unknown): value is KeyValueStorage {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<KeyValueStorage>
  return (
    typeof candidate.getItem === "function" &&
    typeof candidate.setItem === "function" &&
    typeof candidate.removeItem === "function"
  )
}

function getPersistentStorage(): KeyValueStorage {
  if (typeof window !== "undefined" && isStorageLike(window.localStorage)) return window.localStorage
  if (typeof globalThis !== "undefined" && isStorageLike(globalThis.localStorage)) return globalThis.localStorage
  return memoryStorage
}

function getSessionStorageSafe(): KeyValueStorage {
  if (typeof window !== "undefined" && isStorageLike(window.sessionStorage)) return window.sessionStorage
  if (typeof globalThis !== "undefined" && isStorageLike(globalThis.sessionStorage)) return globalThis.sessionStorage
  return memorySessionStorage
}

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`
}

function ensureVisitorId(): string {
  const storage = getPersistentStorage()
  const existing = storage.getItem(VISITOR_KEY)
  if (existing) return existing
  const next = createId("visitor")
  storage.setItem(VISITOR_KEY, next)
  return next
}

function ensureSessionId(): string {
  const sessionStorage = getSessionStorageSafe()
  const existing = sessionStorage.getItem(SESSION_KEY)
  if (existing) return existing
  const next = createId("session")
  sessionStorage.setItem(SESSION_KEY, next)
  return next
}

function parseEvents(raw: string | null): AnalyticsEvent[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as AnalyticsEvent[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persist(events: AnalyticsEvent[]): void {
  const trimmed = events.slice(-MAX_EVENTS)
  getPersistentStorage().setItem(STORAGE_KEY, JSON.stringify(trimmed))
}

function appendEvent(event: AnalyticsEvent): AnalyticsEvent {
  const events = parseEvents(getPersistentStorage().getItem(STORAGE_KEY))
  events.push(event)
  persist(events)
  return event
}

export function trackAnalyticsEvent(params: {
  type: AnalyticsEventType
  path: string
  metadata?: Record<string, string | number | boolean>
}): AnalyticsEvent {
  const event: AnalyticsEvent = {
    id: createId("evt"),
    timestamp: new Date().toISOString(),
    visitorId: ensureVisitorId(),
    sessionId: ensureSessionId(),
    type: params.type,
    path: params.path,
    metadata: params.metadata,
  }

  return appendEvent(event)
}

export function trackSessionStart(path: string): void {
  const sessionStorage = getSessionStorageSafe()
  if (sessionStorage.getItem(SESSION_STARTED_KEY)) return
  sessionStorage.setItem(SESSION_STARTED_KEY, "1")
  trackAnalyticsEvent({ type: "session_start", path })
}

export function trackPageView(path: string, title?: string): void {
  trackSessionStart(path)
  trackAnalyticsEvent({ type: "page_view", path, metadata: title ? { title } : undefined })
}

export function trackScrollDepth(path: string, percent: number): void {
  trackAnalyticsEvent({
    type: "scroll_depth",
    path,
    metadata: { percent: Math.min(100, Math.max(0, Math.round(percent))) },
  })
}

export function trackClick(path: string, target: string): void {
  trackAnalyticsEvent({ type: "click", path, metadata: { target } })
}

export function trackTimeOnPage(path: string, seconds: number): void {
  trackAnalyticsEvent({ type: "time_on_page", path, metadata: { seconds: Math.max(0, Math.round(seconds)) } })
}

export function trackGoal(path: string, goal: AnalyticsGoalType): void {
  trackAnalyticsEvent({ type: "goal", path, metadata: { goal } })
}

export function getAnalyticsEvents(range?: AnalyticsRange): AnalyticsEvent[] {
  const events = parseEvents(getPersistentStorage().getItem(STORAGE_KEY))
  if (!range) return events

  const start = new Date(range.start).getTime()
  const end = new Date(range.end).getTime()
  return events.filter((event) => {
    const timestamp = new Date(event.timestamp).getTime()
    return timestamp >= start && timestamp <= end
  })
}

export function clearAnalyticsEvents(): void {
  getPersistentStorage().removeItem(STORAGE_KEY)
  getPersistentStorage().removeItem(VISITOR_KEY)
  getSessionStorageSafe().removeItem(SESSION_KEY)
  getSessionStorageSafe().removeItem(SESSION_STARTED_KEY)
}
