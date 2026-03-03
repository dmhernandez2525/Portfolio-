import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ContentManagementPanel } from "@/components/admin/content/ContentManagementPanel"
import { clearContentManagementStore, createPostFromTemplate } from "@/lib/content-management-store"

vi.mock("@/lib/media-optimizer", () => ({
  optimizeImageToWebp: vi.fn(async (file: File) => ({
    id: "asset-mock",
    type: "image",
    name: file.name.replace(/\.[^/.]+$/, "") + ".webp",
    url: "data:image/webp;base64,mock",
    sizeKb: 12,
    createdAt: "2026-02-15T00:00:00.000Z",
  })),
  fileToMediaAsset: vi.fn(async (file: File) => ({
    id: "asset-doc",
    type: "document",
    name: file.name,
    url: "data:application/pdf;base64,mock",
    sizeKb: 20,
    createdAt: "2026-02-15T00:00:00.000Z",
  })),
}))

describe("ContentManagementPanel", () => {
  beforeEach(() => {
    clearContentManagementStore()
    createPostFromTemplate("tutorial", "test-session")
  })

  it("renders editor and updates SEO preview", () => {
    render(<ContentManagementPanel />)

    expect(screen.getByText("Content Management")).toBeInTheDocument()
    const seoInput = screen.getByLabelText("SEO Meta Title")
    fireEvent.change(seoInput, { target: { value: "Custom SEO Title" } })
    expect(screen.getByText("Custom SEO Title")).toBeInTheDocument()
  })

  it("uploads media and renders media library entries", async () => {
    const { container } = render(<ContentManagementPanel />)
    const fileInput = container.querySelector("input[type='file']")
    expect(fileInput).not.toBeNull()

    const file = new File(["fake"], "hero.png", { type: "image/png" })
    fireEvent.change(fileInput as HTMLInputElement, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText("hero.webp")).toBeInTheDocument()
    })
  })
})
