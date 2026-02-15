import { describe, expect, it, vi, beforeEach } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { ProjectDetailPage } from "./ProjectDetailPage"

vi.mock("framer-motion", () => {
  const createMotionComponent = (tag: string) => {
    return function MotionComponent({ children, className, onClick, role, "aria-label": ariaLabel }: Record<string, unknown>) {
      const Tag = tag as keyof JSX.IntrinsicElements
      const props: Record<string, unknown> = {}
      if (className) props.className = className
      if (onClick) props.onClick = onClick
      if (role) props.role = role
      if (ariaLabel) props["aria-label"] = ariaLabel
      return <Tag {...props}>{children as React.ReactNode}</Tag>
    }
  }

  return {
    motion: {
      section: createMotionComponent("section"),
      div: createMotionComponent("div"),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }
})

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)

      if (url.endsWith("/languages")) {
        return {
          ok: true,
          json: async () => ({ TypeScript: 70000, Python: 14000 }),
        } as Response
      }

      return {
        ok: true,
        json: async () => ({ stargazers_count: 120, forks_count: 35 }),
      } as Response
    }),
  )
})

function renderProjectDetail(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/projects" element={<div>Projects Index</div>} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/404" element={<div>Not Found</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("ProjectDetailPage", () => {
  it("renders project detail route content", async () => {
    renderProjectDetail("/projects/codereview-ai")

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "CodeReview AI" })).toBeInTheDocument()
    })
    expect(screen.getByText("Project Gallery")).toBeInTheDocument()
    expect(screen.getByText("Case Study")).toBeInTheDocument()
  })

  it("opens gallery lightbox", async () => {
    renderProjectDetail("/projects/codereview-ai")

    fireEvent.click(screen.getByRole("button", { name: "Open gallery image 1" }))

    expect(await screen.findByRole("dialog", { name: /gallery lightbox/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Close gallery" }))
    expect(screen.queryByRole("dialog", { name: /gallery lightbox/i })).not.toBeInTheDocument()
  })

  it("renders previous and next navigation links", () => {
    renderProjectDetail("/projects/jarvis")

    const previousLink = screen.getByRole("link", { name: /Previous:/i })
    const nextLink = screen.getByRole("link", { name: /Next:/i })

    expect(previousLink).toHaveAttribute("href")
    expect(nextLink).toHaveAttribute("href")
  })

  it("redirects unknown project slugs to not found route", () => {
    renderProjectDetail("/projects/does-not-exist")

    expect(screen.getByText("Not Found")).toBeInTheDocument()
  })
})
