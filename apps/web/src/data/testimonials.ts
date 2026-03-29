import type { NewTestimonialInput, TestimonialCategory, TestimonialRecord, TestimonialSource } from "@/types/testimonials"

const now = "2026-02-15T00:00:00.000Z"

function seedRecord(id: string, order: number, input: NewTestimonialInput): TestimonialRecord {
  return {
    id,
    order,
    createdAt: now,
    updatedAt: now,
    ...input,
  }
}

export const TESTIMONIAL_CATEGORIES: Array<{ id: TestimonialCategory; label: string }> = [
  { id: "colleague", label: "Colleague" },
  { id: "manager", label: "Manager" },
  { id: "client", label: "Client" },
  { id: "mentor", label: "Mentor" },
]

export const TESTIMONIAL_SOURCE_LABELS: Record<TestimonialSource, string> = {
  linkedin: "LinkedIn",
  github: "GitHub",
  direct: "Direct",
}

export const TESTIMONIAL_REQUEST_FORM_URL = "/#contact"

export const DEFAULT_TESTIMONIALS: TestimonialRecord[] = [
  seedRecord("tm-1", 0, {
    name: "Mia Thompson",
    role: "Engineering Manager",
    company: "Charter Communications",
    content:
      "Daniel consistently shipped production-ready features under tight constraints and mentored teammates without slowing delivery.",
    rating: 5,
    source: "linkedin",
    category: "manager",
    verified: true,
    approved: true,
    featured: true,
    tags: ["leadership", "delivery", "frontend"],
  }),
  seedRecord("tm-2", 1, {
    name: "Marcus Lee",
    role: "Senior Frontend Engineer",
    company: "Axiom Labs",
    content:
      "He brings strong product judgment and turns vague requests into scoped execution plans that actually ship.",
    rating: 5,
    source: "github",
    sourceUrl: "https://github.com/dmhernandez2525",
    category: "colleague",
    verified: true,
    approved: true,
    featured: false,
    tags: ["product", "execution"],
  }),
  seedRecord("tm-3", 2, {
    name: "Avery Patel",
    role: "Founder",
    company: "Northbridge Studio",
    content:
      "Our collaboration moved from concept to a polished launch much faster than expected, with excellent communication throughout.",
    rating: 5,
    source: "direct",
    category: "client",
    verified: true,
    approved: true,
    featured: false,
    tags: ["client", "communication"],
  }),
  seedRecord("tm-4", 3, {
    name: "Jordan Kim",
    role: "Staff Engineer",
    company: "Independent",
    content:
      "Daniel combines systems thinking with practical implementation detail. His PRs are clear, complete, and easy to review.",
    rating: 4,
    source: "linkedin",
    category: "mentor",
    verified: true,
    approved: true,
    featured: false,
    tags: ["architecture", "code-quality"],
  }),
]
