import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Copy, ExternalLink, Pause, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FeaturedTestimonial } from "@/components/testimonials/FeaturedTestimonial"
import { TestimonialCard } from "@/components/testimonials/TestimonialCard"
import { TESTIMONIAL_CATEGORIES, TESTIMONIAL_REQUEST_FORM_URL } from "@/data/testimonials"
import { getPublishedTestimonials } from "@/lib/testimonials-store"
import type { TestimonialCategory, TestimonialRecord } from "@/types/testimonials"

const ROTATION_INTERVAL_MS = 6000

type FilterId = "all" | TestimonialCategory

function nextIndex(current: number, length: number): number {
  if (length <= 1) return 0
  return (current + 1) % length
}

function previousIndex(current: number, length: number): number {
  if (length <= 1) return 0
  return (current - 1 + length) % length
}

async function copyRequestLink(url: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard) return false

  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch {
    return false
  }
}

export function Testimonials() {
  const [activeFilter, setActiveFilter] = useState<FilterId>("all")
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle")
  const [testimonials, setTestimonials] = useState<TestimonialRecord[]>(() => getPublishedTestimonials())

  useEffect(() => {
    const handleFocusSync = () => setTestimonials(getPublishedTestimonials())
    window.addEventListener("focus", handleFocusSync)
    return () => window.removeEventListener("focus", handleFocusSync)
  }, [])

  const filteredTestimonials = useMemo(() => {
    if (activeFilter === "all") return testimonials
    return testimonials.filter((testimonial) => testimonial.category === activeFilter)
  }, [activeFilter, testimonials])

  const featuredTestimonial = useMemo(() => {
    return filteredTestimonials.find((testimonial) => testimonial.featured) ?? filteredTestimonials[0] ?? null
  }, [filteredTestimonials])

  const carouselItems = useMemo(() => {
    if (!featuredTestimonial) return []
    return filteredTestimonials.filter((testimonial) => testimonial.id !== featuredTestimonial.id)
  }, [featuredTestimonial, filteredTestimonials])

  useEffect(() => {
    if (currentIndex >= carouselItems.length) {
      setCurrentIndex(0)
    }
  }, [carouselItems.length, currentIndex])

  useEffect(() => {
    if (isPaused || carouselItems.length <= 1) return

    const timer = window.setInterval(() => {
      setCurrentIndex((current) => nextIndex(current, carouselItems.length))
    }, ROTATION_INTERVAL_MS)

    return () => window.clearInterval(timer)
  }, [isPaused, carouselItems.length])

  const activeCarouselItem = carouselItems[currentIndex] ?? null

  const handleCopyLink = async (): Promise<void> => {
    const copied = await copyRequestLink(TESTIMONIAL_REQUEST_FORM_URL)
    setCopyStatus(copied ? "copied" : "failed")
    window.setTimeout(() => setCopyStatus("idle"), 2000)
  }

  return (
    <section id="testimonials" className="py-20">
      <div className="container max-w-6xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold">Testimonials</h2>
          <p className="mt-3 text-muted-foreground">
            Feedback from managers, clients, collaborators, and mentors.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button variant={activeFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setActiveFilter("all")}>
              All
            </Button>
            {TESTIMONIAL_CATEGORIES.map((category) => (
              <Button
                key={category.id}
                variant={activeFilter === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(category.id)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {featuredTestimonial ? (
          <FeaturedTestimonial testimonial={featuredTestimonial} />
        ) : (
          <div className="rounded-xl border border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
            No approved testimonials are available for this category yet.
          </div>
        )}

        {activeCarouselItem ? (
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="rounded-xl border border-border/70 bg-card/30 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <Badge variant="secondary">Carousel</Badge>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Previous testimonial"
                  onClick={() => setCurrentIndex((index) => previousIndex(index, carouselItems.length))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label={isPaused ? "Resume testimonial rotation" : "Pause testimonial rotation"}
                  onClick={() => setIsPaused((value) => !value)}
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Next testimonial"
                  onClick={() => setCurrentIndex((index) => nextIndex(index, carouselItems.length))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <TestimonialCard key={activeCarouselItem.id} testimonial={activeCarouselItem} />
            </AnimatePresence>
          </div>
        ) : null}

        <div className="rounded-xl border border-border bg-background/70 p-5">
          <h3 className="text-lg font-semibold">Request A Testimonial</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Want to leave feedback? Share this request link with a colleague or client.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={handleCopyLink}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Share Link
            </Button>
            <Button asChild>
              <a href={TESTIMONIAL_REQUEST_FORM_URL} target="_blank" rel="noreferrer">
                Open Request Form
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            {copyStatus === "copied" ? <span className="text-xs text-emerald-500">Copied to clipboard</span> : null}
            {copyStatus === "failed" ? <span className="text-xs text-amber-500">Clipboard unavailable</span> : null}
          </div>
        </div>
      </div>
    </section>
  )
}
