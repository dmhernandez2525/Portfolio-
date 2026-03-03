import { useMemo, useState } from "react"
import { BookOpen, RefreshCw } from "lucide-react"
import { useCreatureDex } from "@/hooks/use-creature-dex"

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(timestamp)
}

export function CreatureDexPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [breedFirst, setBreedFirst] = useState("")
  const [breedSecond, setBreedSecond] = useState("")
  const [tradeSpecies, setTradeSpecies] = useState("")
  const [status, setStatus] = useState<string | null>(null)

  const { species, dexState, breedSpecies, sendTrade, tradeNotice, refreshDex } = useCreatureDex()

  const discoveredSpecies = useMemo(
    () => species.filter((item) => Boolean(dexState.entries[item.id])),
    [dexState.entries, species],
  )

  const handleBreed = () => {
    const offspring = breedSpecies(breedFirst, breedSecond)
    if (offspring) {
      setStatus(`Breeding success: ${offspring}`)
      return
    }
    setStatus("No stable breeding result for this pair.")
  }

  const handleTrade = () => {
    if (!tradeSpecies) {
      setStatus("Select a species first.")
      return
    }

    const sent = sendTrade(tradeSpecies)
    setStatus(sent ? "Trade sent to other open tabs." : "BroadcastChannel not available in this browser.")
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="fixed right-3 bottom-3 z-[110] px-3 py-2 rounded-full bg-background/95 border border-border shadow-xl text-xs flex items-center gap-2"
      >
        <BookOpen className="size-4 text-neon-blue" />
        <span>Creature Dex {dexState.completionPercentage}%</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[115] bg-black/65 p-4 flex justify-start">
          <div className="w-full max-w-lg bg-background rounded-xl border border-border shadow-2xl flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-border flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-base">Creature Dex</h2>
                <p className="text-xs text-muted-foreground">
                  {discoveredSpecies.length}/{species.length} species discovered
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="h-8 w-8 rounded border border-border flex items-center justify-center"
                  onClick={refreshDex}
                  title="Refresh dex"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => setIsOpen(false)} className="px-2.5 py-1 rounded border border-border text-sm">
                  Close
                </button>
              </div>
            </div>

            <div className="px-4 pt-3">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gradient-to-r from-neon-blue to-neon-purple" style={{ width: `${dexState.completionPercentage}%` }} />
              </div>
              <p className="text-xs mt-2 text-muted-foreground">Dex completion: {dexState.completionPercentage}%</p>
            </div>

            {(status || tradeNotice) && (
              <div className="mx-4 mt-3 rounded border border-border bg-muted/40 p-2 text-xs text-muted-foreground">
                {status && <p>{status}</p>}
                {tradeNotice && <p>{tradeNotice}</p>}
              </div>
            )}

            <div className="p-4 space-y-3 overflow-y-auto">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Breeding Lab</h3>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={breedFirst}
                    onChange={(event) => setBreedFirst(event.target.value)}
                    className="h-9 rounded border bg-background text-sm px-2"
                  >
                    <option value="">Parent A</option>
                    {discoveredSpecies.map((item) => (
                      <option key={`a-${item.id}`} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                  <select
                    value={breedSecond}
                    onChange={(event) => setBreedSecond(event.target.value)}
                    className="h-9 rounded border bg-background text-sm px-2"
                  >
                    <option value="">Parent B</option>
                    {discoveredSpecies.map((item) => (
                      <option key={`b-${item.id}`} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>
                <button type="button" onClick={handleBreed} className="h-9 px-3 rounded bg-primary text-primary-foreground text-sm">
                  Breed Creatures
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Tab Trading</h3>
                <div className="flex items-center gap-2">
                  <select
                    value={tradeSpecies}
                    onChange={(event) => setTradeSpecies(event.target.value)}
                    className="h-9 rounded border bg-background text-sm px-2 flex-1"
                  >
                    <option value="">Select species</option>
                    {discoveredSpecies.map((item) => (
                      <option key={`trade-${item.id}`} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                  <button type="button" onClick={handleTrade} className="h-9 px-3 rounded border border-border text-sm">
                    Trade
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Collection Gallery</h3>
                {species.map((item) => {
                  const entry = dexState.entries[item.id]
                  const unlockedLore = dexState.unlockedLore.includes(item.id)
                  return (
                    <div key={item.id} className="border border-border rounded-lg p-3 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm">{item.name}</p>
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {item.rarity}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {unlockedLore ? item.lore : "Lore locked until first capture."}
                      </p>
                      <div className="text-[11px] text-muted-foreground">
                        {entry ? (
                          <>
                            <p>Catches: {entry.catches}</p>
                            <p>First caught: {formatDate(entry.firstCaughtAt)}</p>
                            <p>Last caught: {formatDate(entry.lastCaughtAt)}</p>
                          </>
                        ) : (
                          <p>Not caught yet.</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
