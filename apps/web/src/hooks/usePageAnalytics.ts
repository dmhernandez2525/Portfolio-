import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { trackClick, trackGoal, trackPageView, trackScrollDepth, trackTimeOnPage } from "@/lib/analytics-store"

const GAME_PATHS = ["/snake", "/tetris", "/chess", "/game", "/tanks", "/agar", "/mafia-wars", "/pokemon", "/shopping-cart-hero", "/cookie-clicker"]
const SCROLL_THRESHOLDS = [25, 50, 75, 100]

export function usePageAnalytics() {
  const location = useLocation()
  const startedAtRef = useRef<number>(Date.now())
  const pathRef = useRef<string>(location.pathname)
  const emittedScrollRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    const path = location.pathname
    startedAtRef.current = Date.now()
    pathRef.current = path
    emittedScrollRef.current = new Set()
    trackPageView(path, typeof document !== "undefined" ? document.title : undefined)

    if (GAME_PATHS.some((route) => path.startsWith(route))) {
      trackGoal(path, "game_play")
    }

    const handleScroll = (): void => {
      const body = document.documentElement
      const maxScroll = Math.max(1, body.scrollHeight - window.innerHeight)
      const percent = (window.scrollY / maxScroll) * 100
      for (const threshold of SCROLL_THRESHOLDS) {
        if (percent >= threshold && !emittedScrollRef.current.has(threshold)) {
          emittedScrollRef.current.add(threshold)
          trackScrollDepth(pathRef.current, threshold)
        }
      }
    }

    const handleClick = (event: MouseEvent): void => {
      const target = event.target
      if (!(target instanceof Element)) return
      const tag = target.tagName.toLowerCase()
      const idValue = target.id ? `#${target.id}` : ""
      const classValue = target.classList.length > 0 ? `.${target.classList[0]}` : ""
      trackClick(pathRef.current, `${tag}${idValue}${classValue}`)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("click", handleClick)

    return () => {
      const seconds = (Date.now() - startedAtRef.current) / 1000
      trackTimeOnPage(pathRef.current, seconds)
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("click", handleClick)
    }
  }, [location.pathname])
}
