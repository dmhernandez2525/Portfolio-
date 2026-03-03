import { useCallback, useEffect, useMemo, useState } from "react"
import { Sparkles } from "lucide-react"
import { getEasterEggCatalog } from "@/lib/easter-eggs/catalog"
import {
  EASTER_EGG_DISCOVERY_EVENT,
  EASTER_EGG_HINT_EVENT,
  EASTER_EGG_MINI_GAME_EVENT,
} from "@/lib/easter-eggs/events"
import { loadEasterEggProgress } from "@/lib/easter-eggs/progress"
import { shareEasterEggDiscovery } from "@/lib/easter-eggs/share"
import type { EasterEggDefinition, EasterEggDiscoveryEvent, EasterEggHintEvent, EasterEggMiniGameEvent, EasterEggProgress } from "@/types/easter-eggs"
import { EasterEggMiniGameModal } from "@/components/easter-eggs/EasterEggMiniGameModal"

const difficultyStyles: Record<EasterEggDefinition["difficulty"], string> = {
  easy: "bg-emerald-500/15 text-emerald-500",
  medium: "bg-amber-500/15 text-amber-500",
  legendary: "bg-fuchsia-500/15 text-fuchsia-400",
}

function getShareMessage(status: "shared" | "copied" | "failed"): string {
  if (status === "shared") return "Shared"
  if (status === "copied") return "Copied to clipboard"
  return "Share unavailable"
}

export function EasterEggLogPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [catalog, setCatalog] = useState<EasterEggDefinition[]>(() => getEasterEggCatalog())
  const [progress, setProgress] = useState<EasterEggProgress>(() => loadEasterEggProgress(catalog))
  const [hint, setHint] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [miniGame, setMiniGame] = useState<{ id: string; title: string } | null>(null)

  useEffect(() => {
    const refresh = () => {
      const nextCatalog = getEasterEggCatalog()
      setCatalog(nextCatalog)
      setProgress(loadEasterEggProgress(nextCatalog))
    }

    refresh()
    const monthlyRefresh = setInterval(refresh, 60 * 60 * 1000)
    return () => clearInterval(monthlyRefresh)
  }, [])

  useEffect(() => {
    const onDiscovery = (event: Event) => {
      const detail = (event as CustomEvent<EasterEggDiscoveryEvent>).detail
      setProgress(detail.progress)
      if (detail.isNewDiscovery) {
        setStatus(`Discovered: ${detail.egg.name}`)
      }
    }

    const onHint = (event: Event) => {
      const detail = (event as CustomEvent<EasterEggHintEvent>).detail
      setHint(detail.hint)
    }

    const onMiniGame = (event: Event) => {
      const detail = (event as CustomEvent<EasterEggMiniGameEvent>).detail
      setStatus(`Mini-game unlocked: ${detail.title}`)
      setMiniGame({ id: detail.miniGameId, title: detail.title })
    }

    window.addEventListener(EASTER_EGG_DISCOVERY_EVENT, onDiscovery)
    window.addEventListener(EASTER_EGG_HINT_EVENT, onHint)
    window.addEventListener(EASTER_EGG_MINI_GAME_EVENT, onMiniGame)

    return () => {
      window.removeEventListener(EASTER_EGG_DISCOVERY_EVENT, onDiscovery)
      window.removeEventListener(EASTER_EGG_HINT_EVENT, onHint)
      window.removeEventListener(EASTER_EGG_MINI_GAME_EVENT, onMiniGame)
    }
  }, [])

  useEffect(() => {
    if (!status) {
      return
    }
    const timer = setTimeout(() => setStatus(null), 3500)
    return () => clearTimeout(timer)
  }, [status])

  useEffect(() => {
    if (!hint) {
      return
    }
    const timer = setTimeout(() => setHint(null), 6500)
    return () => clearTimeout(timer)
  }, [hint])

  const discoveredSet = useMemo(() => new Set(progress.discoveredIds), [progress.discoveredIds])

  const unlockedRewards = useMemo(() => {
    return catalog
      .flatMap((egg) => egg.rewards)
      .filter((reward, index, list) => {
        if (!progress.unlockedRewardIds.includes(reward.id)) {
          return false
        }
        return list.findIndex((candidate) => candidate.id === reward.id) === index
      })
  }, [catalog, progress.unlockedRewardIds])

  useEffect(() => {
    if (typeof document === "undefined") {
      return
    }

    const hasMatrixTheme = progress.unlockedRewardIds.includes("theme-matrix-green")
    if (hasMatrixTheme) {
      document.documentElement.setAttribute("data-easter-theme", "matrix")
      return
    }

    document.documentElement.removeAttribute("data-easter-theme")
  }, [progress.unlockedRewardIds])

  const handleShare = useCallback(
    async (egg: EasterEggDefinition) => {
      const shareStatus = await shareEasterEggDiscovery(egg, progress)
      setStatus(getShareMessage(shareStatus))
    },
    [progress],
  )

  const handleLaunchMiniGame = (egg: EasterEggDefinition) => {
    setMiniGame({ id: egg.id, title: egg.name })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="fixed right-3 bottom-3 z-[110] px-3 py-2 rounded-full bg-background/95 border border-border shadow-xl text-xs flex items-center gap-2"
      >
        <Sparkles className="size-4 text-amber-500" />
        <span>Egg Log {progress.completionPercentage}%</span>
      </button>

      {(hint || status) && (
        <div className="fixed right-3 bottom-16 z-[110] max-w-xs rounded-lg border border-border bg-background/95 p-3 text-xs shadow-xl">
          {hint && <p className="text-amber-500">Hint: {hint}</p>}
          {status && <p className="text-emerald-500 mt-1">{status}</p>}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[115] bg-black/65 p-4 flex justify-end">
          <div className="w-full max-w-md bg-background rounded-xl border border-border shadow-2xl flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-border flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-base">Easter Egg Log</h2>
                <p className="text-xs text-muted-foreground">
                  {progress.discoveredIds.length}/{progress.totalDiscoverable} found
                </p>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="px-2.5 py-1 rounded border border-border text-sm">
                Close
              </button>
            </div>

            <div className="px-4 pt-3">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: `${progress.completionPercentage}%` }} />
              </div>
              <p className="text-xs mt-2 text-muted-foreground">Completion: {progress.completionPercentage}%</p>
              {progress.completionistUnlocked && (
                <p className="text-xs mt-1 text-fuchsia-400">Completionist unlocked</p>
              )}
            </div>

            <div className="p-4 space-y-2 overflow-y-auto">
              {catalog.map((egg) => {
                const discovered = discoveredSet.has(egg.id)
                return (
                  <div key={egg.id} className="border border-border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">{egg.name}</p>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${difficultyStyles[egg.difficulty]}`}>
                        {egg.difficulty}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {discovered ? egg.description : `Hint: ${egg.hint}`}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] uppercase px-2 py-0.5 rounded ${discovered ? "bg-emerald-500/15 text-emerald-500" : "bg-muted text-muted-foreground"}`}>
                        {discovered ? "Found" : "Hidden"}
                      </span>
                      {egg.rewards.map((reward) => (
                        <span key={reward.id} className="text-[10px] px-2 py-0.5 rounded bg-sky-500/15 text-sky-400">
                          {reward.label}
                        </span>
                      ))}
                    </div>

                    {discovered && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleShare(egg)}
                          className="text-xs px-2 py-1 rounded border border-border hover:bg-muted"
                        >
                          Share
                        </button>
                        {egg.category === "mini-game" && (
                          <button
                            type="button"
                            onClick={() => handleLaunchMiniGame(egg)}
                            className="text-xs px-2 py-1 rounded border border-border hover:bg-muted"
                          >
                            Play
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="p-4 border-t border-border">
              <p className="text-xs font-medium mb-1">Unlocked Rewards</p>
              <div className="flex items-center gap-2 flex-wrap">
                {unlockedRewards.length === 0 && <span className="text-xs text-muted-foreground">No rewards yet</span>}
                {unlockedRewards.map((reward) => (
                  <span key={reward.id} className="text-[10px] px-2 py-1 rounded bg-primary/15 text-primary">
                    {reward.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <EasterEggMiniGameModal gameId={miniGame?.id ?? null} title={miniGame?.title ?? "Mini-game"} onClose={() => setMiniGame(null)} />
    </>
  )
}
