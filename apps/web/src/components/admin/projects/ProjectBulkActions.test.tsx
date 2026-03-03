import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ProjectBulkActions } from "@/components/admin/projects/ProjectBulkActions"

describe("ProjectBulkActions", () => {
  it("fires batch callbacks when projects are selected", () => {
    const onPublish = vi.fn()
    const onArchive = vi.fn()
    const onClear = vi.fn()

    render(
      <ProjectBulkActions selectedCount={2} onPublish={onPublish} onArchive={onArchive} onClear={onClear} />,
    )

    fireEvent.click(screen.getByRole("button", { name: "Batch Publish" }))
    fireEvent.click(screen.getByRole("button", { name: "Batch Archive" }))
    fireEvent.click(screen.getByRole("button", { name: "Clear Selection" }))

    expect(onPublish).toHaveBeenCalledTimes(1)
    expect(onArchive).toHaveBeenCalledTimes(1)
    expect(onClear).toHaveBeenCalledTimes(1)
  })
})
