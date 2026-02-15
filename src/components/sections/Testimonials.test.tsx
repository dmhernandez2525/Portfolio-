import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { Testimonials } from "@/components/sections/Testimonials"
import type { TestimonialRecord } from "@/types/testimonials"
import { getPublishedTestimonials } from "@/lib/testimonials-store"

vi.mock("@/lib/testimonials-store", () => ({
  getPublishedTestimonials: vi.fn(),
}))

vi.mock("framer-motion", () => {
  const createMotionComponent = (tag: string) => {
    return function MotionComponent({ children, className }: Record<string, unknown>) {
      const Tag = tag as keyof JSX.IntrinsicElements
      const props: Record<string, unknown> = {}
      if (className) props.className = className
      return <Tag {...props}>{children as React.ReactNode}</Tag>
    }
  }

  return {
    motion: {
      article: createMotionComponent("article"),
      div: createMotionComponent("div"),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }
})

const TESTIMONIALS: TestimonialRecord[] = [
  {
    id: "tm-featured",
    name: "Alice Manager",
    role: "Engineering Manager",
    company: "Orbit Labs",
    content: "Daniel is one of the fastest end-to-end shippers I have worked with.",
    rating: 5,
    source: "linkedin",
    category: "manager",
    verified: true,
    approved: true,
    featured: true,
    order: 0,
    tags: ["delivery"],
    createdAt: "2026-02-15T00:00:00.000Z",
    updatedAt: "2026-02-15T00:00:00.000Z",
  },
  {
    id: "tm-1",
    name: "Bob Example",
    role: "Staff Engineer",
    company: "Northwind",
    content: "Excellent collaboration and clean implementation details.",
    rating: 4,
    source: "github",
    category: "colleague",
    verified: true,
    approved: true,
    featured: false,
    order: 1,
    tags: ["quality"],
    createdAt: "2026-02-15T00:00:00.000Z",
    updatedAt: "2026-02-15T00:00:00.000Z",
  },
  {
    id: "tm-2",
    name: "Carol Example",
    role: "Founder",
    company: "Acorn",
    content: "Project moved from draft to launch quickly with great communication.",
    rating: 5,
    source: "direct",
    category: "client",
    verified: true,
    approved: true,
    featured: false,
    order: 2,
    tags: ["communication"],
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    createdAt: "2026-02-15T00:00:00.000Z",
    updatedAt: "2026-02-15T00:00:00.000Z",
  },
]

function mockIntersectionObserver(): void {
  class MockObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null
    readonly rootMargin = "0px"
    readonly thresholds = [0]
    private callback: IntersectionObserverCallback

    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback
    }

    disconnect(): void {}
    observe(): void {
      this.callback([{ isIntersecting: true } as IntersectionObserverEntry], this)
    }
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
    unobserve(): void {}
  }

  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    value: MockObserver,
  })
}

describe("Testimonials section", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(getPublishedTestimonials).mockReturnValue(TESTIMONIALS)
    mockIntersectionObserver()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("auto-rotates carousel and supports pause on hover", () => {
    render(<Testimonials />)

    expect(screen.getByText("Bob Example")).toBeInTheDocument()

    const carousel = screen.getByText("Carousel").closest("div")
    expect(carousel).not.toBeNull()
    fireEvent.mouseEnter(carousel as HTMLElement)

    act(() => {
      vi.advanceTimersByTime(6000)
    })
    expect(screen.getByText("Bob Example")).toBeInTheDocument()

    fireEvent.mouseLeave(carousel as HTMLElement)
    act(() => {
      vi.advanceTimersByTime(6000)
    })
    expect(screen.getByText("Carol Example")).toBeInTheDocument()
  })

  it("shows star rating display and lazy-loads video testimonial", () => {
    render(<Testimonials />)

    expect(screen.getByLabelText("Rating 5 out of 5")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Next testimonial" }))
    expect(screen.getByText("Carol Example")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Play video testimonial by Carol Example" }))
    expect(screen.getByTitle("Carol Example video testimonial")).toBeInTheDocument()
  })
})
