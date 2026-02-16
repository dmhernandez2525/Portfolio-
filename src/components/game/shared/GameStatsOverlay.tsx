interface GameStatsOverlayProps {
  fps: number
  score: number
  combo: number
  multiplier: number
}

export function GameStatsOverlay({ fps, score, combo, multiplier }: GameStatsOverlayProps) {
  return (
    <div className="pointer-events-none fixed left-3 top-24 z-40 rounded-md border border-border bg-background/80 px-3 py-2 text-xs backdrop-blur">
      <p>FPS: {fps}</p>
      <p>Score: {score}</p>
      <p>Combo: {combo}</p>
      <p>Multiplier: x{multiplier.toFixed(1)}</p>
    </div>
  )
}
