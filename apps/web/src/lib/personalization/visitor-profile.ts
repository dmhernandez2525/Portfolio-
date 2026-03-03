/**
 * Visitor preference detection and personalized content ordering
 * based on browsing behavior, time spent, and visitor type.
 */

export interface PageVisit {
  path: string
  timeSpentMs: number
  timestamp: number
}

export interface VisitorProfile {
  visits: PageVisit[]
  totalTimeMs: number
  topSections: string[]
  detectedType: VisitorType
  interests: string[]
}

export type VisitorType = "recruiter" | "developer" | "designer" | "general"

export type IndustryView = "tech" | "design" | "business" | "general"

export interface ContentSection {
  id: string
  title: string
  relevance: Record<VisitorType, number>
}

const SECTION_RELEVANCE: ContentSection[] = [
  { id: "experience", title: "Experience", relevance: { recruiter: 10, developer: 6, designer: 5, general: 7 } },
  { id: "projects", title: "Projects", relevance: { recruiter: 7, developer: 10, designer: 8, general: 6 } },
  { id: "skills", title: "Skills", relevance: { recruiter: 9, developer: 8, designer: 6, general: 5 } },
  { id: "games", title: "Games", relevance: { recruiter: 2, developer: 7, designer: 4, general: 8 } },
  { id: "blog", title: "Blog", relevance: { recruiter: 4, developer: 8, designer: 6, general: 5 } },
  { id: "contact", title: "Contact", relevance: { recruiter: 8, developer: 5, designer: 5, general: 6 } },
  { id: "design", title: "Design", relevance: { recruiter: 3, developer: 4, designer: 10, general: 5 } },
]

const TYPE_SIGNALS: Record<string, VisitorType> = {
  "/resume": "recruiter",
  "/experience": "recruiter",
  "/skills": "recruiter",
  "/projects": "developer",
  "/blog": "developer",
  "/games": "developer",
  "/design": "designer",
}

export function trackPageVisit(
  visits: PageVisit[],
  path: string,
  timeSpentMs: number
): PageVisit[] {
  return [...visits, { path, timeSpentMs, timestamp: Date.now() }]
}

export function buildVisitorProfile(visits: PageVisit[]): VisitorProfile {
  const totalTimeMs = visits.reduce((sum, v) => sum + v.timeSpentMs, 0)

  const timeBySection = new Map<string, number>()
  for (const visit of visits) {
    const section = extractSection(visit.path)
    timeBySection.set(section, (timeBySection.get(section) ?? 0) + visit.timeSpentMs)
  }

  const topSections = [...timeBySection.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([section]) => section)

  const detectedType = detectVisitorType(visits)
  const interests = deriveInterests(visits)

  return { visits, totalTimeMs, topSections, detectedType, interests }
}

function extractSection(path: string): string {
  const parts = path.split("/").filter(Boolean)
  return parts[0] ?? "home"
}

export function detectVisitorType(visits: PageVisit[]): VisitorType {
  const typeScores = new Map<VisitorType, number>()

  for (const visit of visits) {
    const signal = TYPE_SIGNALS[visit.path]
    if (signal) {
      const current = typeScores.get(signal) ?? 0
      typeScores.set(signal, current + visit.timeSpentMs)
    }
  }

  if (typeScores.size === 0) return "general"

  let bestType: VisitorType = "general"
  let bestScore = 0
  for (const [type, score] of typeScores) {
    if (score > bestScore) {
      bestScore = score
      bestType = type
    }
  }

  return bestType
}

function deriveInterests(visits: PageVisit[]): string[] {
  const sectionTime = new Map<string, number>()
  for (const visit of visits) {
    const section = extractSection(visit.path)
    sectionTime.set(section, (sectionTime.get(section) ?? 0) + visit.timeSpentMs)
  }

  const avgTime = visits.length > 0
    ? visits.reduce((s, v) => s + v.timeSpentMs, 0) / visits.length
    : 0

  return [...sectionTime.entries()]
    .filter(([, time]) => time > avgTime)
    .map(([section]) => section)
}

export function personalizeContentOrder(
  visitorType: VisitorType,
  sections?: ContentSection[]
): ContentSection[] {
  const items = sections ?? SECTION_RELEVANCE
  return [...items].sort(
    (a, b) => (b.relevance[visitorType] ?? 0) - (a.relevance[visitorType] ?? 0)
  )
}

export function getIndustryView(visitorType: VisitorType): IndustryView {
  const viewMap: Record<VisitorType, IndustryView> = {
    recruiter: "business",
    developer: "tech",
    designer: "design",
    general: "general",
  }
  return viewMap[visitorType]
}

export function getViewEmphasis(view: IndustryView): string[] {
  const emphasis: Record<IndustryView, string[]> = {
    tech: ["code samples", "architecture diagrams", "tech stack details", "open source contributions"],
    design: ["visual portfolio", "UI/UX case studies", "design process", "prototypes"],
    business: ["impact metrics", "team leadership", "project outcomes", "certifications"],
    general: ["project highlights", "skills overview", "recent activity"],
  }
  return emphasis[view]
}
