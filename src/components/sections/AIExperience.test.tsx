import { describe, it, expect, vi, beforeAll } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { AIExperience } from "./AIExperience"

// Mock IntersectionObserver as a proper class
beforeAll(() => {
  class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver)
})

// Mock framer-motion
vi.mock("framer-motion", () => {
  const createMotionComponent = (tag: string) => {
    return function MotionComponent({ children, className, id, style, onClick, href }: Record<string, unknown>) {
      const Tag = tag as keyof JSX.IntrinsicElements
      const props: Record<string, unknown> = {}
      if (className) props.className = className
      if (id) props.id = id
      if (style) props.style = style
      if (onClick) props.onClick = onClick
      if (href) props.href = href
      return <Tag {...props}>{children as React.ReactNode}</Tag>
    }
  }

  return {
    motion: {
      div: createMotionComponent("div"),
      section: createMotionComponent("section"),
      h1: createMotionComponent("h1"),
      span: createMotionComponent("span"),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }
})

function renderComponent() {
  return render(
    <MemoryRouter>
      <AIExperience />
    </MemoryRouter>
  )
}

describe("AIExperience", () => {
  it("renders the section heading", () => {
    renderComponent()
    expect(screen.getByText("AI & LLM Development")).toBeInTheDocument()
  })

  it("renders the badge with months", () => {
    renderComponent()
    expect(screen.getByText(/20\+ Months of Production AI Work/)).toBeInTheDocument()
  })

  it("renders the description text", () => {
    renderComponent()
    expect(screen.getByText(/complete, production-grade system/)).toBeInTheDocument()
  })

  it("renders all 4 highlight cards", () => {
    renderComponent()
    expect(screen.getByText("Apps That Build Apps")).toBeInTheDocument()
    expect(screen.getByText("10 Battle-Tested Prompt Patterns")).toBeInTheDocument()
    expect(screen.getByText("Voice-First AI (<500ms)")).toBeInTheDocument()
    expect(screen.getByText("Privacy-First Architecture")).toBeInTheDocument()
  })

  it("renders highlight card descriptions", () => {
    renderComponent()
    expect(screen.getByText(/5-layer recursive ecosystem/)).toBeInTheDocument()
    expect(screen.getByText(/two-phase initialization/)).toBeInTheDocument()
    expect(screen.getByText(/Full duplex conversation/)).toBeInTheDocument()
    expect(screen.getByText(/7 projects where data never leaves/)).toBeInTheDocument()
  })

  it("renders stat labels", () => {
    renderComponent()
    const statLabels = screen.getAllByText(/Projects with AI Prompts|Production AI Products|Reusable Prompt Patterns|Total AI Sessions/)
    expect(statLabels.length).toBe(4)
  })

  it("renders the CTA button linking to /ai-development", () => {
    renderComponent()
    const ctaLink = screen.getByRole("link", { name: /Explore the Full Story/ })
    expect(ctaLink).toHaveAttribute("href", "/ai-development")
  })

  it("renders the CTA subtitle", () => {
    renderComponent()
    expect(screen.getByText(/11 production AI products/)).toBeInTheDocument()
  })
})
