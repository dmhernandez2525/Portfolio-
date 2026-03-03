import { fireEvent, render, screen, within } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"
import { TestimonialAdminPanel } from "@/components/admin/testimonials/TestimonialAdminPanel"
import { resetTestimonialsStore } from "@/lib/testimonials-store"

describe("TestimonialAdminPanel", () => {
  beforeEach(() => {
    resetTestimonialsStore()
  })

  it("adds and deletes a testimonial through admin controls", () => {
    render(<TestimonialAdminPanel />)

    fireEvent.change(screen.getByLabelText("Name", { selector: "input#new-testimonial-name" }), {
      target: { value: "Jamie Rivera" },
    })
    fireEvent.change(screen.getByLabelText("Company", { selector: "input#new-testimonial-company" }), {
      target: { value: "Signal" },
    })
    fireEvent.change(screen.getByLabelText("Role", { selector: "input#new-testimonial-role" }), {
      target: { value: "Product Lead" },
    })
    fireEvent.change(screen.getByLabelText("Content", { selector: "textarea#new-testimonial-content" }), {
      target: { value: "Fast execution and clear communication from planning to delivery." },
    })
    fireEvent.click(screen.getByRole("button", { name: "Add Testimonial" }))

    const article = screen.getByText("Jamie Rivera · Product Lead").closest("article")
    expect(article).not.toBeNull()

    fireEvent.click(within(article as HTMLElement).getByRole("button", { name: "Delete" }))
    expect(screen.queryByText("Jamie Rivera · Product Lead")).not.toBeInTheDocument()
  })
})
