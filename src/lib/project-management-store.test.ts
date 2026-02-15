import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  bulkUpdateProjectStatus,
  createManagedProject,
  getManagedProjects,
  importProjectFromGithub,
  reorderManagedProjects,
  resetManagedProjectsStore,
  rollbackManagedProjectVersion,
  updateManagedProject,
} from "@/lib/project-management-store"

describe("project-management-store", () => {
  beforeEach(() => {
    resetManagedProjectsStore()
    vi.restoreAllMocks()
  })

  it("supports create/update/rollback workflows", () => {
    const initial = getManagedProjects()
    const created = createManagedProject({
      title: "New Admin Project",
      slug: "new-admin-project",
      shortDescription: "Created via admin project manager.",
      detailsMarkdown: "## New project",
      problem: "Problem statement",
      approach: "Approach statement",
      solution: "Solution statement",
      results: "Results statement",
      techStack: ["React"],
      tags: ["admin"],
      status: "draft",
    })
    expect(getManagedProjects().length).toBe(initial.length + 1)

    updateManagedProject(created.id, {
      title: "Updated Admin Project",
      status: "published",
    })
    const updated = getManagedProjects().find((project) => project.id === created.id)
    expect(updated?.title).toBe("Updated Admin Project")
    expect(updated?.status).toBe("published")
    expect(updated?.versions.length).toBeGreaterThan(0)

    const versionId = updated?.versions[0]?.id
    expect(versionId).toBeDefined()
    if (!versionId) return

    rollbackManagedProjectVersion(created.id, versionId)
    const rolledBack = getManagedProjects().find((project) => project.id === created.id)
    expect(rolledBack?.title).toBe("New Admin Project")
    expect(rolledBack?.status).toBe("draft")
  })

  it("supports drag reorder and bulk status updates", () => {
    const projects = getManagedProjects()
    const [first, second] = projects
    expect(first).toBeDefined()
    expect(second).toBeDefined()

    const reordered = reorderManagedProjects(first.id, second.id)
    expect(reordered[0].id).toBe(second.id)

    const bulk = bulkUpdateProjectStatus([reordered[0].id, reordered[1].id], "archived")
    expect(bulk[0].status).toBe("archived")
    expect(bulk[1].status).toBe("archived")
  })

  it("imports project metadata from GitHub API", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: "portfolio-tools",
          description: "Utilities for portfolio automation",
          html_url: "https://github.com/example/portfolio-tools",
          homepage: "https://portfolio-tools.example.com",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          TypeScript: 12000,
          HTML: 1200,
        }),
      })

    vi.stubGlobal("fetch", fetchMock)

    const imported = await importProjectFromGithub("example/portfolio-tools")
    expect(imported).not.toBeNull()
    expect(imported?.title).toBe("portfolio-tools")
    expect(imported?.techStack).toEqual(["TypeScript", "HTML"])
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
