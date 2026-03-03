import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/testimonials/StarRating"
import { VerificationBadge } from "@/components/testimonials/VerificationBadge"
import type { TestimonialRecord } from "@/types/testimonials"

interface FeaturedTestimonialProps {
  testimonial: TestimonialRecord
}

export function FeaturedTestimonial({ testimonial }: FeaturedTestimonialProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card/80 to-card/60 p-6"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge className="bg-primary text-primary-foreground">
          <Sparkles className="mr-1 h-3.5 w-3.5" />
          Featured Testimonial
        </Badge>
        <VerificationBadge source={testimonial.source} verified={testimonial.verified} />
      </div>

      <p className="text-lg leading-relaxed">"{testimonial.content}"</p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-primary/25 pt-4">
        <div>
          <p className="font-semibold">{testimonial.name}</p>
          <p className="text-sm text-muted-foreground">
            {testimonial.role} · {testimonial.company}
          </p>
        </div>
        <StarRating rating={testimonial.rating} className="justify-end" />
      </div>
    </motion.article>
  )
}
