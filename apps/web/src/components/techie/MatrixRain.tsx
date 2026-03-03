import { useEffect, useRef, useCallback } from "react"

interface MatrixRainProps {
  onDismiss: () => void
}

export function MatrixRain({ onDismiss }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const fontSize = 14
    const columns = Math.floor(canvas.width / fontSize)
    const drops: number[] = Array(columns).fill(1)

    // Characters: mix of katakana, latin, digits, and symbols
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789@#$%^&*(){}[]|;:<>?/~"

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "#0f0"
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]

        // Leading character is brighter
        const y = drops[i] * fontSize
        if (y > 0 && y < canvas.height) {
          ctx.fillStyle = "#fff"
          ctx.fillText(char, i * fontSize, y)
          ctx.fillStyle = "#0f0"
          if (y - fontSize > 0) {
            const prevChar = chars[Math.floor(Math.random() * chars.length)]
            ctx.fillText(prevChar, i * fontSize, y - fontSize)
          }
        }

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()
  }, [])

  useEffect(() => {
    animate()

    const handleResize = () => {
      const canvas = canvasRef.current
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }

    window.addEventListener("resize", handleResize)
    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener("resize", handleResize)
    }
  }, [animate])

  return (
    <div
      className="fixed inset-0 z-[200] cursor-pointer"
      onClick={onDismiss}
      onKeyDown={onDismiss}
      role="button"
      tabIndex={0}
    >
      <canvas ref={canvasRef} className="w-full h-full bg-black" />
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-green-400 text-sm font-mono animate-pulse">
        Click anywhere to escape the matrix...
      </div>
    </div>
  )
}
