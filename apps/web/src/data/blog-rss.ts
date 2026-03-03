import { blogPosts } from "@/data/blog"
import { BLOG_RSS_OPTIONS } from "@/data/blog-rss-options"
import { buildBlogRssXml } from "@/lib/blog-utils"

export const BLOG_RSS_XML = buildBlogRssXml(blogPosts, BLOG_RSS_OPTIONS)
