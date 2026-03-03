import { describe, expect, it } from "vitest"
import {
  calculateAudioAttenuation,
  checkSessionSupport,
  checkXRCapabilities,
  createPanorama,
  createSessionConfig,
  createSpatialAudioSource,
  createTeleportTargets,
  findHotspotAtAngle,
  findNearestTeleport,
  getFallbackExperience,
} from "@/lib/immersive/xr-manager"

describe("checkXRCapabilities", () => {
  it("detects XR support when available", () => {
    const caps = checkXRCapabilities({ xr: {} })
    expect(caps.vrSupported).toBe(true)
    expect(caps.arSupported).toBe(true)
  })

  it("returns false when XR not available", () => {
    const caps = checkXRCapabilities({})
    expect(caps.vrSupported).toBe(false)
    expect(caps.arSupported).toBe(false)
  })
})

describe("checkSessionSupport", () => {
  it("returns true when session is supported", async () => {
    const nav = { xr: { isSessionSupported: async () => true } }
    expect(await checkSessionSupport(nav, "immersive-vr")).toBe(true)
  })

  it("returns false when no XR API", async () => {
    expect(await checkSessionSupport({}, "immersive-vr")).toBe(false)
  })

  it("handles errors gracefully", async () => {
    const nav = {
      xr: {
        isSessionSupported: async () => {
          throw new Error("fail")
        },
      },
    }
    expect(await checkSessionSupport(nav, "immersive-vr")).toBe(false)
  })
})

describe("createSessionConfig", () => {
  it("creates VR config with 3d-view fallback", () => {
    const config = createSessionConfig("immersive-vr", ["hand-tracking"])
    expect(config.mode).toBe("immersive-vr")
    expect(config.fallbackTo).toBe("3d-view")
    expect(config.features).toContain("hand-tracking")
  })

  it("creates AR config with flat-view fallback", () => {
    const config = createSessionConfig("immersive-ar")
    expect(config.fallbackTo).toBe("flat-view")
  })
})

describe("getFallbackExperience", () => {
  it("returns 3d fallback description", () => {
    const config = createSessionConfig("immersive-vr")
    expect(getFallbackExperience(config)).toContain("3D")
  })

  it("returns flat fallback description", () => {
    const config = createSessionConfig("immersive-ar")
    expect(getFallbackExperience(config)).toContain("2D")
  })
})

describe("createSpatialAudioSource", () => {
  it("creates audio source with defaults", () => {
    const source = createSpatialAudioSource("bg", "/audio/bg.mp3", [0, 0, 0])
    expect(source.volume).toBe(0.5)
    expect(source.loop).toBe(false)
  })

  it("accepts custom options", () => {
    const source = createSpatialAudioSource("music", "/a.mp3", [1, 2, 3], { volume: 0.8, loop: true })
    expect(source.volume).toBe(0.8)
    expect(source.loop).toBe(true)
    expect(source.position).toEqual([1, 2, 3])
  })
})

describe("calculateAudioAttenuation", () => {
  it("returns 1 at same position", () => {
    expect(calculateAudioAttenuation([0, 0, 0], [0, 0, 0])).toBe(1)
  })

  it("returns 0 beyond max distance", () => {
    expect(calculateAudioAttenuation([0, 0, 0], [100, 0, 0])).toBe(0)
  })

  it("returns 0.5 at half max distance", () => {
    const result = calculateAudioAttenuation([0, 0, 0], [25, 0, 0])
    expect(result).toBe(0.5)
  })

  it("attenuates based on 3D distance", () => {
    const close = calculateAudioAttenuation([0, 0, 0], [5, 0, 0])
    const far = calculateAudioAttenuation([0, 0, 0], [40, 0, 0])
    expect(close).toBeGreaterThan(far)
  })
})

describe("createPanorama / findHotspotAtAngle", () => {
  it("creates panorama with defaults", () => {
    const pano = createPanorama("room1", "/img/room1.jpg")
    expect(pano.fov).toBe(75)
    expect(pano.hotspots).toEqual([])
  })

  it("finds hotspot within angle threshold", () => {
    const pano = createPanorama("room", "/img.jpg", [
      { id: "h1", yaw: 90, pitch: 0, label: "Door", targetPanorama: "hall" },
    ])
    const found = findHotspotAtAngle(pano, 85, 5)
    expect(found?.id).toBe("h1")
  })

  it("returns null when no hotspot in range", () => {
    const pano = createPanorama("room", "/img.jpg", [
      { id: "h1", yaw: 90, pitch: 0, label: "Door", targetPanorama: "hall" },
    ])
    expect(findHotspotAtAngle(pano, 0, 0)).toBeNull()
  })
})

describe("teleport targets", () => {
  const sections = [
    { id: "projects", label: "Projects", position: [0, 0, -10] as [number, number, number] },
    { id: "about", label: "About", position: [20, 0, 0] as [number, number, number] },
    { id: "contact", label: "Contact", position: [-15, 0, 5] as [number, number, number] },
  ]

  it("creates teleport targets from sections", () => {
    const targets = createTeleportTargets(sections)
    expect(targets).toHaveLength(3)
    expect(targets[0].section).toBe("projects")
  })

  it("finds nearest teleport target", () => {
    const targets = createTeleportTargets(sections)
    const nearest = findNearestTeleport([0, 0, 0], targets)
    expect(nearest?.id).toBe("projects")
  })

  it("returns null for empty targets", () => {
    expect(findNearestTeleport([0, 0, 0], [])).toBeNull()
  })
})
