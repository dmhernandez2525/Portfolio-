import { useMemo, useState } from "react"
import { Download, Trophy } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { generateAchievementShareCard } from "@/lib/achievement-share-card"
import { buildGameStatsReport, getAchievements, getDailyChallenge, getLeaderboard, getPlayerProfiles, getWeeklyLeaderboard, submitGameScore } from "@/lib/game-stats-store"
import type { GameId } from "@/types/game-stats"

const GAME_OPTIONS: GameId[] = ["snake", "tetris", "chess", "cookie-clicker", "tanks", "agar", "mafia-wars", "pokemon", "shopping-cart-hero", "game"]

function downloadDataUrl(filename: string, dataUrl: string): void {
  const anchor = document.createElement("a")
  anchor.href = dataUrl
  anchor.download = filename
  anchor.click()
}

export function GameStatsPanel() {
  const [selectedGame, setSelectedGame] = useState<GameId>("snake")
  const [sortBy, setSortBy] = useState<"score" | "date" | "player">("score")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState<number>(1)
  const [playerName, setPlayerName] = useState<string>("Demo Player")
  const [scoreInput, setScoreInput] = useState<number>(500)
  const [durationInput, setDurationInput] = useState<number>(180)
  const pageSize = 10

  const leaderboard = useMemo(
    () =>
      getLeaderboard({
        gameId: selectedGame,
        page,
        pageSize,
        sortBy,
        sortOrder,
      }),
    [page, selectedGame, sortBy, sortOrder],
  )
  const totalPages = Math.max(1, Math.ceil(leaderboard.total / pageSize))
  const profiles = useMemo(() => getPlayerProfiles(), [leaderboard.total])
  const report = useMemo(() => buildGameStatsReport(), [leaderboard.total])
  const challenge = useMemo(() => getDailyChallenge(), [])
  const weeklyLeaderboard = useMemo(() => getWeeklyLeaderboard(selectedGame).slice(0, 5), [selectedGame, leaderboard.total])

  const handleSubmitScore = (): void => {
    const playerId = playerName.toLowerCase().replace(/\s+/g, "-")
    submitGameScore({
      gameId: selectedGame,
      playerId,
      playerName,
      score: scoreInput,
      won: scoreInput >= challenge.targetScore,
      durationSeconds: durationInput,
      config: { mode: "standard", difficulty: "medium" },
    })
    setPage(1)
  }

  const funnelChartData = [
    { name: "Started", value: report.sessionsStarted },
    { name: "Completed", value: report.sessionsCompleted },
    { name: "Unlocked", value: report.achievementsUnlocked },
  ]

  return (
    <section className="mt-8 rounded-xl border border-border bg-card/40 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Game Statistics</h3>
          <p className="text-sm text-muted-foreground">Leaderboards, achievements, streaks, and competitive tracking.</p>
        </div>
        <div className="rounded-md border border-border bg-background px-3 py-2 text-sm">
          Daily Challenge: <strong>{challenge.description}</strong>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted-foreground">Sessions Started</p>
          <p className="text-2xl font-semibold">{report.sessionsStarted}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted-foreground">Sessions Completed</p>
          <p className="text-2xl font-semibold">{report.sessionsCompleted}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted-foreground">Average Duration</p>
          <p className="text-2xl font-semibold">{report.averageDurationSeconds}s</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="mb-2 text-sm font-medium">Competitive Snapshot</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-sm font-medium">Submit Score</p>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            <div>
              <Label htmlFor="game-select">Game</Label>
              <select id="game-select" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={selectedGame} onChange={(event) => setSelectedGame(event.target.value as GameId)}>
                {GAME_OPTIONS.map((gameId) => (
                  <option key={gameId} value={gameId}>
                    {gameId}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="player-name">Player</Label>
              <Input id="player-name" value={playerName} onChange={(event) => setPlayerName(event.target.value)} />
            </div>
            <div>
              <Label htmlFor="score-input">Score</Label>
              <Input id="score-input" type="number" value={scoreInput} onChange={(event) => setScoreInput(Number(event.target.value))} />
            </div>
            <div>
              <Label htmlFor="duration-input">Duration (s)</Label>
              <Input id="duration-input" type="number" value={durationInput} onChange={(event) => setDurationInput(Number(event.target.value))} />
            </div>
          </div>
          <Button className="mt-3" onClick={handleSubmitScore}>
            Submit Verified Score
          </Button>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-background p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">Leaderboard</p>
          <div className="flex items-center gap-2">
            <select className="rounded-md border border-input bg-background px-2 py-1 text-xs" value={sortBy} onChange={(event) => setSortBy(event.target.value as "score" | "date" | "player")}>
              <option value="score">Score</option>
              <option value="date">Date</option>
              <option value="player">Player</option>
            </select>
            <Button size="sm" variant="outline" onClick={() => setSortOrder((value) => (value === "asc" ? "desc" : "asc"))}>
              {sortOrder === "asc" ? "Ascending" : "Descending"}
            </Button>
          </div>
        </div>
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-1">Player</th>
                <th className="py-1">Score</th>
                <th className="py-1">Duration</th>
                <th className="py-1">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.rows.map((row) => (
                <tr key={row.id} className="border-t border-border/60">
                  <td className="py-1">{row.playerName}</td>
                  <td className="py-1">{row.score}</td>
                  <td className="py-1">{row.durationSeconds}s</td>
                  <td className="py-1">{new Date(row.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <Button size="sm" variant="outline" onClick={() => setPage((value) => Math.max(1, value - 1))}>
            Prev
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page} / {totalPages}
          </span>
          <Button size="sm" variant="outline" onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
            Next
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-sm font-medium">Weekly Leaderboard Reset ({selectedGame})</p>
          <ul className="mt-2 space-y-1 text-sm">
            {weeklyLeaderboard.length === 0 ? <li className="text-muted-foreground">No weekly entries yet.</li> : null}
            {weeklyLeaderboard.map((row, index) => (
              <li key={row.id} className="flex items-center justify-between">
                <span>
                  #{index + 1} {row.playerName}
                </span>
                <span className="font-medium">{row.score}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-sm font-medium">Player Profiles & Achievements</p>
          <div className="mt-2 space-y-2">
            {profiles.map((profile) => {
              const achievements = getAchievements(profile.id)
              return (
                <div key={profile.id} className="rounded border border-border p-2">
                  <p className="font-medium">{profile.name}</p>
                  <p className="text-xs text-muted-foreground">Games: {profile.totalGames} · Wins: {profile.totalWins} · Streak: {profile.streakDays} days</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {achievements.map((achievement) => (
                      <span key={achievement.id} className={`rounded-full px-2 py-1 ${achievement.unlocked ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                        {achievement.title} ({achievement.progress}/{achievement.target})
                      </span>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => {
                      const unlocked = achievements.find((achievement) => achievement.unlocked)
                      if (!unlocked) return
                      const card = generateAchievementShareCard({
                        playerName: profile.name,
                        achievementTitle: unlocked.title,
                        streakDays: profile.streakDays,
                      })
                      if (card) downloadDataUrl(`${profile.id}-${unlocked.id}.png`, card)
                    }}
                  >
                    <Download className="mr-1.5 h-4 w-4" />
                    Share Achievement Card
                  </Button>
                </div>
              )
            })}
            {profiles.length === 0 ? (
              <div className="rounded border border-dashed border-border p-3 text-sm text-muted-foreground">
                <Trophy className="mb-2 h-5 w-5" />
                Submit a score to generate player profiles and achievements.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
