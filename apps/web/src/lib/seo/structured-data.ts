export interface PersonSchema {
  name: string
  jobTitle: string
  url: string
  sameAs: string[]
}

export function buildPersonJsonLd(person: PersonSchema): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    jobTitle: person.jobTitle,
    url: person.url,
    sameAs: person.sameAs,
  })
}

export function buildWebSiteJsonLd(name: string, url: string): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${url}/projects?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  })
}

export interface BreadcrumbItem {
  name: string
  url: string
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  })
}
