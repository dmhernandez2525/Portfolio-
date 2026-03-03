import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { getLeaderboard } from "@/lib/game-stats-store"
import type { GameId } from "@/types/game-stats"

interface SharedLeaderboardProps {
  gameId: GameId
}

export function SharedLeaderboard({ gameId }: SharedLeaderboardProps) {
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<"score" | "date" | "player">("score")
  const pageSize = 8
  const leaderboard = useMemo(
    () =>
      getLeaderboard({
        gameId,
        page,
        pageSize,
        sortBy,
        sortOrder: "desc",
      }),
    [gameId, page, sortBy],
  )

  const totalPages = Math.max(1, Math.ceil(leaderboard.total / pageSize))

  return (
    <div className="rounded-lg border border-border bg-background/60 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium">Leaderboard</p>
        <select className="rounded border border-input bg-background px-2 py-1 text-xs" value={sortBy} onChange={(event) => setSortBy(event.target.value as "score" | "date" | "player")}>
          <option value="score">Score</option>
          <option value="date">Date</option>
          <option value="player">Player</option>
        </select>
      </div>
      <div className="space-y-1 text-sm">
        {leaderboard.rows.length === 0 ? <p className="text-xs text-muted-foreground">No scores yet.</p> : null}
        {leaderboard.rows.map((row, index) => (
          <div key={row.id} className="flex items-center justify-between rounded border border-border px-2 py-1">
            <span>
              #{(page - 1) * pageSize + index + 1} {row.playerName}
            </span>
            <span className="font-medium">{row.score}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <Button size="sm" variant="outline" onClick={() => setPage((value) => Math.max(1, value - 1))}>
          Prev
        </Button>
        <span className="text-xs text-muted-foreground">
          {page}/{totalPages}
        </span>
        <Button size="sm" variant="outline" onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
          Next
        </Button>
      </div>
    </div>
  )
}
