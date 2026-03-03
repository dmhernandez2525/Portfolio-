import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import type { ProjectGalleryItem } from "@/types/project-detail"

interface ProjectGalleryProps {
  items: ProjectGalleryItem[]
  projectTitle: string
}

function clampIndex(length: number, index: number): number {
  if (length <= 0) return 0
  if (index < 0) return length - 1
  if (index >= length) return 0
  return index
}

export function ProjectGallery({ items, projectTitle }: ProjectGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const selectedItem = useMemo(() => {
    if (selectedIndex === null) return null
    return items[selectedIndex] ?? null
  }, [items, selectedIndex])

  const openLightbox = (index: number): void => {
    setSelectedIndex(index)
  }

  const closeLightbox = (): void => {
    setSelectedIndex(null)
  }

  const showPrevious = (): void => {
    setSelectedIndex((current) => {
      if (current === null) return null
      return clampIndex(items.length, current - 1)
    })
  }

  const showNext = (): void => {
    setSelectedIndex((current) => {
      if (current === null) return null
      return clampIndex(items.length, current + 1)
    })
  }

  return (
    <section aria-label="Project gallery" className="space-y-4">
      <h2 className="text-xl font-semibold">Project Gallery</h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => openLightbox(index)}
            className="group overflow-hidden rounded-xl border border-border bg-card text-left transition hover:border-primary/60"
            aria-label={`Open gallery image ${index + 1}`}
          >
            <img
              src={item.imageUrl}
              alt={item.alt}
              loading="lazy"
              className="h-40 w-full object-cover transition group-hover:scale-[1.02]"
            />
            <div className="p-3">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.caption}</p>
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selectedItem ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            role="dialog"
            aria-label={`${projectTitle} gallery lightbox`}
          >
            <button
              type="button"
              className="absolute right-4 top-4 rounded-md border border-white/20 p-2 text-white transition hover:bg-white/10"
              onClick={closeLightbox}
              aria-label="Close gallery"
            >
              <X className="h-5 w-5" />
            </button>

            <button
              type="button"
              className="absolute left-4 rounded-md border border-white/20 p-2 text-white transition hover:bg-white/10"
              onClick={showPrevious}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="max-w-5xl">
              <img src={selectedItem.imageUrl} alt={selectedItem.alt} className="max-h-[72vh] w-full rounded-xl object-contain" />
              <div className="mt-3 text-center text-white">
                <p className="font-medium">{selectedItem.title}</p>
                <p className="text-sm text-white/70">{selectedItem.caption}</p>
              </div>
            </div>

            <button
              type="button"
              className="absolute right-4 rounded-md border border-white/20 p-2 text-white transition hover:bg-white/10"
              onClick={showNext}
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
