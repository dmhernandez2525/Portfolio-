/**
 * Regional optimization with timezone detection, local time display,
 * region-specific content, and location-aware contact information.
 */

export type Region = "north-america" | "europe" | "asia" | "south-america" | "other"

export interface RegionConfig {
  region: Region
  timezone: string
  label: string
  techFocus: string[]
  contactHours: string
}

export interface LocalTimeInfo {
  timezone: string
  localTime: string
  utcOffset: string
  isBusinessHours: boolean
}

export interface RegionalProject {
  name: string
  region: Region
  relevanceScore: number
  technologies: string[]
}

const REGION_CONFIGS: Record<Region, Omit<RegionConfig, "region" | "timezone">> = {
  "north-america": {
    label: "North America",
    techFocus: ["React", "Node.js", "AWS", "TypeScript"],
    contactHours: "9:00 AM - 5:00 PM EST",
  },
  europe: {
    label: "Europe",
    techFocus: ["TypeScript", "Vue", "Docker", "Kubernetes"],
    contactHours: "9:00 AM - 5:00 PM CET",
  },
  asia: {
    label: "Asia Pacific",
    techFocus: ["React", "Python", "Cloud", "Mobile"],
    contactHours: "9:00 AM - 5:00 PM JST",
  },
  "south-america": {
    label: "South America",
    techFocus: ["React", "Node.js", "PostgreSQL", "TypeScript"],
    contactHours: "9:00 AM - 5:00 PM BRT",
  },
  other: {
    label: "International",
    techFocus: ["React", "TypeScript", "Node.js", "Python"],
    contactHours: "Available by appointment",
  },
}

export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return "UTC"
  }
}

export function detectRegion(timezone: string): Region {
  const tz = timezone.toLowerCase()

  if (tz.startsWith("america/new") || tz.startsWith("america/chicago") ||
      tz.startsWith("america/denver") || tz.startsWith("america/los") ||
      tz.startsWith("america/toronto") || tz.startsWith("us/") ||
      tz.startsWith("canada/")) {
    return "north-america"
  }

  if (tz.startsWith("europe/") || tz.startsWith("atlantic/")) {
    return "europe"
  }

  if (tz.startsWith("asia/") || tz.startsWith("australia/") ||
      tz.startsWith("pacific/")) {
    return "asia"
  }

  if (tz.startsWith("america/sao") || tz.startsWith("america/buenos") ||
      tz.startsWith("america/bogota") || tz.startsWith("america/lima") ||
      tz.startsWith("america/santiago")) {
    return "south-america"
  }

  return "other"
}

export function getRegionConfig(region: Region, timezone: string): RegionConfig {
  const config = REGION_CONFIGS[region]
  return { region, timezone, ...config }
}

export function getLocalTime(timezone: string, now: Date = new Date()): LocalTimeInfo {
  let localTime: string
  let utcOffset: string

  try {
    localTime = now.toLocaleTimeString("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })

    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    })
    const parts = formatter.formatToParts(now)
    const offsetPart = parts.find((p) => p.type === "timeZoneName")
    utcOffset = offsetPart?.value ?? "UTC"
  } catch {
    localTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
    utcOffset = "UTC"
  }

  const hour = getHourInTimezone(now, timezone)
  const isBusinessHours = hour >= 9 && hour < 17

  return { timezone, localTime, utcOffset, isBusinessHours }
}

function getHourInTimezone(date: Date, timezone: string): number {
  try {
    const str = date.toLocaleString("en-US", { timeZone: timezone, hour: "numeric", hour12: false })
    return parseInt(str, 10)
  } catch {
    return date.getUTCHours()
  }
}

export function getRegionalProjects(
  projects: Array<{ name: string; technologies: string[] }>,
  region: Region
): RegionalProject[] {
  const regionTech = new Set(
    REGION_CONFIGS[region].techFocus.map((t) => t.toLowerCase())
  )

  return projects
    .map((proj) => {
      const overlap = proj.technologies.filter((t) => regionTech.has(t.toLowerCase())).length
      const relevanceScore = proj.technologies.length > 0
        ? Math.round((overlap / proj.technologies.length) * 100)
        : 0
      return { name: proj.name, region, relevanceScore, technologies: proj.technologies }
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
}

export function getContactInfoForRegion(region: Region): {
  hours: string
  responseTime: string
  preferredChannel: string
} {
  const config = REGION_CONFIGS[region]

  const channelMap: Record<Region, string> = {
    "north-america": "Email or LinkedIn",
    europe: "Email",
    asia: "Email or WeChat",
    "south-america": "Email or WhatsApp",
    other: "Email",
  }

  return {
    hours: config.contactHours,
    responseTime: region === "other" ? "Within 48 hours" : "Within 24 hours",
    preferredChannel: channelMap[region],
  }
}
