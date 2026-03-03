/**
 * Locale-aware date, number, and currency formatting using the Intl API.
 */

import type { SupportedLocale } from "./translations"

const LOCALE_MAP: Record<SupportedLocale, string> = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
}

export function formatDate(date: Date, locale: SupportedLocale, style: "short" | "long" = "short"): string {
  const intlLocale = LOCALE_MAP[locale]
  const options: Intl.DateTimeFormatOptions = style === "long"
    ? { year: "numeric", month: "long", day: "numeric" }
    : { year: "numeric", month: "2-digit", day: "2-digit" }

  return new Intl.DateTimeFormat(intlLocale, options).format(date)
}

export function formatNumber(value: number, locale: SupportedLocale): string {
  const intlLocale = LOCALE_MAP[locale]
  return new Intl.NumberFormat(intlLocale).format(value)
}

export function formatCurrency(
  amount: number,
  locale: SupportedLocale,
  currency = "USD"
): string {
  const intlLocale = LOCALE_MAP[locale]
  return new Intl.NumberFormat(intlLocale, {
    style: "currency",
    currency,
  }).format(amount)
}

export function formatRelativeTime(
  date: Date,
  locale: SupportedLocale,
  now: Date = new Date()
): string {
  const diffMs = date.getTime() - now.getTime()
  const diffSecs = Math.round(diffMs / 1000)
  const diffMins = Math.round(diffSecs / 60)
  const diffHours = Math.round(diffMins / 60)
  const diffDays = Math.round(diffHours / 24)

  const intlLocale = LOCALE_MAP[locale]
  const rtf = new Intl.RelativeTimeFormat(intlLocale, { numeric: "auto" })

  if (Math.abs(diffDays) >= 1) return rtf.format(diffDays, "day")
  if (Math.abs(diffHours) >= 1) return rtf.format(diffHours, "hour")
  if (Math.abs(diffMins) >= 1) return rtf.format(diffMins, "minute")
  return rtf.format(diffSecs, "second")
}

export function getIntlLocale(locale: SupportedLocale): string {
  return LOCALE_MAP[locale]
}
