import type { EasterEggDefinition, EasterEggProgress } from "@/types/easter-eggs"

function buildShareText(egg: EasterEggDefinition, progress: EasterEggProgress): string {
  return [
    "I just discovered a hidden Portfolio easter egg!",
    `Egg: ${egg.name}`,
    `Difficulty: ${egg.difficulty}`,
    `Progress: ${progress.discoveredIds.length}/${progress.totalDiscoverable} (${progress.completionPercentage}%)`,
    "Can you find the rest?",
  ].join("\n")
}

async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return false
  }

  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export async function shareEasterEggDiscovery(egg: EasterEggDefinition, progress: EasterEggProgress): Promise<"shared" | "copied" | "failed"> {
  const text = buildShareText(egg, progress)

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ title: "Portfolio Easter Egg", text })
      return "shared"
    } catch {
      // fall back to clipboard
    }
  }

  const copied = await copyToClipboard(text)
  return copied ? "copied" : "failed"
}
