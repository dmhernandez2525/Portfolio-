export type TestimonialSource = "linkedin" | "github" | "direct"

export type TestimonialCategory = "colleague" | "manager" | "client" | "mentor"

export interface LinkedInRecommendationMeta {
  profileUrl: string
  recommendationId: string
  importedAt: string
}

export interface TestimonialRecord {
  id: string
  name: string
  role: string
  company: string
  content: string
  rating: number
  source: TestimonialSource
  sourceUrl?: string
  category: TestimonialCategory
  verified: boolean
  approved: boolean
  featured: boolean
  order: number
  tags: string[]
  videoUrl?: string
  createdAt: string
  updatedAt: string
  linkedinMeta?: LinkedInRecommendationMeta
}

export interface NewTestimonialInput {
  name: string
  role: string
  company: string
  content: string
  rating: number
  source: TestimonialSource
  sourceUrl?: string
  category: TestimonialCategory
  verified: boolean
  approved: boolean
  featured: boolean
  tags: string[]
  videoUrl?: string
  linkedinMeta?: LinkedInRecommendationMeta
}

export interface UpdateTestimonialInput extends Partial<NewTestimonialInput> {
  id: string
}
