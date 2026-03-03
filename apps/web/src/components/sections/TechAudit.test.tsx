import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { TechAudit } from "./TechAudit"

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const { initial, animate, whileInView, viewport, transition, variants, ...rest } = props
      void initial; void animate; void whileInView; void viewport; void transition; void variants
      return <div {...rest}>{children as React.ReactNode}</div>
    },
  },
}))

function renderSection() {
  return render(
    <MemoryRouter>
      <TechAudit />
    </MemoryRouter>,
  )
}

describe("TechAudit homepage section", () => {
  it("renders the section heading", () => {
    renderSection()

    expect(screen.getByText("Free Technology Audit")).toBeInTheDocument()
  })

  it("renders the free badge", () => {
    renderSection()

    expect(screen.getByText("Free for Everyone")).toBeInTheDocument()
  })

  it("renders the description text", () => {
    renderSection()

    expect(screen.getByText(/book a free 20-40 minute session/i)).toBeInTheDocument()
  })

  it("renders all three highlights", () => {
    renderSection()

    expect(screen.getByText(/review your tools/i)).toBeInTheDocument()
    expect(screen.getByText(/nda available/i)).toBeInTheDocument()
    expect(screen.getByText(/actionable recommendations/i)).toBeInTheDocument()
  })

  it("renders the CTA button linking to /tech-audit", () => {
    renderSection()

    const link = screen.getByRole("link", { name: /book your free audit/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute("href", "/tech-audit")
  })
})
