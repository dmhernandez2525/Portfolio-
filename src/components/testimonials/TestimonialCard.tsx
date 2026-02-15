import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/testimonials/StarRating"
import { VerificationBadge } from "@/components/testimonials/VerificationBadge"
import { VideoTestimonialEmbed } from "@/components/testimonials/VideoTestimonialEmbed"
import { TESTIMONIAL_CATEGORIES } from "@/data/testimonials"
import type { TestimonialRecord } from "@/types/testimonials"

interface TestimonialCardProps {
  testimonial: TestimonialRecord
}

function getCategoryLabel(categoryId: TestimonialRecord["category"]): string {
  return TESTIMONIAL_CATEGORIES.find((category) => category.id === categoryId)?.label ?? categoryId
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <motion.article
      key={testimonial.id}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-border bg-card/60 p-5 backdrop-blur-sm"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <VerificationBadge source={testimonial.source} verified={testimonial.verified} />
        <Badge variant="secondary">{getCategoryLabel(testimonial.category)}</Badge>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">"{testimonial.content}"</p>

      {testimonial.videoUrl ? (
        <div className="mt-4">
          <VideoTestimonialEmbed url={testimonial.videoUrl} title={testimonial.name} />
        </div>
      ) : null}

      <div className="mt-4 border-t border-border/60 pt-4">
        <StarRating rating={testimonial.rating} />
        <p className="mt-2 text-sm font-semibold">{testimonial.name}</p>
        <p className="text-xs text-muted-foreground">
          {testimonial.role} · {testimonial.company}
        </p>
      </div>
    </motion.article>
  )
}
