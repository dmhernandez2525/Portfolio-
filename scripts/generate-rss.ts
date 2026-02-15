import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { BLOG_POST_METADATA } from "../src/data/blog-metadata"
import { BLOG_RSS_OPTIONS } from "../src/data/blog-rss-options"
import { buildBlogRssXml, calculateReadTime, countWords } from "../src/lib/blog-utils"
import type { BlogPost } from "../src/types/blog"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, "..")
const BLOG_CONTENT_DIR = path.join(PROJECT_ROOT, "src", "content", "blog")
const OUTPUT_PATH = path.join(PROJECT_ROOT, "public", "rss.xml")

async function buildPostsForFeed(): Promise<BlogPost[]> {
  const posts = await Promise.all(
    BLOG_POST_METADATA.map(async (metadata) => {
      const markdownPath = path.join(BLOG_CONTENT_DIR, `${metadata.id}.md`)
      const content = await readFile(markdownPath, "utf8")

      return {
        ...metadata,
        content,
        readTime: calculateReadTime(content),
        wordCount: countWords(content),
      }
    }),
  )

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

async function main(): Promise<void> {
  const posts = await buildPostsForFeed()
  const xml = buildBlogRssXml(posts, BLOG_RSS_OPTIONS)
  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await writeFile(OUTPUT_PATH, xml, "utf8")
}

await main()
