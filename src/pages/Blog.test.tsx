import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { Blog } from "./Blog"

vi.mock("framer-motion", () => {
  const createMotionComponent = (tag: string) => {
    return function MotionComponent({ children, className, onClick }: Record<string, unknown>) {
      const Tag = tag as keyof JSX.IntrinsicElements
      const props: Record<string, unknown> = {}
      if (className) props.className = className
      if (onClick) props.onClick = onClick
      return <Tag {...props}>{children as React.ReactNode}</Tag>
    }
  }

  return {
    motion: {
      article: createMotionComponent("article"),
      button: createMotionComponent("button"),
      div: createMotionComponent("div"),
      section: createMotionComponent("section"),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }
})

function renderBlog(initialPath = "/blog") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/blog" element={<Blog />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("Blog page", () => {
  it("renders blog heading and featured content", () => {
    renderBlog()

    expect(screen.getByText("Thoughts & Insights")).toBeInTheDocument()
    expect(screen.getByText("Building a Tech Career Without a Degree")).toBeInTheDocument()
  })

  it("filters results by full text search", async () => {
    renderBlog()

    const searchInput = screen.getByLabelText("Search blog posts")
    fireEvent.change(searchInput, { target: { value: "solo developer" } })

    await waitFor(() => {
      expect(screen.getByText("Building VR Games as a Solo Developer")).toBeInTheDocument()
    })

    expect(screen.queryByText("What Parenting Taught Me About Engineering")).not.toBeInTheDocument()
  })

  it("respects category and tag query parameters", () => {
    renderBlog("/blog?category=Philosophy&tag=systems")

    expect(screen.getByText("Systems Thinking in the Real World")).toBeInTheDocument()
    expect(screen.queryByText("Why I Build Tools Instead of Products")).not.toBeInTheDocument()
  })

  it("renders markdown content, syntax highlighting, and TOC in post modal", () => {
    renderBlog("/blog?post=systems-thinking-real-world")

    expect(screen.getByRole("heading", { name: "Why Local Fixes Often Fail" })).toBeInTheDocument()
    expect(screen.getByText("Table of contents")).toBeInTheDocument()
    expect(screen.getAllByText("findLeveragePoint").length).toBeGreaterThan(0)
  })

  it("uses pagination query parameters for page size", () => {
    renderBlog("/blog?pageSize=20")

    const pageSizeSelect = screen.getByLabelText("Posts per page") as HTMLSelectElement
    expect(pageSizeSelect.value).toBe("20")
    expect(screen.getByText("Showing page 1 of 1 (4 posts)")).toBeInTheDocument()
  })
})
