import { beforeEach, describe, expect, it } from "vitest"
import {
  createTestimonial,
  deleteTestimonial,
  getAllTestimonials,
  moveTestimonial,
  resetTestimonialsStore,
  updateTestimonial,
} from "@/lib/testimonials-store"

describe("testimonials-store", () => {
  beforeEach(() => {
    resetTestimonialsStore()
  })

  it("supports create, update, and delete for admin management", () => {
    const initial = getAllTestimonials()
    const created = createTestimonial({
      name: "Taylor Quinn",
      role: "CTO",
      company: "Beacon",
      content: "Strong execution and clear ownership across the full stack.",
      rating: 5,
      source: "direct",
      category: "client",
      verified: true,
      approved: false,
      featured: false,
      tags: ["ownership"],
    })

    const afterCreate = getAllTestimonials()
    expect(afterCreate.length).toBe(initial.length + 1)
    expect(afterCreate.some((record) => record.id === created.id)).toBe(true)

    const updated = updateTestimonial({
      id: created.id,
      content: "Updated feedback content",
      approved: true,
      rating: 4,
    })
    expect(updated).not.toBeNull()

    const updatedRecord = getAllTestimonials().find((record) => record.id === created.id)
    expect(updatedRecord?.content).toBe("Updated feedback content")
    expect(updatedRecord?.approved).toBe(true)
    expect(updatedRecord?.rating).toBe(4)

    expect(deleteTestimonial(created.id)).toBe(true)
    expect(getAllTestimonials().length).toBe(initial.length)
  })

  it("reorders testimonials with move up/down operations", () => {
    const [first, second] = getAllTestimonials()
    expect(first).toBeDefined()
    expect(second).toBeDefined()

    const down = moveTestimonial(first.id, "down")
    expect(down[0].id).toBe(second.id)
    expect(down[1].id).toBe(first.id)

    const up = moveTestimonial(first.id, "up")
    expect(up[0].id).toBe(first.id)
    expect(up[1].id).toBe(second.id)
  })
})
