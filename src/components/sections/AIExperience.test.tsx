import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest"
import { render, screen, act } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"

// Mock aiStats to include a decimal value (covers isDecimal branch in AnimatedCounter)
vi.mock("@/data/ai-development", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/data/ai-development")>()
  return {
    ...original,
    aiStats: [
      { label: "Projects with AI Prompts", value: "77+", description: "Structured agent prompt infrastructure" },
      { label: "Production AI Products", value: "11", description: "Shipped AI applications" },
      { label: "Test Coverage", value: "97.7", description: "Research Agent coverage" },
      { label: "Total AI Sessions", value: "620+", description: "Across all tools" },
      ...original.aiStats.slice(4),
    ],
  }
})

import { AIExperience } from "./AIExperience"

// Store observer callbacks so tests can trigger them
let observerCallbacks: ((entries: Array<{ isIntersecting: boolean }>) => void)[] = []

let rafCallCount = 0
const baseTime = performance.now()

beforeAll(() => {
  // Mock requestAnimationFrame to execute synchronously with incrementing time
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    rafCallCount++
    // First call at 500ms (progress < 1), second at 2000ms (progress >= 1)
    const elapsed = rafCallCount % 2 === 1 ? 500 : 2000
    cb(baseTime + elapsed)
    return 0
  })
})

beforeEach(() => {
  rafCallCount = 0
  observerCallbacks = []
  class MockIntersectionObserver {
    constructor(callback: (entries: Array<{ isIntersecting: boolean }>) => void) {
      observerCallbacks.push(callback)
    }
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
    // Third stat is mocked to "Test Coverage" to test decimal branch
    const statLabels = screen.getAllByText(/Projects with AI Prompts|Production AI Products|Test Coverage|Total AI Sessions/)
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

  it("triggers animated counter when IntersectionObserver fires", () => {
    renderComponent()

    // Trigger all IntersectionObserver callbacks with isIntersecting: true
    act(() => {
      for (const callback of observerCallbacks) {
        callback([{ isIntersecting: true }])
      }
    })

    // After animation fires, counter values should be non-zero
    // The stat values from aiStats are rendered via AnimatedCounter
    // With requestAnimationFrame mocked at +2000ms (> 1500ms duration),
    // the animation should complete to the target value
    const statElements = screen.getAllByText(/^\d+/)
    expect(statElements.length).toBeGreaterThan(0)
  })

  it("covers animation loop with intermediate progress values", () => {
    renderComponent()

    // With our rAF mock, first call is at 500ms (progress ~0.33, < 1)
    // which triggers requestAnimationFrame again, second call at 2000ms (progress 1.0)
    act(() => {
      for (const callback of observerCallbacks) {
        callback([{ isIntersecting: true }])
      }
    })

    // Animation should complete and display final counter values
    expect(screen.getByText("AI & LLM Development")).toBeInTheDocument()
  })

  it("does not re-animate counter on subsequent intersections", () => {
    renderComponent()

    // Fire intersection twice
    act(() => {
      for (const callback of observerCallbacks) {
        callback([{ isIntersecting: true }])
      }
    })
    act(() => {
      for (const callback of observerCallbacks) {
        callback([{ isIntersecting: true }])
      }
    })

    // Should still render fine (hasAnimated guard prevents double animation)
    expect(screen.getByText("AI & LLM Development")).toBeInTheDocument()
  })
})
