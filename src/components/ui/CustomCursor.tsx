import { motion, useMotionValue, useSpring } from "framer-motion"
import { useEffect, useState } from "react"

export function CustomCursor() {
  const [cursorVariant, setCursorVariant] = useState<"default" | "pointer" | "text">("default")
  const [isVisible, setIsVisible] = useState(false)

  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  const springConfig = { stiffness: 500, damping: 28 }
  const springX = useSpring(cursorX, springConfig)
  const springY = useSpring(cursorY, springConfig)

  useEffect(() => {
    // Check if device has fine pointer (mouse)
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches
    if (!hasFinePointer) return

    setIsVisible(true)

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16)
      cursorY.set(e.clientY - 16)
    }

    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseLeave = () => setIsVisible(false)

    window.addEventListener("mousemove", moveCursor)
    document.addEventListener("mouseenter", handleMouseEnter)
    document.addEventListener("mouseleave", handleMouseLeave)

    // Track interactive elements
    const updateCursorVariant = () => {
      const interactives = document.querySelectorAll("a, button, [data-cursor], input, textarea, select")

      interactives.forEach((el) => {
        el.addEventListener("mouseenter", () => setCursorVariant("pointer"))
        el.addEventListener("mouseleave", () => setCursorVariant("default"))
      })

      const textElements = document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, span, li")
      textElements.forEach((el) => {
        el.addEventListener("mouseenter", () => setCursorVariant("text"))
        el.addEventListener("mouseleave", () => setCursorVariant("default"))
      })
    }

    // Initial setup
    updateCursorVariant()

    // Use MutationObserver to handle dynamically added elements
    const observer = new MutationObserver(updateCursorVariant)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener("mousemove", moveCursor)
      document.removeEventListener("mouseenter", handleMouseEnter)
      document.removeEventListener("mouseleave", handleMouseLeave)
      observer.disconnect()
    }
  }, [cursorX, cursorY])

  const variants = {
    default: {
      width: 32,
      height: 32,
      backgroundColor: "rgba(0, 212, 255, 0.3)",
    },
    pointer: {
      width: 48,
      height: 48,
      backgroundColor: "rgba(123, 45, 255, 0.25)",
    },
    text: {
      width: 4,
      height: 24,
      backgroundColor: "rgba(0, 212, 255, 0.6)",
      borderRadius: "2px",
    },
  }

  if (!isVisible) return null

  return (
    <>
      {/* Hide default cursor */}
      <style>{`
        @media (pointer: fine) {
          * {
            cursor: none !important;
          }
        }
      `}</style>

      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: springX,
          y: springY,
        }}
        variants={variants}
        animate={cursorVariant}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />
    </>
  )
}
