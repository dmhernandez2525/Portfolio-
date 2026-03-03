import { describe, expect, it } from "vitest"
import {
  assessProjectHealth,
  calculateComplexity,
  categorizeProject,
  findRelatedProjects,
  rankByInterest,
} from "@/lib/project-showcase/categorizer"
import type { ProjectData } from "@/lib/project-showcase/categorizer"

function makeProject(overrides: Partial<ProjectData> = {}): ProjectData {
  return {
    name: "test-project",
    description: "A test project for testing purposes",
    technologies: ["React", "TypeScript"],
    topics: ["web"],
    lastCommitDate: new Date().toISOString(),
    openIssues: 3,
    stars: 10,
    ciPassing: true,
    ...overrides,
  }
}

describe("categorizeProject", () => {
  it("categorizes a frontend project", () => {
    const result = categorizeProject(makeProject({ technologies: ["React", "CSS", "Tailwind"] }))
    expect(result.category).toBe("frontend")
    expect(result.confidence).toBeGreaterThan(0)
  })

  it("categorizes a backend project", () => {
    const result = categorizeProject(makeProject({ technologies: ["Express", "GraphQL"] }))
    expect(result.category).toBe("backend")
  })

  it("categorizes a devops project", () => {
    const result = categorizeProject(makeProject({ technologies: ["Docker", "Kubernetes", "Terraform"] }))
    expect(result.category).toBe("devops")
  })

  it("returns other for unrecognized tech", () => {
    const result = categorizeProject(makeProject({ technologies: ["obscure-lang"], topics: [] }))
    expect(result.category).toBe("other")
  })

  it("uses topics for categorization", () => {
    const result = categorizeProject(makeProject({ technologies: [], topics: ["machine-learning", "python"] }))
    expect(result.category).toBe("data")
  })
})

describe("assessProjectHealth", () => {
  it("marks recent projects as healthy", () => {
    const health = assessProjectHealth(makeProject())
    expect(health.status).toBe("healthy")
    expect(health.score).toBeGreaterThanOrEqual(80)
  })

  it("marks old projects as inactive", () => {
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
    const health = assessProjectHealth(makeProject({ lastCommitDate: twoYearsAgo.toISOString() }))
    expect(health.status).toBe("inactive")
    expect(health.daysSinceLastCommit).toBeGreaterThan(365)
  })

  it("marks 7-month old projects as stale", () => {
    const sevenMonths = new Date()
    sevenMonths.setMonth(sevenMonths.getMonth() - 7)
    const health = assessProjectHealth(makeProject({ lastCommitDate: sevenMonths.toISOString() }))
    expect(health.status).toBe("stale")
  })

  it("penalizes failing CI", () => {
    const healthyCI = assessProjectHealth(makeProject({ ciPassing: true }))
    const failingCI = assessProjectHealth(makeProject({ ciPassing: false }))
    expect(failingCI.score).toBeLessThan(healthyCI.score)
  })

  it("penalizes many open issues", () => {
    const few = assessProjectHealth(makeProject({ openIssues: 2 }))
    const many = assessProjectHealth(makeProject({ openIssues: 25 }))
    expect(many.score).toBeLessThan(few.score)
  })
})

describe("calculateComplexity", () => {
  it("scores higher for more technologies", () => {
    const simple = calculateComplexity(makeProject({ technologies: ["React"] }))
    const complex = calculateComplexity(makeProject({
      technologies: ["React", "TypeScript", "Node", "Docker", "PostgreSQL"],
    }))
    expect(complex).toBeGreaterThan(simple)
  })

  it("scores higher for longer descriptions", () => {
    const short = calculateComplexity(makeProject({ description: "Short" }))
    const long = calculateComplexity(makeProject({
      description: "A comprehensive full-stack application that demonstrates advanced patterns in React and Node.js with real-time collaboration features, authentication, and automated deployment pipelines for production environments",
    }))
    expect(long).toBeGreaterThan(short)
  })

  it("caps at 100", () => {
    const maxed = calculateComplexity(makeProject({
      technologies: Array(20).fill("tech"),
      topics: Array(20).fill("topic"),
      description: "x".repeat(300),
      openIssues: 50,
    }))
    expect(maxed).toBeLessThanOrEqual(100)
  })
})

describe("findRelatedProjects", () => {
  it("finds projects with overlapping technologies", () => {
    const target = makeProject({ name: "A", technologies: ["React", "TypeScript"] })
    const candidates = [
      makeProject({ name: "B", technologies: ["React", "Vue"] }),
      makeProject({ name: "C", technologies: ["Python", "Django"] }),
      makeProject({ name: "D", technologies: ["React", "TypeScript", "Node"] }),
    ]
    const related = findRelatedProjects(target, candidates)
    expect(related[0].name).toBe("D")
    expect(related).toHaveLength(2)
  })

  it("excludes self from results", () => {
    const target = makeProject({ name: "A" })
    const related = findRelatedProjects(target, [target])
    expect(related).toHaveLength(0)
  })

  it("returns at most 5 results", () => {
    const target = makeProject({ name: "target", technologies: ["React"] })
    const candidates = Array.from({ length: 10 }, (_, i) =>
      makeProject({ name: `proj-${i}`, technologies: ["React"] })
    )
    const related = findRelatedProjects(target, candidates)
    expect(related.length).toBeLessThanOrEqual(5)
  })
})

describe("rankByInterest", () => {
  it("ranks by view count descending", () => {
    const projects = [
      makeProject({ name: "low" }),
      makeProject({ name: "high" }),
      makeProject({ name: "mid" }),
    ]
    const views = new Map([["high", 100], ["mid", 50], ["low", 10]])
    const ranked = rankByInterest(projects, views)
    expect(ranked[0].name).toBe("high")
    expect(ranked[2].name).toBe("low")
  })

  it("handles missing view counts", () => {
    const projects = [makeProject({ name: "a" }), makeProject({ name: "b" })]
    const ranked = rankByInterest(projects, new Map())
    expect(ranked).toHaveLength(2)
  })
})
