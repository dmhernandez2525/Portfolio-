export function generateAchievementShareCard(params: {
  playerName: string
  achievementTitle: string
  streakDays: number
}): string | null {
  if (typeof document === "undefined") return null

  const canvas = document.createElement("canvas")
  canvas.width = 900
  canvas.height = 500
  const context = canvas.getContext("2d")
  if (!context) return null

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, "#0ea5e9")
  gradient.addColorStop(1, "#1d4ed8")
  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.fillStyle = "rgba(255,255,255,0.95)"
  context.font = "bold 52px Georgia"
  context.fillText("Achievement Unlocked", 48, 112)

  context.font = "bold 44px Georgia"
  context.fillText(params.achievementTitle, 48, 190)

  context.font = "28px Georgia"
  context.fillText(`Player: ${params.playerName}`, 48, 260)
  context.fillText(`Streak: ${params.streakDays} days`, 48, 308)

  context.fillStyle = "rgba(255,255,255,0.8)"
  context.font = "24px Georgia"
  context.fillText("portfolio-site.onrender.com", 48, 430)

  return canvas.toDataURL("image/png")
}
