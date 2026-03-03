interface GameAchievementToastStackProps {
  items: string[]
}

export function GameAchievementToastStack({ items }: GameAchievementToastStackProps) {
  if (items.length === 0) return null

  return (
    <div className="fixed right-4 top-24 z-50 space-y-2">
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className="rounded-md border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
          Achievement unlocked: {item}
        </div>
      ))}
    </div>
  )
}
