import type { CreatureTradeMessage } from "@/types/creature-system"

const CREATURE_TRADE_CHANNEL = "portfolio-creature-trade"

export interface CreatureTradeChannel {
  sendTrade: (speciesId: string) => void
  close: () => void
}

function createMessage(speciesId: string): CreatureTradeMessage {
  return {
    speciesId,
    timestamp: Date.now(),
    senderId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  }
}

export function createCreatureTradeChannel(onTrade: (message: CreatureTradeMessage) => void): CreatureTradeChannel | null {
  if (typeof window === "undefined" || typeof window.BroadcastChannel === "undefined") {
    return null
  }

  const channel = new window.BroadcastChannel(CREATURE_TRADE_CHANNEL)
  channel.onmessage = (event: MessageEvent<CreatureTradeMessage>) => {
    if (!event.data?.speciesId) {
      return
    }
    onTrade(event.data)
  }

  return {
    sendTrade(speciesId: string) {
      channel.postMessage(createMessage(speciesId))
    },
    close() {
      channel.close()
    },
  }
}
