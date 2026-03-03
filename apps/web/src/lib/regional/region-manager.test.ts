import { describe, expect, it } from "vitest"
import {
  detectRegion,
  getContactInfoForRegion,
  getLocalTime,
  getRegionConfig,
  getRegionalProjects,
} from "@/lib/regional/region-manager"

describe("detectRegion", () => {
  it("detects North America from US timezone", () => {
    expect(detectRegion("America/New_York")).toBe("north-america")
    expect(detectRegion("America/Chicago")).toBe("north-america")
    expect(detectRegion("America/Los_Angeles")).toBe("north-america")
    expect(detectRegion("US/Eastern")).toBe("north-america")
  })

  it("detects Europe from European timezone", () => {
    expect(detectRegion("Europe/London")).toBe("europe")
    expect(detectRegion("Europe/Berlin")).toBe("europe")
    expect(detectRegion("Europe/Paris")).toBe("europe")
  })

  it("detects Asia from Asian timezone", () => {
    expect(detectRegion("Asia/Tokyo")).toBe("asia")
    expect(detectRegion("Asia/Shanghai")).toBe("asia")
    expect(detectRegion("Australia/Sydney")).toBe("asia")
  })

  it("detects South America from SA timezone", () => {
    expect(detectRegion("America/Sao_Paulo")).toBe("south-america")
    expect(detectRegion("America/Buenos_Aires")).toBe("south-america")
  })

  it("returns other for unknown timezone", () => {
    expect(detectRegion("Africa/Cairo")).toBe("other")
    expect(detectRegion("unknown")).toBe("other")
  })
})

describe("getRegionConfig", () => {
  it("returns config for North America", () => {
    const config = getRegionConfig("north-america", "America/New_York")
    expect(config.label).toBe("North America")
    expect(config.techFocus).toContain("React")
    expect(config.timezone).toBe("America/New_York")
  })

  it("returns config for Europe", () => {
    const config = getRegionConfig("europe", "Europe/London")
    expect(config.label).toBe("Europe")
    expect(config.techFocus).toContain("Vue")
  })

  it("returns config for Asia", () => {
    const config = getRegionConfig("asia", "Asia/Tokyo")
    expect(config.label).toBe("Asia Pacific")
  })
})

describe("getLocalTime", () => {
  it("returns time info for valid timezone", () => {
    const info = getLocalTime("America/New_York")
    expect(info.timezone).toBe("America/New_York")
    expect(info.localTime).toBeTruthy()
    expect(typeof info.isBusinessHours).toBe("boolean")
  })

  it("identifies business hours correctly", () => {
    // Create a date at 10 AM UTC
    const morning = new Date("2025-06-15T14:00:00Z") // 10 AM EDT
    const info = getLocalTime("America/New_York", morning)
    expect(info.isBusinessHours).toBe(true)
  })

  it("identifies after-hours correctly", () => {
    // Create a date at midnight UTC (8 PM EDT previous day)
    const night = new Date("2025-06-16T04:00:00Z") // midnight EDT
    const info = getLocalTime("America/New_York", night)
    expect(info.isBusinessHours).toBe(false)
  })

  it("handles invalid timezone gracefully", () => {
    const info = getLocalTime("Invalid/Zone")
    expect(info.localTime).toBeTruthy()
  })
})

describe("getRegionalProjects", () => {
  const projects = [
    { name: "react-app", technologies: ["React", "TypeScript", "AWS"] },
    { name: "vue-app", technologies: ["Vue", "Docker"] },
    { name: "python-api", technologies: ["Python", "Flask"] },
  ]

  it("ranks projects by regional tech relevance", () => {
    const ranked = getRegionalProjects(projects, "north-america")
    expect(ranked[0].name).toBe("react-app")
    expect(ranked[0].relevanceScore).toBeGreaterThan(0)
  })

  it("ranks Vue app higher for Europe", () => {
    const ranked = getRegionalProjects(projects, "europe")
    const vueIdx = ranked.findIndex((p) => p.name === "vue-app")
    const pythonIdx = ranked.findIndex((p) => p.name === "python-api")
    expect(vueIdx).toBeLessThan(pythonIdx)
  })

  it("handles empty project list", () => {
    expect(getRegionalProjects([], "asia")).toEqual([])
  })

  it("handles projects with no matching tech", () => {
    const niche = [{ name: "haskell-lib", technologies: ["Haskell"] }]
    const ranked = getRegionalProjects(niche, "north-america")
    expect(ranked[0].relevanceScore).toBe(0)
  })
})

describe("getContactInfoForRegion", () => {
  it("returns North America contact info", () => {
    const info = getContactInfoForRegion("north-america")
    expect(info.hours).toContain("EST")
    expect(info.preferredChannel).toContain("LinkedIn")
    expect(info.responseTime).toContain("24")
  })

  it("returns Europe contact info", () => {
    const info = getContactInfoForRegion("europe")
    expect(info.hours).toContain("CET")
  })

  it("returns extended response time for other regions", () => {
    const info = getContactInfoForRegion("other")
    expect(info.responseTime).toContain("48")
  })

  it("returns WhatsApp for South America", () => {
    const info = getContactInfoForRegion("south-america")
    expect(info.preferredChannel).toContain("WhatsApp")
  })
})
