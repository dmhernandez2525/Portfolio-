import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { AIDevelopmentPage } from "./AIDevelopmentPage"

// Mock framer-motion with proper named component functions
vi.mock("framer-motion", () => {
  const createMotionComponent = (tag: string) => {
    return function MotionComponent({ children, className, id, style, onClick }: Record<string, unknown>) {
      const Tag = tag as keyof JSX.IntrinsicElements
      const props: Record<string, unknown> = {}
      if (className) props.className = className
      if (id) props.id = id
      if (style) props.style = style
      if (onClick) props.onClick = onClick
      return <Tag {...props}>{children as React.ReactNode}</Tag>
    }
  }

  return {
    motion: {
      div: createMotionComponent("div"),
      section: createMotionComponent("section"),
      h1: createMotionComponent("h1"),
      span: createMotionComponent("span"),
      p: createMotionComponent("p"),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }
})

function renderPage() {
  return render(
    <MemoryRouter>
      <AIDevelopmentPage />
    </MemoryRouter>
  )
}

describe("AIDevelopmentPage", () => {
  it("renders the page title", () => {
    renderPage()
    expect(screen.getByText("AI & LLM Development")).toBeInTheDocument()
  })

  it("renders the comprehensive deep dive badge", () => {
    renderPage()
    expect(screen.getByText("Comprehensive Deep Dive")).toBeInTheDocument()
  })

  it("renders stats cards", () => {
    renderPage()
    expect(screen.getByText("Projects with AI Prompts")).toBeInTheDocument()
    expect(screen.getByText("Production AI Products")).toBeInTheDocument()
    expect(screen.getByText("Reusable Prompt Patterns")).toBeInTheDocument()
  })

  it("renders the table of contents with group headers", () => {
    renderPage()
    // Group names may also appear in section content, so use getAllByText
    expect(screen.getAllByText("Foundation").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Prompt Engineering").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("AI Products & Strategy").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Development Workflow").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Architecture & Engineering").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Quality & Infrastructure").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Reflections").length).toBeGreaterThanOrEqual(1)
  })

  it("renders TOC navigation links", () => {
    renderPage()
    const journeyLink = screen.getByRole("link", { name: /The Journey/i })
    expect(journeyLink).toHaveAttribute("href", "#journey")
  })

  it("renders section count in TOC header", () => {
    renderPage()
    expect(screen.getByText(/Contents \(\d+ sections\)/)).toBeInTheDocument()
  })

  it("renders the Journey section as defaultOpen", () => {
    renderPage()
    expect(screen.getByText(/From a Thanksgiving 2019 vision/)).toBeInTheDocument()
  })

  it("renders the Lessons section as defaultOpen", () => {
    renderPage()
    expect(screen.getByText("Separation of Concerns is Critical")).toBeInTheDocument()
  })

  it("renders collapsible section headers for all major sections", () => {
    renderPage()
    expect(screen.getAllByText(/10 Battle-Tested Prompt Patterns/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/11 AI Products/).length).toBeGreaterThanOrEqual(1)

    // Round 3 sections
    expect(screen.getAllByText(/Security Implementations/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Monorepo Architecture/).length).toBeGreaterThanOrEqual(1)

    // Round 4 sections
    expect(screen.getAllByText(/Real-Time Architecture/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Animation & Motion Engineering/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/AI Orchestration Patterns/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/PWA & Offline Architecture/).length).toBeGreaterThanOrEqual(1)
  })

  it("toggles section open/close on click", () => {
    renderPage()
    // Multiple elements may match (TOC + section header); click the last one (section button)
    const securityElements = screen.getAllByText(/Security Implementations/)
    fireEvent.click(securityElements[securityElements.length - 1])

    expect(screen.getAllByText(/Security Highlights/).length).toBeGreaterThanOrEqual(1)
  })

  it("renders Back to Portfolio link", () => {
    renderPage()
    const backLinks = screen.getAllByRole("link", { name: /Back to Portfolio/ })
    expect(backLinks.length).toBeGreaterThanOrEqual(1)
    expect(backLinks[0]).toHaveAttribute("href", "/")
  })

  it("renders enforcement gaps section", () => {
    renderPage()
    expect(screen.getAllByText(/Enforcement Gaps/).length).toBeGreaterThanOrEqual(1)
  })

  it("renders practical use cases section", () => {
    renderPage()
    expect(screen.getByText(/Practical Day-to-Day Use Cases/)).toBeInTheDocument()
  })
})
