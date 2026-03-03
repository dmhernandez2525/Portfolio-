import { beforeEach, describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { clearResumeDownloadEvents, getResumeDownloadEvents } from "@/lib/resume-analytics"
import { ResumePage } from "./ResumePage"

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

vi.mock("qrcode.react", () => {
  return {
    QRCodeSVG: ({ value }: { value: string }) => <div data-testid="qr-code">{value}</div>,
  }
})

function renderPage() {
  return render(
    <MemoryRouter>
      <ResumePage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  clearResumeDownloadEvents()
  vi.restoreAllMocks()
})

describe("ResumePage", () => {
  it("renders interactive resume viewer and controls", () => {
    renderPage()

    expect(screen.getByText("Daniel Hernandez")).toBeInTheDocument()
    expect(screen.getByRole("combobox", { name: "Resume preset" })).toBeInTheDocument()
    expect(screen.getByRole("combobox", { name: "Resume version" })).toBeInTheDocument()
  })

  it("toggles section collapse", () => {
    renderPage()

    const toggleButton = screen.getByRole("button", { name: "Toggle Summary section" })
    const summarySection = document.querySelector("[data-section='summary']")
    expect(summarySection).not.toBeNull()
    fireEvent.click(toggleButton)

    expect(within(summarySection as HTMLElement).queryByText(/Full-stack engineer with 10\+ years/i)).not.toBeInTheDocument()
  })

  it("tracks downloads when exporting PDF", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null)

    renderPage()

    fireEvent.click(screen.getByRole("button", { name: /PDF \(0\)/i }))

    expect(openSpy).toHaveBeenCalledWith("/resume.pdf", "_blank", "noopener,noreferrer")

    const events = getResumeDownloadEvents()
    expect(events[0]?.format).toBe("pdf")
  })

  it("applies print stylesheet classes", () => {
    renderPage()

    expect(document.querySelector(".resume-main")).not.toBeNull()
    expect(document.querySelector(".resume-controls")).not.toBeNull()
    expect(document.querySelector(".resume-comparison")).not.toBeNull()
  })
})
