/**
 * WebXR session management, spatial audio, panoramic viewers,
 * and graceful fallback handling for immersive experiences.
 */

export interface XRSessionConfig {
  mode: "immersive-vr" | "immersive-ar" | "inline"
  features: string[]
  fallbackTo: "3d-view" | "flat-view"
}

export interface XRCapabilities {
  vrSupported: boolean
  arSupported: boolean
  handTracking: boolean
  anchors: boolean
}

export interface SpatialAudioSource {
  id: string
  position: [number, number, number]
  volume: number
  loop: boolean
  url: string
}

export interface PanoramaConfig {
  id: string
  imageUrl: string
  initialYaw: number
  initialPitch: number
  fov: number
  hotspots: PanoramaHotspot[]
}

export interface PanoramaHotspot {
  id: string
  yaw: number
  pitch: number
  label: string
  targetPanorama: string
}

export interface TeleportTarget {
  id: string
  label: string
  position: [number, number, number]
  section: string
}

export function checkXRCapabilities(nav: { xr?: { isSessionSupported?: (mode: string) => Promise<boolean> } }): XRCapabilities {
  const hasXR = Boolean(nav.xr)
  return {
    vrSupported: hasXR,
    arSupported: hasXR,
    handTracking: false,
    anchors: false,
  }
}

export async function checkSessionSupport(
  nav: { xr?: { isSessionSupported?: (mode: string) => Promise<boolean> } },
  mode: string
): Promise<boolean> {
  if (!nav.xr?.isSessionSupported) return false
  try {
    return await nav.xr.isSessionSupported(mode)
  } catch {
    return false
  }
}

export function createSessionConfig(
  mode: XRSessionConfig["mode"],
  features: string[] = []
): XRSessionConfig {
  return {
    mode,
    features,
    fallbackTo: mode === "immersive-ar" ? "flat-view" : "3d-view",
  }
}

export function getFallbackExperience(config: XRSessionConfig): string {
  const fallbacks: Record<string, string> = {
    "3d-view": "Interactive 3D portfolio with mouse/touch controls",
    "flat-view": "Standard 2D portfolio with enhanced visuals",
  }
  return fallbacks[config.fallbackTo] ?? "Standard portfolio view"
}

export function createSpatialAudioSource(
  id: string,
  url: string,
  position: [number, number, number],
  options: { volume?: number; loop?: boolean } = {}
): SpatialAudioSource {
  return {
    id,
    url,
    position,
    volume: options.volume ?? 0.5,
    loop: options.loop ?? false,
  }
}

export function calculateAudioAttenuation(
  listenerPos: [number, number, number],
  sourcePos: [number, number, number],
  maxDistance = 50
): number {
  const dx = listenerPos[0] - sourcePos[0]
  const dy = listenerPos[1] - sourcePos[1]
  const dz = listenerPos[2] - sourcePos[2]
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

  if (distance >= maxDistance) return 0
  return Math.max(0, 1 - distance / maxDistance)
}

export function createPanorama(
  id: string,
  imageUrl: string,
  hotspots: PanoramaHotspot[] = []
): PanoramaConfig {
  return {
    id,
    imageUrl,
    initialYaw: 0,
    initialPitch: 0,
    fov: 75,
    hotspots,
  }
}

export function findHotspotAtAngle(
  panorama: PanoramaConfig,
  yaw: number,
  pitch: number,
  threshold = 15
): PanoramaHotspot | null {
  for (const hotspot of panorama.hotspots) {
    const yawDiff = Math.abs(hotspot.yaw - yaw)
    const pitchDiff = Math.abs(hotspot.pitch - pitch)
    if (yawDiff <= threshold && pitchDiff <= threshold) {
      return hotspot
    }
  }
  return null
}

export function createTeleportTargets(
  sections: Array<{ id: string; label: string; position: [number, number, number] }>
): TeleportTarget[] {
  return sections.map((s) => ({
    id: s.id,
    label: s.label,
    position: s.position,
    section: s.id,
  }))
}

export function findNearestTeleport(
  currentPos: [number, number, number],
  targets: TeleportTarget[]
): TeleportTarget | null {
  if (targets.length === 0) return null

  let nearest = targets[0]
  let minDist = distanceBetween(currentPos, nearest.position)

  for (let i = 1; i < targets.length; i++) {
    const d = distanceBetween(currentPos, targets[i].position)
    if (d < minDist) {
      minDist = d
      nearest = targets[i]
    }
  }

  return nearest
}

function distanceBetween(a: [number, number, number], b: [number, number, number]): number {
  const dx = a[0] - b[0]
  const dy = a[1] - b[1]
  const dz = a[2] - b[2]
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}
