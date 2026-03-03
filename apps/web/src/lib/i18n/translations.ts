/**
 * Multi-language translation system with Spanish, French, German support,
 * language detection, and Intl-based formatting.
 */

export type SupportedLocale = "en" | "es" | "fr" | "de"

export interface TranslationSet {
  nav: {
    home: string
    projects: string
    blog: string
    about: string
    contact: string
    games: string
    skills: string
  }
  common: {
    loading: string
    error: string
    retry: string
    close: string
    submit: string
    cancel: string
    search: string
    noResults: string
  }
  hero: {
    greeting: string
    subtitle: string
    cta: string
  }
  contact: {
    name: string
    email: string
    message: string
    send: string
    success: string
  }
}

const en: TranslationSet = {
  nav: { home: "Home", projects: "Projects", blog: "Blog", about: "About", contact: "Contact", games: "Games", skills: "Skills" },
  common: { loading: "Loading...", error: "An error occurred", retry: "Retry", close: "Close", submit: "Submit", cancel: "Cancel", search: "Search", noResults: "No results found" },
  hero: { greeting: "Hi, I'm Daniel", subtitle: "Full-Stack Developer", cta: "View My Work" },
  contact: { name: "Name", email: "Email", message: "Message", send: "Send Message", success: "Message sent successfully!" },
}

const es: TranslationSet = {
  nav: { home: "Inicio", projects: "Proyectos", blog: "Blog", about: "Acerca de", contact: "Contacto", games: "Juegos", skills: "Habilidades" },
  common: { loading: "Cargando...", error: "Ocurrio un error", retry: "Reintentar", close: "Cerrar", submit: "Enviar", cancel: "Cancelar", search: "Buscar", noResults: "No se encontraron resultados" },
  hero: { greeting: "Hola, soy Daniel", subtitle: "Desarrollador Full-Stack", cta: "Ver Mi Trabajo" },
  contact: { name: "Nombre", email: "Correo", message: "Mensaje", send: "Enviar Mensaje", success: "Mensaje enviado con exito!" },
}

const fr: TranslationSet = {
  nav: { home: "Accueil", projects: "Projets", blog: "Blog", about: "\u00C0 propos", contact: "Contact", games: "Jeux", skills: "Comp\u00E9tences" },
  common: { loading: "Chargement...", error: "Une erreur est survenue", retry: "R\u00E9essayer", close: "Fermer", submit: "Soumettre", cancel: "Annuler", search: "Rechercher", noResults: "Aucun r\u00E9sultat trouv\u00E9" },
  hero: { greeting: "Bonjour, je suis Daniel", subtitle: "D\u00E9veloppeur Full-Stack", cta: "Voir Mon Travail" },
  contact: { name: "Nom", email: "E-mail", message: "Message", send: "Envoyer le message", success: "Message envoy\u00E9 avec succ\u00E8s !" },
}

const de: TranslationSet = {
  nav: { home: "Startseite", projects: "Projekte", blog: "Blog", about: "\u00DCber mich", contact: "Kontakt", games: "Spiele", skills: "F\u00E4higkeiten" },
  common: { loading: "Wird geladen...", error: "Ein Fehler ist aufgetreten", retry: "Erneut versuchen", close: "Schlie\u00DFen", submit: "Absenden", cancel: "Abbrechen", search: "Suchen", noResults: "Keine Ergebnisse gefunden" },
  hero: { greeting: "Hallo, ich bin Daniel", subtitle: "Full-Stack-Entwickler", cta: "Meine Arbeit ansehen" },
  contact: { name: "Name", email: "E-Mail", message: "Nachricht", send: "Nachricht senden", success: "Nachricht erfolgreich gesendet!" },
}

const TRANSLATIONS: Record<SupportedLocale, TranslationSet> = { en, es, fr, de }

export function getTranslations(locale: SupportedLocale): TranslationSet {
  return TRANSLATIONS[locale] ?? TRANSLATIONS.en
}

export function getSupportedLocales(): SupportedLocale[] {
  return ["en", "es", "fr", "de"]
}

export function getLocaleLabel(locale: SupportedLocale): string {
  const labels: Record<SupportedLocale, string> = {
    en: "English",
    es: "Espa\u00F1ol",
    fr: "Fran\u00E7ais",
    de: "Deutsch",
  }
  return labels[locale]
}

export function detectBrowserLocale(): SupportedLocale {
  if (typeof navigator === "undefined") return "en"

  const browserLang = navigator.language?.slice(0, 2).toLowerCase()
  const supported = getSupportedLocales()

  if (supported.includes(browserLang as SupportedLocale)) {
    return browserLang as SupportedLocale
  }

  return "en"
}

export function translatePath(path: string, fromLocale: SupportedLocale, toLocale: SupportedLocale): string {
  if (fromLocale === toLocale) return path
  const fromNav = getTranslations(fromLocale).nav
  const toNav = getTranslations(toLocale).nav

  const navEntries = Object.entries(fromNav) as [keyof TranslationSet["nav"], string][]
  for (const [key, value] of navEntries) {
    const fromSlug = value.toLowerCase().replace(/\s+/g, "-")
    if (path.includes(fromSlug)) {
      const toSlug = toNav[key].toLowerCase().replace(/\s+/g, "-")
      return path.replace(fromSlug, toSlug)
    }
  }

  return path
}
