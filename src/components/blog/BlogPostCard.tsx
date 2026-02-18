import { Calendar, Clock, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import type { BlogPost } from "@/types/blog"

interface BlogPostCardProps {
  post: BlogPost
  onOpen: (postId: string) => void
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function BlogPostCard({ post, onOpen }: BlogPostCardProps) {
  const handleOpen = (): void => {
    onOpen(post.id)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group cursor-pointer"
      onClick={handleOpen}
    >
      <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/80">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {post.category}
          </Badge>
          {post.featured ? <Badge className="bg-yellow-500/90 text-xs">Featured</Badge> : null}
          <span className="text-xs text-muted-foreground">by {post.author}</span>
        </div>

        <h3 className="mb-2 text-xl font-bold transition-colors group-hover:text-primary">{post.title}</h3>

        <p className="mb-4 line-clamp-2 text-muted-foreground">{post.excerpt}</p>

        <div className="mb-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={`${post.id}-${tag}`} variant="outline" className="text-xs capitalize">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readTime} min read
            </span>
          </div>
          <ChevronRight className="h-5 w-5 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>
    </motion.article>
  )
}
