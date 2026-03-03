const BASE_URL = "https://portfolio-site.onrender.com"

interface SitemapEntry {
  path: string
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  priority: number
}

const STATIC_ROUTES: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: 1.0 },
  { path: "/projects", changefreq: "weekly", priority: 0.9 },
  { path: "/blog", changefreq: "weekly", priority: 0.8 },
  { path: "/games", changefreq: "monthly", priority: 0.7 },
  { path: "/philosophy", changefreq: "monthly", priority: 0.5 },
  { path: "/inventions", changefreq: "monthly", priority: 0.5 },
  { path: "/social", changefreq: "monthly", priority: 0.4 },
  { path: "/ai-development", changefreq: "monthly", priority: 0.6 },
]

export function generateSitemapXml(projectSlugs: string[] = []): string {
  const allEntries: SitemapEntry[] = [
    ...STATIC_ROUTES,
    ...projectSlugs.map((slug) => ({
      path: `/projects/${slug}`,
      changefreq: "monthly" as const,
      priority: 0.6,
    })),
  ]

  const urls = allEntries
    .map(
      (entry) =>
        `  <url>\n    <loc>${BASE_URL}${entry.path}</loc>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`,
    )
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`
}

export function generateRobotsTxt(): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${BASE_URL}/sitemap.xml`
}
