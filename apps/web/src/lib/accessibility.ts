export function announceToScreenReader(message: string, priority: "polite" | "assertive" = "polite"): void {
  if (typeof document === "undefined") return

  const el = document.createElement("div")
  el.setAttribute("role", "status")
  el.setAttribute("aria-live", priority)
  el.setAttribute("aria-atomic", "true")
  el.className = "sr-only"
  el.textContent = message

  document.body.appendChild(el)
  setTimeout(() => el.remove(), 1000)
}

export interface A11yAuditResult {
  element: string
  issue: string
  severity: "error" | "warning"
}

export function runBasicA11yAudit(): A11yAuditResult[] {
  if (typeof document === "undefined") return []

  const results: A11yAuditResult[] = []

  const images = document.querySelectorAll("img")
  images.forEach((img) => {
    if (!img.alt && !img.getAttribute("role")) {
      results.push({
        element: `img[src="${img.src.slice(0, 60)}"]`,
        issue: "Image missing alt text",
        severity: "error",
      })
    }
  })

  const buttons = document.querySelectorAll("button")
  buttons.forEach((btn) => {
    if (!btn.textContent?.trim() && !btn.getAttribute("aria-label") && !btn.getAttribute("title")) {
      results.push({
        element: `button.${btn.className.slice(0, 30)}`,
        issue: "Button has no accessible name",
        severity: "error",
      })
    }
  })

  const links = document.querySelectorAll("a")
  links.forEach((link) => {
    if (!link.textContent?.trim() && !link.getAttribute("aria-label")) {
      results.push({
        element: `a[href="${link.href.slice(0, 40)}"]`,
        issue: "Link has no accessible name",
        severity: "error",
      })
    }
  })

  const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6")
  let previousLevel = 0
  headings.forEach((heading) => {
    const level = parseInt(heading.tagName[1], 10)
    if (previousLevel > 0 && level > previousLevel + 1) {
      results.push({
        element: heading.tagName.toLowerCase(),
        issue: `Heading level skipped from h${previousLevel} to h${level}`,
        severity: "warning",
      })
    }
    previousLevel = level
  })

  return results
}
