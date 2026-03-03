import { useEffect, useMemo, useRef, useState } from "react"
import { PlayCircle } from "lucide-react"

interface VideoTestimonialEmbedProps {
  url: string
  title: string
}

function toEmbedUrl(url: string): string {
  if (url.includes("youtube.com/watch")) {
    const value = new URL(url)
    const videoId = value.searchParams.get("v")
    if (videoId) return `https://www.youtube.com/embed/${videoId}`
  }

  if (url.includes("youtu.be/")) {
    const value = url.split("youtu.be/")[1]
    const videoId = value.split("?")[0]
    if (videoId) return `https://www.youtube.com/embed/${videoId}`
  }

  return url
}

export function VideoTestimonialEmbed({ url, title }: VideoTestimonialEmbedProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isRequested, setIsRequested] = useState<boolean>(false)
  const embedUrl = useMemo(() => toEmbedUrl(url), [url])

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current || isVisible) return

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 },
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [isVisible])

  const shouldRenderFrame = isVisible && isRequested

  return (
    <div ref={containerRef} className="overflow-hidden rounded-lg border border-border bg-muted/30">
      {shouldRenderFrame ? (
        <iframe
          title={`${title} video testimonial`}
          src={embedUrl}
          className="h-52 w-full"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          className="flex h-52 w-full items-center justify-center gap-2 bg-gradient-to-br from-primary/10 to-background text-sm text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setIsRequested(true)}
          aria-label={`Play video testimonial by ${title}`}
        >
          <PlayCircle className="h-6 w-6" />
          {isVisible ? "Play video testimonial" : "Video will load when visible"}
        </button>
      )}
    </div>
  )
}
