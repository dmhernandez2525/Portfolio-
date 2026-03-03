import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ProjectList } from "@/components/admin/projects/ProjectList"
import type { ManagedProjectRecord } from "@/types/admin-project"

const PROJECTS: ManagedProjectRecord[] = [
  {
    id: "project-1",
    order: 0,
    createdAt: "2026-02-15T00:00:00.000Z",
    updatedAt: "2026-02-15T00:00:00.000Z",
    title: "Project One",
    slug: "project-one",
    shortDescription: "First",
    detailsMarkdown: "## One",
    problem: "Problem",
    approach: "Approach",
    solution: "Solution",
    results: "Results",
    techStack: ["React"],
    tags: ["one"],
    status: "draft",
    images: [],
    analytics: { views: 10, clicks: 3, avgTimeSeconds: 30 },
    versions: [],
  },
  {
    id: "project-2",
    order: 1,
    createdAt: "2026-02-15T00:00:00.000Z",
    updatedAt: "2026-02-15T00:00:00.000Z",
    title: "Project Two",
    slug: "project-two",
    shortDescription: "Second",
    detailsMarkdown: "## Two",
    problem: "Problem",
    approach: "Approach",
    solution: "Solution",
    results: "Results",
    techStack: ["TypeScript"],
    tags: ["two"],
    status: "published",
    images: [],
    analytics: { views: 20, clicks: 5, avgTimeSeconds: 42 },
    versions: [],
  },
]

describe("ProjectList", () => {
  it("triggers reorder callback on drag and drop", () => {
    const onReorder = vi.fn()

    render(
      <ProjectList
        projects={PROJECTS}
        selectedIds={new Set()}
        activeProjectId={null}
        onSelectProject={() => {}}
        onToggleSelected={() => {}}
        onSelectAll={() => {}}
        onReorder={onReorder}
      />,
    )

    const sourceRow = screen.getByText("Project One").closest("tr")
    const targetRow = screen.getByText("Project Two").closest("tr")
    expect(sourceRow).not.toBeNull()
    expect(targetRow).not.toBeNull()

    const dataTransfer = {
      data: "",
      setData: (_key: string, value: string) => {
        dataTransfer.data = value
      },
      getData: () => dataTransfer.data,
    }

    fireEvent.dragStart(sourceRow as HTMLElement, { dataTransfer })
    fireEvent.drop(targetRow as HTMLElement, { dataTransfer })

    expect(onReorder).toHaveBeenCalledWith("project-1", "project-2")
  })
})
