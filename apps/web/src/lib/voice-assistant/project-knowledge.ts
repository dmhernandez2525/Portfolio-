import { projectsData } from "@/data/projects"

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((part) => part.length > 2)
}

function scoreProject(queryTerms: string[], searchable: string): number {
  const normalized = searchable.toLowerCase()
  return queryTerms.reduce((score, term) => score + (normalized.includes(term) ? 1 : 0), 0)
}

function findRelevantProjects(question: string, maxItems: number = 6) {
  const terms = tokenize(question)
  if (terms.length === 0) {
    return projectsData.slice(0, maxItems)
  }

  return projectsData
    .map((project) => {
      const searchable = [project.title, project.tagline, project.description, project.tech.join(" "), (project.features ?? []).join(" ")].join(" ")
      return {
        project,
        score: scoreProject(terms, searchable),
      }
    })
    .sort((left, right) => right.score - left.score)
    .filter((item) => item.score > 0)
    .slice(0, maxItems)
    .map((item) => item.project)
}

export function buildProjectKnowledgeContext(question: string): string {
  const relevant = findRelevantProjects(question)
  const summary = relevant
    .map((project) => `- ${project.title}: ${project.tagline}. Tech: ${project.tech.slice(0, 5).join(", ")}.`) 
    .join("\n")

  if (summary.length === 0) {
    return `Daniel has ${projectsData.length} projects across AI/ML, SaaS, games, and developer tools.`
  }

  return `Relevant project knowledge:\n${summary}`
}

export function getProjectKnowledgeResponse(question: string): string | null {
  const relevant = findRelevantProjects(question, 3)

  if (relevant.length === 0) {
    if (question.toLowerCase().includes("project")) {
      return `Daniel has built ${projectsData.length} projects across AI/ML platforms, SaaS products, developer tools, and games. Ask for a category or specific stack and I can narrow it down.`
    }
    return null
  }

  const lines = relevant.map((project) => `• ${project.title}: ${project.tagline}`)
  return `Here are the most relevant projects:\n${lines.join("\n")}`
}
