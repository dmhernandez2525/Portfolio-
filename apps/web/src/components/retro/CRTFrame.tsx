import type { ReactNode } from "react"

interface CRTFrameProps {
  children: ReactNode
  colorScheme: "green" | "amber"
}

export function CRTFrame({ children, colorScheme }: CRTFrameProps) {
  const glowColor = colorScheme === "green"
    ? "rgba(51, 255, 51, 0.05)"
    : "rgba(255, 176, 0, 0.05)"

  return (
    <div className="h-screen w-screen bg-[#111] flex items-center justify-center p-2 sm:p-6">
      {/* Monitor bezel */}
      <div
        className="relative w-full h-full max-w-5xl max-h-[90vh] bg-[#222] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden"
        style={{
          boxShadow: "0 0 40px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.05)",
        }}
      >
        {/* Inner screen */}
        <div
          className="relative w-full h-full m-0 sm:m-3 rounded-xl sm:rounded-2xl overflow-hidden retro-crt-screen"
          style={{
            boxShadow: `inset 0 0 80px ${glowColor}, inset 0 0 160px ${glowColor}`,
          }}
        >
          {/* Content */}
          <div className="relative z-10 h-full">
            {children}
          </div>

          {/* Scanline overlay */}
          <div className="retro-scanlines absolute inset-0 z-20 pointer-events-none" />

          {/* Vignette */}
          <div
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%)",
            }}
          />
        </div>
      </div>
    </div>
  )
}
