import { describe, expect, it } from "vitest"
import { projectsData } from "@/data/projects"
import {
  buildProjectDetailModel,
  buildProjectGallery,
  getAdjacentProjects,
  getProjectBySlug,
  getProjectRelatedProjects,
} from "@/lib/project-detail-utils"

describe("project-detail-utils", () => {
  it("finds a project by slug", () => {
    const project = getProjectBySlug("codereview-ai", projectsData)
    expect(project?.title).toBe("CodeReview AI")
  })

  it("returns related projects ordered by technology overlap", () => {
    const source = getProjectBySlug("codereview-ai", projectsData)
    expect(source).not.toBeNull()

    const related = getProjectRelatedProjects(source!, projectsData, 3)
    expect(related.length).toBeGreaterThan(0)
    expect(related.some((project) => project.tech.some((tech) => source!.tech.includes(tech)))).toBe(true)
  })

  it("builds a gallery with multiple images", () => {
    const source = getProjectBySlug("codereview-ai", projectsData)
    expect(source).not.toBeNull()

    const gallery = buildProjectGallery(source!)
    expect(gallery.length).toBeGreaterThanOrEqual(3)
    expect(gallery[0]?.imageUrl.startsWith("data:image/svg+xml")).toBe(true)
  })

  it("returns previous and next projects for navigation", () => {
    const source = getProjectBySlug("jarvis", projectsData)
    expect(source).not.toBeNull()

    const adjacent = getAdjacentProjects(source!, projectsData)
    expect(adjacent.previousProject).not.toBeNull()
    expect(adjacent.nextProject).not.toBeNull()
  })

  it("builds full project detail model", () => {
    const model = buildProjectDetailModel("codereview-ai", projectsData)
    expect(model).not.toBeNull()
    expect(model?.gallery.length).toBeGreaterThanOrEqual(3)
    expect(model?.timeline.length).toBe(4)
    expect(model?.caseStudy.solution.length).toBeGreaterThan(0)
  })
})
