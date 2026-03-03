/**
 * Smart project categorization, recommendations, health indicators,
 * and complexity scoring for intelligent project showcasing.
 */

export interface ProjectData {
  name: string
  description: string
  technologies: string[]
  topics: string[]
  lastCommitDate: string
  openIssues: number
  stars: number
  ciPassing: boolean
}

export type ProjectCategory =
  | "frontend"
  | "backend"
  | "fullstack"
  | "devops"
  | "data"
  | "mobile"
  | "library"
  | "other"

export interface CategorizedProject {
  project: ProjectData
  category: ProjectCategory
  confidence: number
}

const CATEGORY_SIGNALS: Record<ProjectCategory, string[]> = {
  frontend: ["react", "vue", "angular", "svelte", "nextjs", "css", "tailwind", "html"],
  backend: ["express", "fastify", "django", "flask", "rails", "nestjs", "graphql", "rest"],
  fullstack: ["nextjs", "nuxt", "remix", "sveltekit", "t3"],
  devops: ["docker", "kubernetes", "terraform", "ansible", "ci/cd", "aws", "github-actions"],
  data: ["python", "pandas", "tensorflow", "pytorch", "jupyter", "sql", "machine-learning"],
  mobile: ["react-native", "flutter", "swift", "kotlin", "expo", "ionic"],
  library: ["npm", "package", "sdk", "cli", "api", "plugin"],
  other: [],
}

export function categorizeProject(project: ProjectData): CategorizedProject {
  const techLower = project.technologies.map((t) => t.toLowerCase())
  const topicLower = project.topics.map((t) => t.toLowerCase())
  const allTerms = [...techLower, ...topicLower]

  let bestCategory: ProjectCategory = "other"
  let bestScore = 0

  const categories = Object.entries(CATEGORY_SIGNALS) as [ProjectCategory, string[]][]
  for (const [category, signals] of categories) {
    if (category === "other") continue
    const matchCount = signals.filter((s) => allTerms.some((t) => t.includes(s))).length
    const score = signals.length > 0 ? matchCount / signals.length : 0
    if (score > bestScore) {
      bestScore = score
      bestCategory = category
    }
  }

  return {
    project,
    category: bestCategory,
    confidence: Math.round(bestScore * 100),
  }
}

export interface ProjectHealth {
  status: "healthy" | "stale" | "inactive"
  daysSinceLastCommit: number
  openIssues: number
  ciPassing: boolean
  score: number
}

export function assessProjectHealth(project: ProjectData, now: Date = new Date()): ProjectHealth {
  const lastCommit = new Date(project.lastCommitDate)
  const daysSince = Math.floor((now.getTime() - lastCommit.getTime()) / (1000 * 60 * 60 * 24))

  let score = 100
  if (daysSince > 365) score -= 40
  else if (daysSince > 180) score -= 25
  else if (daysSince > 90) score -= 10

  if (project.openIssues > 20) score -= 20
  else if (project.openIssues > 10) score -= 10
  else if (project.openIssues > 5) score -= 5

  if (!project.ciPassing) score -= 20

  score = Math.max(0, score)

  let status: ProjectHealth["status"] = "healthy"
  if (daysSince > 365) status = "inactive"
  else if (daysSince > 180) status = "stale"

  return { status, daysSinceLastCommit: daysSince, openIssues: project.openIssues, ciPassing: project.ciPassing, score }
}

export function calculateComplexity(project: ProjectData): number {
  let score = 0
  score += Math.min(project.technologies.length * 10, 50)
  score += Math.min(project.topics.length * 5, 25)

  const descLength = project.description.length
  if (descLength > 200) score += 15
  else if (descLength > 100) score += 10
  else if (descLength > 50) score += 5

  score += Math.min(project.openIssues, 10)

  return Math.min(score, 100)
}

export function findRelatedProjects(
  target: ProjectData,
  candidates: ProjectData[]
): ProjectData[] {
  const targetTech = new Set(target.technologies.map((t) => t.toLowerCase()))

  const scored = candidates
    .filter((c) => c.name !== target.name)
    .map((candidate) => {
      const candidateTech = candidate.technologies.map((t) => t.toLowerCase())
      const overlap = candidateTech.filter((t) => targetTech.has(t)).length
      const union = new Set([...targetTech, ...candidateTech]).size
      const similarity = union > 0 ? overlap / union : 0
      return { project: candidate, similarity }
    })
    .filter((s) => s.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)

  return scored.slice(0, 5).map((s) => s.project)
}

export function rankByInterest(
  projects: ProjectData[],
  viewCounts: Map<string, number>
): ProjectData[] {
  return [...projects].sort((a, b) => {
    const aViews = viewCounts.get(a.name) ?? 0
    const bViews = viewCounts.get(b.name) ?? 0
    return bViews - aViews
  })
}
