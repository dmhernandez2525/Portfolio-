import { useCallback } from "react"

type HapticPattern = "light" | "medium" | "heavy" | "success" | "error"

const PATTERNS: Record<HapticPattern, number[]> = {
  light: [10],
  medium: [30],
  heavy: [50],
  success: [15, 50, 15],
  error: [50, 30, 50, 30, 50],
}

function canVibrate(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator
}

export function useHaptic() {
  const vibrate = useCallback((pattern: HapticPattern = "light") => {
    if (!canVibrate()) return
    navigator.vibrate(PATTERNS[pattern])
  }, [])

  return { vibrate, supported: canVibrate() }
}
