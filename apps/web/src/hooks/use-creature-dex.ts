import { useCallback, useEffect, useMemo, useState } from "react"
import { breedCreatures } from "@/lib/creature-system/breeding"
import { CREATURE_SPECIES_MAP, getDexSpecies } from "@/lib/creature-system/catalog"
import { loadCreatureDexState, registerCreatureCatch } from "@/lib/creature-system/storage"
import { createCreatureTradeChannel } from "@/lib/creature-system/trading"
import type { CreatureDexState } from "@/types/creature-system"

export function useCreatureDex() {
  const [dexState, setDexState] = useState<CreatureDexState>(() => loadCreatureDexState())
  const [tradeNotice, setTradeNotice] = useState<string | null>(null)

  const species = useMemo(() => getDexSpecies(), [])

  const refreshDex = useCallback(() => {
    setDexState(loadCreatureDexState())
  }, [])

  const catchSpecies = useCallback((speciesId: string) => {
    const result = registerCreatureCatch(speciesId)
    setDexState(result.state)
    return result
  }, [])

  const breedSpecies = useCallback((first: string, second: string): string | null => {
    const offspring = breedCreatures(first, second)
    if (!offspring) {
      return null
    }

    const result = registerCreatureCatch(offspring)
    setDexState(result.state)
    return offspring
  }, [])

  useEffect(() => {
    const channel = createCreatureTradeChannel((message) => {
      if (!CREATURE_SPECIES_MAP[message.speciesId]) {
        return
      }

      const result = registerCreatureCatch(message.speciesId)
      setDexState(result.state)
      setTradeNotice(`Trade received: ${CREATURE_SPECIES_MAP[message.speciesId].name}`)
      setTimeout(() => setTradeNotice(null), 3000)
    })

    return () => {
      channel?.close()
    }
  }, [])

  const sendTrade = useCallback((speciesId: string) => {
    const channel = createCreatureTradeChannel(() => {
      // This sender instance does not consume its own outgoing trade.
    })
    if (!channel) {
      return false
    }
    channel.sendTrade(speciesId)
    channel.close()
    return true
  }, [])

  return {
    species,
    dexState,
    catchSpecies,
    breedSpecies,
    refreshDex,
    sendTrade,
    tradeNotice,
  }
}
