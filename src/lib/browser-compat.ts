export interface BrowserInfo {
  name: string
  version: string
  engine: string
}

export function detectBrowser(): BrowserInfo {
  if (typeof navigator === "undefined") {
    return { name: "unknown", version: "0", engine: "unknown" }
  }

  const ua = navigator.userAgent
  if (ua.includes("Firefox/")) return { name: "Firefox", version: extractVersion(ua, "Firefox/"), engine: "Gecko" }
  if (ua.includes("Edg/")) return { name: "Edge", version: extractVersion(ua, "Edg/"), engine: "Blink" }
  if (ua.includes("Chrome/")) return { name: "Chrome", version: extractVersion(ua, "Chrome/"), engine: "Blink" }
  if (ua.includes("Safari/") && !ua.includes("Chrome")) return { name: "Safari", version: extractVersion(ua, "Version/"), engine: "WebKit" }
  return { name: "unknown", version: "0", engine: "unknown" }
}

function extractVersion(ua: string, token: string): string {
  const idx = ua.indexOf(token)
  if (idx < 0) return "0"
  const rest = ua.slice(idx + token.length)
  const match = rest.match(/^[\d.]+/)
  return match ? match[0] : "0"
}

export interface FeatureSupport {
  webgl: boolean
  webgl2: boolean
  webxr: boolean
  speechRecognition: boolean
  broadcastChannel: boolean
  vibration: boolean
  serviceWorker: boolean
}

export function checkFeatureSupport(): FeatureSupport {
  if (typeof window === "undefined") {
    return { webgl: false, webgl2: false, webxr: false, speechRecognition: false, broadcastChannel: false, vibration: false, serviceWorker: false }
  }

  return {
    webgl: checkWebGL(1),
    webgl2: checkWebGL(2),
    webxr: "xr" in navigator,
    speechRecognition: "SpeechRecognition" in window || "webkitSpeechRecognition" in window,
    broadcastChannel: "BroadcastChannel" in window,
    vibration: "vibrate" in navigator,
    serviceWorker: "serviceWorker" in navigator,
  }
}

function checkWebGL(version: 1 | 2): boolean {
  try {
    const canvas = document.createElement("canvas")
    const ctx = version === 2 ? canvas.getContext("webgl2") : canvas.getContext("webgl")
    return ctx !== null
  } catch {
    return false
  }
}

export function getGracefulFallback(feature: keyof FeatureSupport): string {
  const fallbacks: Record<keyof FeatureSupport, string> = {
    webgl: "2D canvas rendering",
    webgl2: "WebGL 1.0 fallback",
    webxr: "Standard 3D view",
    speechRecognition: "Text input only",
    broadcastChannel: "Single-tab experience",
    vibration: "Visual feedback",
    serviceWorker: "Online-only mode",
  }
  return fallbacks[feature]
}
