import { useCallback, useEffect, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, Calendar, Clock, Rss } from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"
import { BlogFilters } from "@/components/blog/BlogFilters"
import { BlogPagination } from "@/components/blog/BlogPagination"
import { BlogPostCard } from "@/components/blog/BlogPostCard"
import { BlogPostModal } from "@/components/blog/BlogPostModal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BLOG_CATEGORIES, BLOG_PAGE_SIZES, blogPosts, blogTags } from "@/data/blog"
import {
  extractMarkdownHeadings,
  filterBlogPosts,
  getRelatedPosts,
  paginateBlogPosts,
} from "@/lib/blog-utils"
import type { BlogCategoryFilter } from "@/types/blog"

const DEFAULT_PAGE_SIZE = BLOG_PAGE_SIZES[0]
const CATEGORY_OPTIONS: BlogCategoryFilter[] = ["All", ...BLOG_CATEGORIES]

function isCategoryFilter(value: string): value is BlogCategoryFilter {
  return CATEGORY_OPTIONS.includes(value as BlogCategoryFilter)
}

function parsePage(value: string | null): number {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) return 1
  return parsed
}

function parsePageSize(value: string | null): number {
  const parsed = Number(value)
  return BLOG_PAGE_SIZES.includes(parsed) ? parsed : DEFAULT_PAGE_SIZE
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function Blog() {
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get("q") ?? ""
  const rawCategory = searchParams.get("category")
  const category = rawCategory && isCategoryFilter(rawCategory) ? rawCategory : "All"
  const tag = searchParams.get("tag") ?? ""
  const page = parsePage(searchParams.get("page"))
  const pageSize = parsePageSize(searchParams.get("pageSize"))
  const selectedPostId = searchParams.get("post")

  const featuredPost = useMemo(() => blogPosts.find((post) => post.featured) ?? null, [])

  const hasActiveFilters = query.trim().length > 0 || category !== "All" || tag.length > 0

  const filteredPosts = useMemo(
    () => filterBlogPosts(blogPosts, { query, category, tag }),
    [query, category, tag],
  )

  const postsForGrid = useMemo(() => {
    if (!hasActiveFilters && featuredPost) {
      return filteredPosts.filter((post) => post.id !== featuredPost.id)
    }

    return filteredPosts
  }, [featuredPost, filteredPosts, hasActiveFilters])

  const paginatedPosts = useMemo(
    () => paginateBlogPosts(postsForGrid, page, pageSize),
    [postsForGrid, page, pageSize],
  )

  const selectedPost = useMemo(() => {
    if (!selectedPostId) return null
    return blogPosts.find((post) => post.id === selectedPostId) ?? null
  }, [selectedPostId])

  const postHeadings = useMemo(() => {
    if (!selectedPost) return []
    return extractMarkdownHeadings(selectedPost.content)
  }, [selectedPost])

  const relatedPosts = useMemo(() => {
    if (!selectedPost) return []
    return getRelatedPosts(blogPosts, selectedPost)
  }, [selectedPost])

  const updateSearchParams = useCallback(
    (updates: Record<string, string | null>): void => {
      const next = new URLSearchParams(searchParams)

      for (const [key, value] of Object.entries(updates)) {
        const shouldClear =
          value === null || value === "" || (key === "category" && value === "All") || (key === "page" && value === "1")

        if (shouldClear) {
          next.delete(key)
        } else {
          next.set(key, value)
        }
      }

      setSearchParams(next)
    },
    [searchParams, setSearchParams],
  )

  useEffect(() => {
    if (rawCategory && !isCategoryFilter(rawCategory)) {
      updateSearchParams({ category: null })
    }
  }, [rawCategory, updateSearchParams])

  useEffect(() => {
    if (tag && !blogTags.includes(tag.toLowerCase())) {
      updateSearchParams({ tag: null })
    }
  }, [tag, updateSearchParams])

  useEffect(() => {
    if (paginatedPosts.pagination.totalPages > 0 && page > paginatedPosts.pagination.totalPages) {
      updateSearchParams({ page: String(paginatedPosts.pagination.totalPages) })
    }

    if (paginatedPosts.pagination.totalPages === 0 && page !== 1) {
      updateSearchParams({ page: "1" })
    }
  }, [page, paginatedPosts.pagination.totalPages, updateSearchParams])

  useEffect(() => {
    if (selectedPostId && !selectedPost) {
      updateSearchParams({ post: null })
    }
  }, [selectedPostId, selectedPost, updateSearchParams])

  const handleQueryChange = (value: string): void => {
    updateSearchParams({ q: value, page: "1" })
  }

  const handleCategoryChange = (value: BlogCategoryFilter): void => {
    updateSearchParams({ category: value, page: "1" })
  }

  const handleTagChange = (value: string): void => {
    updateSearchParams({ tag: value, page: "1" })
  }

  const handlePageSizeChange = (value: number): void => {
    updateSearchParams({ pageSize: String(value), page: "1" })
  }

  const handlePageChange = (nextPage: number): void => {
    updateSearchParams({ page: String(nextPage) })
  }

  const handleOpenPost = (postId: string): void => {
    updateSearchParams({ post: postId })
  }

  const handleClosePost = (): void => {
    updateSearchParams({ post: null })
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20 pt-24">
        <div className="container max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
            <h1 className="mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
              Thoughts & Insights
            </h1>
            <p className="text-xl text-muted-foreground">Engineering, philosophy, and lessons from building things</p>

            <div className="mt-6 flex justify-center">
              <Button asChild variant="outline" size="sm">
                <a href="/rss.xml" target="_blank" rel="noreferrer" className="gap-2">
                  <Rss className="h-4 w-4" />
                  RSS Feed
                </a>
              </Button>
            </div>
          </motion.div>

          {!hasActiveFilters && featuredPost ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-10"
            >
              <button
                type="button"
                className="relative w-full cursor-pointer overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10 p-8 text-left transition-colors hover:border-primary/50"
                onClick={() => handleOpenPost(featuredPost.id)}
              >
                <Badge className="mb-4 bg-yellow-500">Featured</Badge>
                <h2 className="mb-3 text-2xl font-bold md:text-3xl">{featuredPost.title}</h2>
                <p className="mb-4 max-w-3xl text-lg text-muted-foreground">{featuredPost.excerpt}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(featuredPost.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {featuredPost.readTime} min read
                  </span>
                </div>
              </button>
            </motion.div>
          ) : null}

          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mb-8">
            <BlogFilters
              query={query}
              category={category}
              tag={tag}
              pageSize={pageSize}
              categories={BLOG_CATEGORIES}
              tags={blogTags}
              pageSizes={BLOG_PAGE_SIZES}
              onQueryChange={handleQueryChange}
              onCategoryChange={handleCategoryChange}
              onTagChange={handleTagChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </motion.section>

          <p className="mb-6 text-sm text-muted-foreground">{postsForGrid.length} posts match the current filters.</p>

          <section className="grid gap-6 md:grid-cols-2">
            {paginatedPosts.items.map((post) => (
              <BlogPostCard key={post.id} post={post} onOpen={handleOpenPost} />
            ))}
          </section>

          {paginatedPosts.items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No posts match these filters.</div>
          ) : null}

          <BlogPagination pagination={paginatedPosts.pagination} onPageChange={handlePageChange} />

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-16 flex justify-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Portfolio
              </Link>
            </Button>
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {selectedPost ? (
          <BlogPostModal
            post={selectedPost}
            headings={postHeadings}
            relatedPosts={relatedPosts}
            onClose={handleClosePost}
            onSelectPost={handleOpenPost}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}
