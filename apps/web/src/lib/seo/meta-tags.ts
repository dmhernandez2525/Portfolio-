export interface MetaTagConfig {
  title: string
  description: string
  path: string
  image?: string
  type?: string
}

const BASE_URL = "https://portfolio-site.onrender.com"
const SITE_NAME = "Daniel Hernandez Portfolio"
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`

export function getCanonicalUrl(path: string): string {
  return `${BASE_URL}${path}`
}

export function buildOpenGraphTags(config: MetaTagConfig): Record<string, string> {
  return {
    "og:title": config.title,
    "og:description": config.description,
    "og:url": getCanonicalUrl(config.path),
    "og:image": config.image ?? DEFAULT_IMAGE,
    "og:type": config.type ?? "website",
    "og:site_name": SITE_NAME,
  }
}

export function buildTwitterCardTags(config: MetaTagConfig): Record<string, string> {
  return {
    "twitter:card": "summary_large_image",
    "twitter:title": config.title,
    "twitter:description": config.description,
    "twitter:image": config.image ?? DEFAULT_IMAGE,
  }
}

export function getPageMeta(path: string): MetaTagConfig {
  const routes: Record<string, MetaTagConfig> = {
    "/": {
      title: "Daniel Hernandez | Full-Stack Developer Portfolio",
      description: "Interactive portfolio featuring 34+ projects, 10 playable browser games, AI voice assistant, and 3D globe visualization.",
      path: "/",
    },
    "/projects": {
      title: "Projects | Daniel Hernandez",
      description: "Explore 34+ projects spanning AI/ML, SaaS, hardware, and games.",
      path: "/projects",
    },
    "/blog": {
      title: "Blog | Daniel Hernandez",
      description: "Technical articles on web development, AI, and software engineering.",
      path: "/blog",
    },
    "/games": {
      title: "Games | Daniel Hernandez",
      description: "10 playable browser games: Snake, Tetris, Chess, Pokemon, and more.",
      path: "/games",
    },
  }

  return routes[path] ?? {
    title: `${SITE_NAME}`,
    description: "Daniel Hernandez - Full-stack developer portfolio.",
    path,
  }
}
