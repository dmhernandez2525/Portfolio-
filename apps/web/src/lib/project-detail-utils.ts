import { projectsData, type ProjectItem, type ProjectStatus, type ProjectTier } from "@/data/projects"
import type {
  ProjectCaseStudy,
  ProjectDetailModel,
  ProjectGalleryItem,
  ProjectTechDetail,
  ProjectTimelineMilestone,
} from "@/types/project-detail"

const STATUS_LABELS: Record<ProjectStatus, string> = {
  production: "Production Release",
  active: "Active Delivery",
  beta: "Beta Validation",
  development: "Development In Progress",
  "local-only": "Local Prototype",
}

const TIER_BONUS: Record<ProjectTier, number> = {
  flagship: 20,
  strong: 12,
  supporting: 6,
}

const GALLERY_COLORS = [
  ["#0f172a", "#1e293b", "#38bdf8"],
  ["#111827", "#1f2937", "#f59e0b"],
  ["#1e1b4b", "#312e81", "#14b8a6"],
] as const

function formatDate(value: Date): string {
  return value.toISOString().slice(0, 10)
}

function stableHash(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }

  return Math.abs(hash)
}

function buildTimelineDate(projectId: string, dayOffset: number): Date {
  const base = new Date("2023-01-01T00:00:00.000Z")
  const stableOffset = stableHash(projectId) % 480
  base.setUTCDate(base.getUTCDate() + stableOffset + dayOffset)
  return base
}

function splitSentences(text: string, fallback: string): string[] {
  const lines = text
    .split(/\.(?:\s+|$)/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (!lines.length) {
    return [fallback]
  }

  return lines.slice(0, 3).map((line) => `${line}.`)
}

function createSvgDataUri(
  title: string,
  subtitle: string,
  caption: string,
  colors: readonly [string, string, string],
): string {
  const [from, to, accent] = colors
  const escapedTitle = title.replace(/&/g, "&amp;")
  const escapedSubtitle = subtitle.replace(/&/g, "&amp;")
  const escapedCaption = caption.replace(/&/g, "&amp;")

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-label="${escapedTitle}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}" />
      <stop offset="100%" stop-color="${to}" />
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)" rx="24" />
  <rect x="72" y="72" width="1136" height="576" fill="none" stroke="${accent}" stroke-width="3" opacity="0.6" rx="18" />
  <circle cx="1120" cy="132" r="14" fill="${accent}" />
  <text x="96" y="176" font-size="64" fill="#f8fafc" font-family="Inter, Arial, sans-serif" font-weight="700">${escapedTitle}</text>
  <text x="96" y="244" font-size="34" fill="#cbd5e1" font-family="Inter, Arial, sans-serif">${escapedSubtitle}</text>
  <text x="96" y="584" font-size="30" fill="${accent}" font-family="Inter, Arial, sans-serif" font-weight="600">${escapedCaption}</text>
</svg>
`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export function getProjectBySlug(slug: string, projects: ProjectItem[] = projectsData): ProjectItem | null {
  return projects.find((project) => project.id === slug) ?? null
}

export function getProjectRelatedProjects(
  sourceProject: ProjectItem,
  projects: ProjectItem[] = projectsData,
  maxResults = 3,
): ProjectItem[] {
  const sourceTech = new Set(sourceProject.tech.map((tech) => tech.toLowerCase()))

  return projects
    .filter((project) => project.id !== sourceProject.id)
    .map((project) => {
      const sharedTech = project.tech.reduce((count, tech) => {
        return sourceTech.has(tech.toLowerCase()) ? count + 1 : count
      }, 0)

      const categoryBonus = project.category === sourceProject.category ? 2 : 0
      const tierBonus = project.tier === sourceProject.tier ? 1 : 0
      const score = sharedTech * 3 + categoryBonus + tierBonus

      return { project, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.project.title.localeCompare(b.project.title)
    })
    .slice(0, maxResults)
    .map((entry) => entry.project)
}

export function getAdjacentProjects(
  sourceProject: ProjectItem,
  projects: ProjectItem[] = projectsData,
): { previousProject: ProjectItem | null; nextProject: ProjectItem | null } {
  const index = projects.findIndex((project) => project.id === sourceProject.id)

  if (index === -1) {
    return { previousProject: null, nextProject: null }
  }

  return {
    previousProject: projects[index - 1] ?? null,
    nextProject: projects[index + 1] ?? null,
  }
}

export function buildProjectTechDetails(
  sourceProject: ProjectItem,
  projects: ProjectItem[] = projectsData,
): ProjectTechDetail[] {
  const frequencies = new Map<string, number>()
  for (const project of projects) {
    for (const tech of project.tech) {
      frequencies.set(tech, (frequencies.get(tech) ?? 0) + 1)
    }
  }

  const maxFrequency = Math.max(...frequencies.values())

  return sourceProject.tech.map((tech, index) => {
    const usage = frequencies.get(tech) ?? 1
    const frequencyScore = Math.round((usage / maxFrequency) * 45)
    const roleBonus = sourceProject.featured ? 8 : 0
    const leadTechBonus = index < 3 ? 6 : 0
    const tierBonus = TIER_BONUS[sourceProject.tier]

    const proficiency = Math.min(100, 35 + frequencyScore + roleBonus + leadTechBonus + tierBonus)

    return {
      name: tech,
      proficiency,
    }
  })
}

export function buildProjectCaseStudy(project: ProjectItem): ProjectCaseStudy {
  const fallbackApproach = "Combined product requirements, technical constraints, and delivery milestones into a focused implementation plan."

  return {
    problem: project.description,
    approach: splitSentences(project.description, fallbackApproach),
    solution: project.features?.slice(0, 4) ?? ["Implemented a production-ready core feature set with typed interfaces and resilient fallbacks."],
    results: [
      ...(project.highlights?.slice(0, 3) ?? []),
      project.metrics ?? `Status: ${STATUS_LABELS[project.status]}`,
    ],
  }
}

export function buildProjectTimeline(project: ProjectItem): ProjectTimelineMilestone[] {
  const discoveryDate = buildTimelineDate(project.id, 0)
  const architectureDate = buildTimelineDate(project.id, 35)
  const implementationDate = buildTimelineDate(project.id, 95)
  const currentDate = buildTimelineDate(project.id, 160)

  return [
    {
      id: `${project.id}-discovery`,
      label: "Discovery",
      date: formatDate(discoveryDate),
      detail: `Validated scope for ${project.title} and prioritized a delivery path.`,
    },
    {
      id: `${project.id}-architecture`,
      label: "Architecture",
      date: formatDate(architectureDate),
      detail: `Established typed interfaces and selected ${project.tech.slice(0, 3).join(", ")} as the core stack.`,
    },
    {
      id: `${project.id}-implementation`,
      label: "Implementation",
      date: formatDate(implementationDate),
      detail: `Built key capabilities including ${project.features?.slice(0, 2).join(" and ") ?? "core project workflows"}.`,
    },
    {
      id: `${project.id}-status`,
      label: STATUS_LABELS[project.status],
      date: formatDate(currentDate),
      detail: project.metrics ?? `${project.title} is currently in ${project.status} state.`,
    },
  ]
}

export function buildProjectGallery(project: ProjectItem): ProjectGalleryItem[] {
  const techPreview = project.tech.slice(0, 3).join(" • ")

  const generatedItems = GALLERY_COLORS.map((colors, index) => {
    const frameNumber = index + 1
    const title = `${project.title} - View ${frameNumber}`
    const caption = index === 0 ? project.tagline : project.highlights?.[index - 1] ?? project.category

    return {
      id: `${project.id}-gallery-${frameNumber}`,
      title,
      caption,
      imageUrl: createSvgDataUri(project.title, techPreview, caption, colors),
      alt: `${project.title} gallery preview ${frameNumber}`,
    }
  })

  if (project.image) {
    return [
      {
        id: `${project.id}-cover`,
        title: `${project.title} Cover`,
        caption: project.tagline,
        imageUrl: project.image,
        alt: `${project.title} cover image`,
      },
      ...generatedItems,
    ]
  }

  return generatedItems
}

export function buildProjectDetailModel(slug: string, projects: ProjectItem[] = projectsData): ProjectDetailModel | null {
  const project = getProjectBySlug(slug, projects)
  if (!project) return null

  const relatedProjects = getProjectRelatedProjects(project, projects)
  const { previousProject, nextProject } = getAdjacentProjects(project, projects)

  return {
    project,
    gallery: buildProjectGallery(project),
    caseStudy: buildProjectCaseStudy(project),
    timeline: buildProjectTimeline(project),
    techDetails: buildProjectTechDetails(project, projects),
    relatedProjects,
    previousProject,
    nextProject,
  }
}
