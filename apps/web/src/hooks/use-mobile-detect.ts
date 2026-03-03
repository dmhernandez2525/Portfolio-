import { useEffect, useState } from "react"

interface MobileState {
  isMobile: boolean
  isTablet: boolean
  isTouchDevice: boolean
  orientation: "portrait" | "landscape"
}

function detectMobile(): MobileState {
  if (typeof window === "undefined") {
    return { isMobile: false, isTablet: false, isTouchDevice: false, orientation: "portrait" }
  }

  const width = window.innerWidth
  const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0

  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isTouchDevice,
    orientation: window.innerHeight > window.innerWidth ? "portrait" : "landscape",
  }
}

export function useMobileDetect(): MobileState {
  const [state, setState] = useState<MobileState>(detectMobile)

  useEffect(() => {
    const handleResize = () => setState(detectMobile())
    window.addEventListener("resize", handleResize)
    window.addEventListener("orientationchange", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", handleResize)
    }
  }, [])

  return state
}
