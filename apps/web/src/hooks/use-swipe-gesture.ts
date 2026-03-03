import { useCallback, useRef } from "react"

interface SwipeCallbacks {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

interface TouchPoint {
  x: number
  y: number
  timestamp: number
}

const MIN_SWIPE_DISTANCE = 50
const MAX_SWIPE_TIME_MS = 300

export function useSwipeGesture(callbacks: SwipeCallbacks) {
  const startRef = useRef<TouchPoint | null>(null)

  const onTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0]
    startRef.current = { x: touch.clientX, y: touch.clientY, timestamp: Date.now() }
  }, [])

  const onTouchEnd = useCallback((event: React.TouchEvent) => {
    const start = startRef.current
    if (!start) return

    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - start.x
    const deltaY = touch.clientY - start.y
    const elapsed = Date.now() - start.timestamp

    if (elapsed > MAX_SWIPE_TIME_MS) return

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    if (absX < MIN_SWIPE_DISTANCE && absY < MIN_SWIPE_DISTANCE) return

    if (absX > absY) {
      if (deltaX > 0) callbacks.onSwipeRight?.()
      else callbacks.onSwipeLeft?.()
    } else {
      if (deltaY > 0) callbacks.onSwipeDown?.()
      else callbacks.onSwipeUp?.()
    }

    startRef.current = null
  }, [callbacks])

  return { onTouchStart, onTouchEnd }
}
