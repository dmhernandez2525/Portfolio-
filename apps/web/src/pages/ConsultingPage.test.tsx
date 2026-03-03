import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { ConsultingPage } from "./ConsultingPage"

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const { initial, animate, whileInView, viewport, transition, variants, whileHover, whileTap, ...rest } = props
      void initial; void animate; void whileInView; void viewport; void transition; void variants; void whileHover; void whileTap
      return <div {...rest}>{children as React.ReactNode}</div>
    },
  },
}))

// Mock mode context
vi.mock("@/context/mode-context", () => ({
  useMode: () => ({
    mode: "consulting",
    setMode: vi.fn(),
    clearMode: vi.fn(),
  }),
}))

describe("ConsultingPage", () => {
  it("renders Daniel's profile", () => {
    render(<ConsultingPage />)

    expect(screen.getByText("Daniel Hernandez")).toBeInTheDocument()
    expect(screen.getByText("Technology Consultant")).toBeInTheDocument()
  })

  it("renders the featured tech audit offering", () => {
    render(<ConsultingPage />)

    expect(screen.getByText("Free Technology Audit")).toBeInTheDocument()
    expect(screen.getByText("Featured Offering")).toBeInTheDocument()
  })

  it("renders audit highlights", () => {
    render(<ConsultingPage />)

    expect(screen.getByText(/20-40 minutes/i)).toBeInTheDocument()
    expect(screen.getByText(/nda available/i)).toBeInTheDocument()
    expect(screen.getByText(/actionable insights/i)).toBeInTheDocument()
  })

  it("renders all four service cards", () => {
    render(<ConsultingPage />)

    expect(screen.getByText("Technology Audit")).toBeInTheDocument()
    expect(screen.getByText("Custom Development")).toBeInTheDocument()
    expect(screen.getByText("Process Automation")).toBeInTheDocument()
    expect(screen.getByText("AI Integration")).toBeInTheDocument()
  })

  it("shows 'Always Free' badge on tech audit card", () => {
    render(<ConsultingPage />)

    expect(screen.getByText("Always Free")).toBeInTheDocument()
  })

  it("renders the Book Your Free Audit CTA", () => {
    render(<ConsultingPage />)

    expect(screen.getByText("Book Your Free Audit")).toBeInTheDocument()
  })

  it("renders the philosophy footer", () => {
    render(<ConsultingPage />)

    expect(screen.getByText(/technology should be democratized/i)).toBeInTheDocument()
  })

  it("renders social links", () => {
    render(<ConsultingPage />)

    expect(screen.getByLabelText("GitHub")).toBeInTheDocument()
    expect(screen.getByLabelText("LinkedIn")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
  })

  it("renders switch mode button", () => {
    render(<ConsultingPage />)

    expect(screen.getByText("Switch Mode")).toBeInTheDocument()
  })

  it("renders NDA download link in header", () => {
    render(<ConsultingPage />)

    expect(screen.getByText("Download NDA")).toBeInTheDocument()
  })
})
