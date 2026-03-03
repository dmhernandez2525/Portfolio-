import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { TechAuditPage } from "./TechAuditPage"

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const { initial, animate, whileInView, viewport, transition, variants, whileHover, whileTap, ...rest } = props
      void initial; void animate; void whileInView; void viewport; void transition; void variants; void whileHover; void whileTap
      return <div {...rest}>{children as React.ReactNode}</div>
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <TechAuditPage />
    </MemoryRouter>,
  )
}

describe("TechAuditPage", () => {
  it("renders the hero section with headline", () => {
    renderPage()

    expect(screen.getByText(/let's talk about/i)).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/your technology/i)
  })

  it("renders the free badge", () => {
    renderPage()

    expect(screen.getByText(/100% free/i)).toBeInTheDocument()
  })

  it("renders the What to Expect section with all cards", () => {
    renderPage()

    expect(screen.getByText("What to Expect")).toBeInTheDocument()
    expect(screen.getByText("20-40 Minutes")).toBeInTheDocument()
    expect(screen.getByText("Recorded Session")).toBeInTheDocument()
    expect(screen.getByText("Fully Confidential")).toBeInTheDocument()
    expect(screen.getByText("Actionable Insights")).toBeInTheDocument()
  })

  it("renders the What We Cover section with all items", () => {
    renderPage()

    expect(screen.getByText("What We Cover")).toBeInTheDocument()
    expect(screen.getByText("Current Tools and Software")).toBeInTheDocument()
    expect(screen.getByText("Security Posture")).toBeInTheDocument()
    expect(screen.getByText("Automation Opportunities")).toBeInTheDocument()
    expect(screen.getByText("Vendor Lock-in and Risks")).toBeInTheDocument()
    expect(screen.getByText("AI Readiness")).toBeInTheDocument()
  })

  it("renders the NDA download section", () => {
    renderPage()

    expect(screen.getByText("Your Information Stays Protected")).toBeInTheDocument()
    expect(screen.getByText("Download Mutual NDA")).toBeInTheDocument()
  })

  it("renders the booking form section", () => {
    renderPage()

    expect(screen.getByText("Book Your Session")).toBeInTheDocument()
    expect(screen.getByLabelText("Your Name")).toBeInTheDocument()
  })

  it("renders the philosophy section", () => {
    renderPage()

    expect(screen.getByText("Why Is This Free?")).toBeInTheDocument()
    expect(screen.getByText(/technology should be democratized/i)).toBeInTheDocument()
  })

  it("has Book Your Free Audit CTA button", () => {
    renderPage()

    const ctaButtons = screen.getAllByText(/book your free audit/i)
    expect(ctaButtons.length).toBeGreaterThanOrEqual(1)
  })

  it("has Download NDA button in hero", () => {
    renderPage()

    expect(screen.getByText("Download NDA")).toBeInTheDocument()
  })
})
