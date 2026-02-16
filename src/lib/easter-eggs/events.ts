import type { EasterEggDiscoveryEvent, EasterEggHintEvent, EasterEggMiniGameEvent } from "@/types/easter-eggs"

export const EASTER_EGG_DISCOVERY_EVENT = "portfolio:easter-egg-discovered"
export const EASTER_EGG_HINT_EVENT = "portfolio:easter-egg-hint"
export const EASTER_EGG_MINI_GAME_EVENT = "portfolio:easter-mini-game"

export function emitEasterEggDiscovery(detail: EasterEggDiscoveryEvent): void {
  if (typeof window === "undefined") {
    return
  }
  window.dispatchEvent(new CustomEvent<EasterEggDiscoveryEvent>(EASTER_EGG_DISCOVERY_EVENT, { detail }))
}

export function emitEasterEggHint(detail: EasterEggHintEvent): void {
  if (typeof window === "undefined") {
    return
  }
  window.dispatchEvent(new CustomEvent<EasterEggHintEvent>(EASTER_EGG_HINT_EVENT, { detail }))
}

export function emitEasterEggMiniGame(detail: EasterEggMiniGameEvent): void {
  if (typeof window === "undefined") {
    return
  }
  window.dispatchEvent(new CustomEvent<EasterEggMiniGameEvent>(EASTER_EGG_MINI_GAME_EVENT, { detail }))
}
