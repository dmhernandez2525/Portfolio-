import { describe, expect, it, vi } from "vitest"
import {
  detectBrowserLocale,
  getLocaleLabel,
  getSupportedLocales,
  getTranslations,
  translatePath,
} from "@/lib/i18n/translations"

describe("getTranslations", () => {
  it("returns English translations", () => {
    const t = getTranslations("en")
    expect(t.nav.home).toBe("Home")
    expect(t.hero.greeting).toContain("Daniel")
  })

  it("returns Spanish translations", () => {
    const t = getTranslations("es")
    expect(t.nav.home).toBe("Inicio")
    expect(t.hero.greeting).toContain("Hola")
  })

  it("returns French translations", () => {
    const t = getTranslations("fr")
    expect(t.nav.home).toBe("Accueil")
    expect(t.hero.greeting).toContain("Bonjour")
  })

  it("returns German translations", () => {
    const t = getTranslations("de")
    expect(t.nav.home).toBe("Startseite")
    expect(t.hero.greeting).toContain("Hallo")
  })

  it("all translations have same keys", () => {
    const locales = getSupportedLocales()
    const enKeys = JSON.stringify(Object.keys(getTranslations("en")))
    for (const locale of locales) {
      const keys = JSON.stringify(Object.keys(getTranslations(locale)))
      expect(keys).toBe(enKeys)
    }
  })

  it("no translation value is empty", () => {
    for (const locale of getSupportedLocales()) {
      const t = getTranslations(locale)
      for (const section of Object.values(t)) {
        for (const value of Object.values(section)) {
          expect(value).toBeTruthy()
        }
      }
    }
  })
})

describe("getSupportedLocales", () => {
  it("returns all 4 locales", () => {
    const locales = getSupportedLocales()
    expect(locales).toContain("en")
    expect(locales).toContain("es")
    expect(locales).toContain("fr")
    expect(locales).toContain("de")
    expect(locales).toHaveLength(4)
  })
})

describe("getLocaleLabel", () => {
  it("returns human-readable labels", () => {
    expect(getLocaleLabel("en")).toBe("English")
    expect(getLocaleLabel("es")).toBe("Espa\u00F1ol")
    expect(getLocaleLabel("fr")).toBe("Fran\u00E7ais")
    expect(getLocaleLabel("de")).toBe("Deutsch")
  })
})

describe("detectBrowserLocale", () => {
  it("detects supported browser locale", () => {
    vi.stubGlobal("navigator", { language: "es-MX" })
    expect(detectBrowserLocale()).toBe("es")
  })

  it("falls back to English for unsupported locale", () => {
    vi.stubGlobal("navigator", { language: "ja-JP" })
    expect(detectBrowserLocale()).toBe("en")
  })

  it("returns English when navigator is undefined", () => {
    vi.stubGlobal("navigator", undefined)
    expect(detectBrowserLocale()).toBe("en")
  })
})

describe("translatePath", () => {
  it("translates path between locales", () => {
    const result = translatePath("/projects/app", "en", "es")
    expect(result).toContain("proyectos")
  })

  it("returns same path for same locale", () => {
    expect(translatePath("/blog", "en", "en")).toBe("/blog")
  })

  it("returns path unchanged if no match found", () => {
    expect(translatePath("/unknown", "en", "es")).toBe("/unknown")
  })
})
