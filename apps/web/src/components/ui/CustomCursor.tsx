import { motion, useMotionValue, useSpring } from "framer-motion"
import { useEffect, useState } from "react"
import { useBoss } from "@/context/boss-context"

export function CustomCursor() {
  const [cursorVariant, setCursorVariant] = useState<"default" | "pointer" | "text">("default")
  const [isVisible, setIsVisible] = useState(false)
  const { isBossEnraged } = useBoss()

  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  const springConfig = { stiffness: 500, damping: 28 }
  const springX = useSpring(cursorX, springConfig)
  const springY = useSpring(cursorY, springConfig)

  useEffect(() => {
    // Check if device has fine pointer (mouse)
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches
    if (!hasFinePointer) return


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

      {/* Main cursor - arrow/pointer shape with clear tip (or sword when boss is enraged) */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          x: springX,
          y: springY,
        }}
        animate={{
          scale: isBossEnraged ? 1.3 : cursorVariant === "pointer" ? 1.2 : 1,
          rotate: isBossEnraged ? -45 : 0,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      >
        {/* Sword cursor when boss is enraged */}
        {isBossEnraged ? (
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            style={{ filter: "drop-shadow(0 0 8px rgba(255,215,0,0.8))" }}
          >
            {/* Sword blade */}
            <path
              d="M4 4L20 20M20 20L24 16L28 4L16 8L20 20Z"
              fill="rgba(192,192,192,0.9)"
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Sword guard */}
            <path
              d="M18 22L14 18L12 24L18 22Z"
              fill="rgba(139,69,19,0.9)"
              stroke="white"
              strokeWidth="1"
            />
            {/* Sword handle */}
            <path
              d="M12 24L8 28L10 30L14 26L12 24Z"
              fill="rgba(101,67,33,0.9)"
              stroke="white"
              strokeWidth="1"
            />
            {/* Glow effect */}
            <circle cx="26" cy="6" r="3" fill="rgba(255,215,0,0.6)" />
          </svg>
        ) : (
          <>
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
          </>
        )}
      </motion.div>

      {/* Trailing glow effect */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full"
        style={{
          x: springX,
          y: springY,
          width: isBossEnraged ? 48 : cursorVariant === "pointer" ? 40 : 24,
          height: isBossEnraged ? 48 : cursorVariant === "pointer" ? 40 : 24,
          marginLeft: isBossEnraged ? -12 : cursorVariant === "pointer" ? -8 : -4,
          marginTop: isBossEnraged ? -12 : cursorVariant === "pointer" ? -8 : -4,
          background: isBossEnraged
            ? "radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, rgba(255, 0, 0, 0.2) 50%, transparent 70%)"
            : cursorVariant === "pointer"
            ? "radial-gradient(circle, rgba(123, 45, 255, 0.3) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, transparent 70%)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
    </>
  )
}
