import { Calendar, Clock, User, X } from "lucide-react"
import { motion } from "framer-motion"
import type { MouseEvent } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BlogTableOfContents } from "@/components/blog/BlogTableOfContents"
import { BlogShareButtons } from "@/components/blog/BlogShareButtons"
import { MarkdownArticle } from "@/components/blog/MarkdownArticle"
import type { BlogPost, TocHeading } from "@/types/blog"

interface BlogPostModalProps {
  post: BlogPost
  headings: TocHeading[]
  relatedPosts: BlogPost[]
  onClose: () => void
  onSelectPost: (postId: string) => void
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function BlogPostModal({ post, headings, relatedPosts, onClose, onSelectPost }: BlogPostModalProps) {
  const handleOverlayClick = (): void => {
    onClose()
  }

  const handleContainerClick = (event: MouseEvent<HTMLDivElement>): void => {
    event.stopPropagation()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 16 }}
        className="relative flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
        onClick={handleContainerClick}
      >
        <header className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">{post.category}</Badge>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readTime} min read
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Updated {formatDate(post.lastUpdated)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <BlogShareButtons postId={post.id} title={post.title} />
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close post">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <div className="grid flex-1 gap-8 overflow-y-auto p-6 md:grid-cols-[minmax(0,1fr)_280px] md:p-8">
          <article>
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">{post.title}</h1>

            <div className="mb-8 flex flex-wrap items-center gap-4 border-b border-border pb-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Published {formatDate(post.date)}
              </span>
              <span>{post.wordCount} words</span>
            </div>

            <MarkdownArticle content={post.content} headings={headings} />
          </article>

          <aside className="space-y-4">
            <BlogTableOfContents headings={headings} />

            <div className="rounded-lg border border-border/60 bg-card/40 p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Related posts</h2>
              {relatedPosts.length > 0 ? (
                <ul className="space-y-3">
                  {relatedPosts.map((relatedPost) => (
                    <li key={relatedPost.id}>
                      <button
                        type="button"
                        className="text-left text-sm text-muted-foreground transition-colors hover:text-primary"
                        onClick={() => onSelectPost(relatedPost.id)}
                      >
                        <span className="block font-medium text-foreground">{relatedPost.title}</span>
                        <span className="text-xs capitalize">{relatedPost.tags.slice(0, 2).join(" • ")}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No related posts yet.</p>
              )}
            </div>
          </aside>
        </div>
      </motion.div>
    </motion.div>
  )
}
