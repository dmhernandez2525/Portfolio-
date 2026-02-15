export type AnalyticsEventType =
  | "page_view"
  | "scroll_depth"
  | "click"
  | "time_on_page"
  | "goal"
  | "session_start"

export type AnalyticsGoalType = "resume_download" | "contact_submission" | "game_play"

export interface AnalyticsEvent {
  id: string
  timestamp: string
  visitorId: string
  sessionId: string
  type: AnalyticsEventType
  path: string
  metadata?: Record<string, string | number | boolean>
}

export interface AnalyticsRange {
  start: string
  end: string
}

export interface AnalyticsSummary {
  pageViews: number
  uniqueVisitors: number
  sessions: number
  activeVisitors: number
}

export interface FunnelStep {
  id: "landing" | "projects" | "contact"
  label: string
  visitors: number
}

export interface ContentStat {
  path: string
  views: number
}

export interface GoalStat {
  goal: AnalyticsGoalType
  count: number
}

export interface AnalyticsReport {
  summary: AnalyticsSummary
  funnel: FunnelStep[]
  topContent: ContentStat[]
  topGames: ContentStat[]
  goals: GoalStat[]
  averageScrollDepth: number
  averageTimeOnPageSeconds: number
}
