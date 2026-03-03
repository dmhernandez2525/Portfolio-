import { useEffect, useMemo, useRef } from "react"
import {
  KONAMI_SEQUENCE,
  ORBIT_SEQUENCE,
  PIXEL_PORTAL_SEQUENCE,
  getEasterEggCatalog,
  getSeasonalEasterEgg,
} from "@/lib/easter-eggs/catalog"
import { playMarioCoinSound } from "@/lib/easter-eggs/audio"
import {
  emitEasterEggDiscovery,
  emitEasterEggHint,
  emitEasterEggMiniGame,
} from "@/lib/easter-eggs/events"
import { getNextUndiscoveredHint, loadEasterEggProgress, saveEasterEggDiscovery } from "@/lib/easter-eggs/progress"
import type { EasterEggDefinition, EasterEggDiscoveryEvent } from "@/types/easter-eggs"

interface UseEasterEggsProps {
  onKonami: () => void
  onGandalf: () => void
  onDaniel: () => void
  onGhost: () => void
  onMonkey?: () => void
  onMatrix?: () => void
  onMario?: () => void
  onSeasonal?: (egg: EasterEggDefinition) => void
  onMiniGame?: (miniGameId: string) => void
  onHint?: (hint: string, egg: EasterEggDefinition) => void
  onDiscovery?: (event: EasterEggDiscoveryEvent) => void
  emitEvents?: boolean
  enableInactivityHints?: boolean
  hintDelayMs?: number
  now?: () => Date
}

const TRIGGER_DEDUP_MS = 500
const recentTriggerMap = new Map<string, number>()

function normalizeKey(key: string): string {
  return key.length === 1 ? key.toLowerCase() : key
}

function advanceSequenceIndex(currentIndex: number, expectedSequence: readonly string[], incomingKey: string): number {
  const expected = expectedSequence[currentIndex]
  const normalizedExpected = normalizeKey(expected)
  const normalizedIncoming = normalizeKey(incomingKey)

  if (normalizedIncoming === normalizedExpected) {
    return currentIndex + 1
  }

  return normalizedIncoming === normalizeKey(expectedSequence[0]) ? 1 : 0
}

function getQuadrant(clientX: number, clientY: number, width: number, height: number): string {
  const isLeft = clientX < width / 2
  const isTop = clientY < height / 2

  if (isTop && isLeft) return "top-left"
  if (isTop && !isLeft) return "top-right"
  if (!isTop && !isLeft) return "bottom-right"
  return "bottom-left"
}

function shouldProcessTrigger(id: string): boolean {
  const now = Date.now()
  const previous = recentTriggerMap.get(id)
  if (previous && now - previous < TRIGGER_DEDUP_MS) {
    return false
  }

  recentTriggerMap.set(id, now)
  return true
}

export function useEasterEggs({
  onKonami,
  onGandalf,
  onDaniel,
  onGhost,
  onMonkey,
  onMatrix,
  onMario,
  onSeasonal,
  onMiniGame,
  onHint,
  onDiscovery,
  emitEvents = false,
  enableInactivityHints = false,
  hintDelayMs = 45000,
  now,
}: UseEasterEggsProps) {
  const catalog = useMemo(() => getEasterEggCatalog(now?.() ?? new Date()), [now])

  const bufferRef = useRef("")
  const konamiIndexRef = useRef(0)
  const pixelPortalIndexRef = useRef(0)
  const orbitSequenceRef = useRef<string[]>([])
  const lastActivityRef = useRef(Date.now())
  const idleHintEmittedRef = useRef(false)

  useEffect(() => {
    const touchActivity = () => {
      lastActivityRef.current = Date.now()
      idleHintEmittedRef.current = false
    }

    const triggerDiscovery = (eggId: string, callback?: () => void) => {
      if (!shouldProcessTrigger(eggId)) {
        return
      }

      const activeSeasonal = getSeasonalEasterEgg(now?.() ?? new Date())
      const activeCatalog = [...catalog.filter((item) => item.category !== "seasonal"), activeSeasonal]
      const egg = activeCatalog.find((item) => item.id === eggId)

      if (!egg) {
        return
      }

      const { progress, isNewDiscovery } = saveEasterEggDiscovery(activeCatalog, eggId)
      callback?.()

      if (egg.id === "mario") {
        playMarioCoinSound()
      }

      const event: EasterEggDiscoveryEvent = {
        egg,
        progress,
        isNewDiscovery,
      }

      onDiscovery?.(event)

      if (emitEvents) {
        emitEasterEggDiscovery(event)
      }

      if (egg.category === "mini-game") {
        onMiniGame?.(egg.id)
        if (emitEvents) {
          emitEasterEggMiniGame({ miniGameId: egg.id, title: egg.name })
        }
      }

      if (egg.category === "seasonal") {
        onSeasonal?.(egg)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      touchActivity()

      const key = normalizeKey(event.key)
      const nextBuffer = (bufferRef.current + key).slice(-40)
      bufferRef.current = nextBuffer

      if (nextBuffer.endsWith("gandalf")) {
        triggerDiscovery("gandalf", onGandalf)
        bufferRef.current = ""
        return
      }

      if (nextBuffer.endsWith("daniel")) {
        triggerDiscovery("daniel", onDaniel)
        bufferRef.current = ""
        return
      }

      if (nextBuffer.endsWith("ghost")) {
        triggerDiscovery("ghost", onGhost)
        bufferRef.current = ""
        return
      }

      if (nextBuffer.endsWith("monkey")) {
        triggerDiscovery("monkey", onMonkey)
        bufferRef.current = ""
        return
      }

      if (nextBuffer.endsWith("matrix")) {
        triggerDiscovery("matrix", onMatrix)
        bufferRef.current = ""
        return
      }

      if (nextBuffer.endsWith("mario")) {
        triggerDiscovery("mario", onMario)
        bufferRef.current = ""
        return
      }

      const seasonal = getSeasonalEasterEgg(now?.() ?? new Date())
      if (seasonal.code && nextBuffer.endsWith(seasonal.code)) {
        triggerDiscovery(seasonal.id)
        bufferRef.current = ""
        return
      }

      konamiIndexRef.current = advanceSequenceIndex(konamiIndexRef.current, KONAMI_SEQUENCE, event.key)
      if (konamiIndexRef.current === KONAMI_SEQUENCE.length) {
        triggerDiscovery("konami", onKonami)
        konamiIndexRef.current = 0
        return
      }

      pixelPortalIndexRef.current = advanceSequenceIndex(pixelPortalIndexRef.current, PIXEL_PORTAL_SEQUENCE, event.key)
      if (pixelPortalIndexRef.current === PIXEL_PORTAL_SEQUENCE.length) {
        triggerDiscovery("pixel-portal")
        pixelPortalIndexRef.current = 0
      }
    }

    const handlePointerDown = (event: PointerEvent) => {
      touchActivity()
      const quadrant = getQuadrant(event.clientX, event.clientY, window.innerWidth, window.innerHeight)
      const nextOrbitHistory = [...orbitSequenceRef.current, quadrant].slice(-ORBIT_SEQUENCE.length)
      orbitSequenceRef.current = nextOrbitHistory

      const matched = ORBIT_SEQUENCE.every((expectedQuadrant, index) => nextOrbitHistory[index] === expectedQuadrant)
      if (matched) {
        triggerDiscovery("orbit-runner")
        orbitSequenceRef.current = []
      }
    }

    const handlePointerMove = () => {
      touchActivity()
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("pointerdown", handlePointerDown)
    window.addEventListener("pointermove", handlePointerMove)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("pointermove", handlePointerMove)
    }
  }, [catalog, emitEvents, now, onDaniel, onDiscovery, onGandalf, onGhost, onKonami, onMario, onMatrix, onMiniGame, onMonkey, onSeasonal])

  useEffect(() => {
    if (!enableInactivityHints) {
      return
    }

    const interval = setInterval(() => {
      const idleFor = Date.now() - lastActivityRef.current
      if (idleFor < hintDelayMs || idleHintEmittedRef.current) {
        return
      }

      const seasonal = getSeasonalEasterEgg(now?.() ?? new Date())
      const activeCatalog = [...catalog.filter((item) => item.category !== "seasonal"), seasonal]
      const progress = loadEasterEggProgress(activeCatalog)
      const nextHintEgg = getNextUndiscoveredHint(activeCatalog, progress)

      if (!nextHintEgg) {
        return
      }

      onHint?.(nextHintEgg.hint, nextHintEgg)
      if (emitEvents) {
        emitEasterEggHint({ egg: nextHintEgg, hint: nextHintEgg.hint })
      }
      idleHintEmittedRef.current = true
    }, 1000)

    return () => clearInterval(interval)
  }, [catalog, emitEvents, enableInactivityHints, hintDelayMs, now, onHint])
}
