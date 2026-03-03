import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { buildOpenGraphTags, buildTwitterCardTags, getCanonicalUrl, getPageMeta } from "@/lib/seo/meta-tags"
import { buildPersonJsonLd, buildWebSiteJsonLd } from "@/lib/seo/structured-data"

function setMetaTag(name: string, content: string): void {
  const selector = name.startsWith("og:") || name.startsWith("twitter:")
    ? `meta[property="${name}"]`
    : `meta[name="${name}"]`

  let el = document.querySelector(selector) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement("meta")
    if (name.startsWith("og:") || name.startsWith("twitter:")) {
      el.setAttribute("property", name)
    } else {
      el.setAttribute("name", name)
    }
    document.head.appendChild(el)
  }
  el.content = content
}

function setCanonicalLink(url: string): void {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!link) {
    link = document.createElement("link")
    link.rel = "canonical"
    document.head.appendChild(link)
  }
  link.href = url
}

function setJsonLd(id: string, json: string): void {
  let script = document.getElementById(id) as HTMLScriptElement | null
  if (!script) {
    script = document.createElement("script")
    script.id = id
    script.type = "application/ld+json"
    document.head.appendChild(script)
  }
  script.textContent = json
}

export function HeadTags() {
  const location = useLocation()

  useEffect(() => {
    const meta = getPageMeta(location.pathname)

    document.title = meta.title
    setMetaTag("description", meta.description)
    setCanonicalLink(getCanonicalUrl(meta.path))

    const ogTags = buildOpenGraphTags(meta)
    for (const [key, value] of Object.entries(ogTags)) {
      setMetaTag(key, value)
    }

    const twitterTags = buildTwitterCardTags(meta)
    for (const [key, value] of Object.entries(twitterTags)) {
      setMetaTag(key, value)
    }

    setJsonLd("jsonld-person", buildPersonJsonLd({
      name: "Daniel Hernandez",
      jobTitle: "Full-Stack Developer",
      url: "https://portfolio-site.onrender.com",
      sameAs: [
        "https://github.com/dmhernandez2525",
        "https://linkedin.com/in/dh25",
      ],
    }))

    setJsonLd("jsonld-website", buildWebSiteJsonLd(
      "Daniel Hernandez Portfolio",
      "https://portfolio-site.onrender.com",
    ))
  }, [location.pathname])

  return null
}
