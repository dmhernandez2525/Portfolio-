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
      // Position at top-left of cursor (the tip)
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
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

      {/* Main cursor - arrow/pointer shape with clear tip */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          x: springX,
          y: springY,
        }}
        animate={{
          scale: cursorVariant === "pointer" ? 1.2 : 1,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      >
        {/* Arrow cursor SVG - tip at top-left */}
        <svg
          width={cursorVariant === "text" ? "4" : "24"}
          height={cursorVariant === "text" ? "24" : "28"}
          viewBox="0 0 24 28"
          fill="none"
          className={cursorVariant === "text" ? "hidden" : "block"}
          style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
        >
          {/* Main arrow shape */}
          <path
            d="M1 1L1 21L6.5 16L11 26L14 24.5L9.5 14.5L17 14.5L1 1Z"
            fill={cursorVariant === "pointer" ? "rgba(123, 45, 255, 0.9)" : "rgba(0, 212, 255, 0.9)"}
            stroke="white"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>

        {/* Text cursor (I-beam) */}
        {cursorVariant === "text" && (
          <div
            className="w-[3px] h-6 bg-cyan-400 rounded-sm"
            style={{
              boxShadow: "0 0 8px rgba(0, 212, 255, 0.8)",
              marginLeft: "-1.5px"
            }}
          />
        )}
      </motion.div>

      {/* Trailing glow effect */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full"
        style={{
          x: springX,
          y: springY,
          width: cursorVariant === "pointer" ? 40 : 24,
          height: cursorVariant === "pointer" ? 40 : 24,
          marginLeft: cursorVariant === "pointer" ? -8 : -4,
          marginTop: cursorVariant === "pointer" ? -8 : -4,
          background: cursorVariant === "pointer"
            ? "radial-gradient(circle, rgba(123, 45, 255, 0.3) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, transparent 70%)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
    </>
  )
}
