import { getEasterEggCatalog } from "@/lib/easter-eggs/catalog"
import { emitEasterEggDiscovery } from "@/lib/easter-eggs/events"
import { saveEasterEggDiscovery } from "@/lib/easter-eggs/progress"

export function triggerVoiceEasterEgg(eggId: string): boolean {
  if (typeof window === "undefined") {
    return false
  }

  const catalog = getEasterEggCatalog()
  const egg = catalog.find((entry) => entry.id === eggId)
  if (!egg) {
    return false
  }

  const { progress, isNewDiscovery } = saveEasterEggDiscovery(catalog, eggId)
  emitEasterEggDiscovery({ egg, progress, isNewDiscovery })
  window.dispatchEvent(new CustomEvent<{ eggId: string }>("voice-easter-egg", { detail: { eggId } }))
  return true
}
