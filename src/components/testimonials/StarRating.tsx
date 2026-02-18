import { Star } from "lucide-react"

interface StarRatingProps {
  rating: number
  className?: string
}

export function StarRating({ rating, className }: StarRatingProps) {
  const safeRating = Math.max(1, Math.min(5, Math.round(rating)))

  return (
    <div className={`flex items-center gap-1 ${className ?? ""}`.trim()} aria-label={`Rating ${safeRating} out of 5`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const isFilled = index < safeRating
        return (
          <Star
            key={`star-${index}`}
            className={`h-4 w-4 ${isFilled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"}`}
            aria-hidden="true"
          />
        )
      })}
    </div>
  )
}
