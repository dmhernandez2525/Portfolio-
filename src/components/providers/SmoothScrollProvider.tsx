import { useEffect, useRef } from "react"
import Lenis from "lenis"

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    // Initialize Lenis smooth scrolling
    lenisRef.current = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
    })

    // Ensure scroll starts at top after Lenis initializes
    lenisRef.current.scrollTo(0, { immediate: true })

    // Animation frame loop - store ID for cleanup
    let animationFrameId: number

    function raf(time: number) {
      lenisRef.current?.raf(time)
      animationFrameId = requestAnimationFrame(raf)
    }

    animationFrameId = requestAnimationFrame(raf)

    // Handle anchor link clicks for smooth scrolling to sections
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a[href^="#"]')
      if (anchor) {
        const href = anchor.getAttribute("href")
        if (href && href.startsWith("#")) {
          e.preventDefault()
          const targetElement = document.querySelector(href)
          if (targetElement) {
            lenisRef.current?.scrollTo(targetElement as HTMLElement, {
              offset: -80,
              duration: 1.2,
            })
          }
        }
      }
    }

    document.addEventListener("click", handleAnchorClick)

    return () => {
      cancelAnimationFrame(animationFrameId)
      document.removeEventListener("click", handleAnchorClick)
      lenisRef.current?.destroy()
    }
  }, [])

  return <>{children}</>
}
