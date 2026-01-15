import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowLeft, Calendar, Clock, Tag, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { blogPosts, type BlogPost } from "@/data/blog"

const CATEGORIES = ["All", "Engineering", "Philosophy", "Projects", "Life"] as const

function BlogPostCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/80 transition-all">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="text-xs">
            {post.category}
          </Badge>
          {post.featured && (
            <Badge className="bg-yellow-500/90 text-xs">Featured</Badge>
          )}
        </div>

        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>

        <p className="text-muted-foreground mb-4 line-clamp-2">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readTime} min read
            </span>
          </div>
          <ChevronRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </motion.article>
  )
}

function BlogPostModal({ post, onClose }: { post: BlogPost; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-background rounded-xl border border-border shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{post.category}</Badge>
            <span className="text-sm text-muted-foreground">
              {post.readTime} min read
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b border-border">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric"
              })}
            </span>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            {post.content.split("\n\n").map((paragraph, i) => {
              if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                return (
                  <h3 key={i} className="text-xl font-bold text-primary mt-8 mb-4">
                    {paragraph.replace(/\*\*/g, "")}
                  </h3>
                )
              }
              if (paragraph.startsWith("1. ") || paragraph.startsWith("- ")) {
                const items = paragraph.split("\n").filter(Boolean)
                return (
                  <ul key={i} className="space-y-2 my-4">
                    {items.map((item, j) => (
                      <li key={j} className="text-muted-foreground">
                        {item.replace(/^[\d]+\.\s|\-\s/, "")}
                      </li>
                    ))}
                  </ul>
                )
              }
              return (
                <p key={i} className="text-muted-foreground leading-relaxed mb-4">
                  {paragraph.split("**").map((part, j) =>
                    j % 2 === 1 ? (
                      <strong key={j} className="text-foreground font-semibold">
                        {part}
                      </strong>
                    ) : (
                      part
                    )
                  )}
                </p>
              )
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function Blog() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)

  const filteredPosts = selectedCategory === "All"
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory)

  const featuredPost = blogPosts.find(post => post.featured)

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-24 pb-20">
        <div className="container max-w-5xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Thoughts & Insights
            </h1>
            <p className="text-xl text-muted-foreground">
              Engineering, philosophy, and lessons from building things
            </p>
          </motion.div>

          {/* Featured Post */}
          {featuredPost && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-12"
            >
              <div
                className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10 p-8 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSelectedPost(featuredPost)}
              >
                <Badge className="bg-yellow-500 mb-4">Featured</Badge>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  {featuredPost.title}
                </h2>
                <p className="text-lg text-muted-foreground mb-4 max-w-2xl">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(featuredPost.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {featuredPost.readTime} min read
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 mb-8"
          >
            {CATEGORIES.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="gap-1"
              >
                <Tag className="h-3 w-3" />
                {category}
              </Button>
            ))}
          </motion.div>

          {/* Posts Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {filteredPosts
              .filter(post => !post.featured || selectedCategory !== "All")
              .map(post => (
                <BlogPostCard
                  key={post.id}
                  post={post}
                  onClick={() => setSelectedPost(post)}
                />
              ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No posts in this category yet.
            </div>
          )}

          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex justify-center mt-16"
          >
            <Button asChild variant="outline" size="lg">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Portfolio
              </Link>
            </Button>
          </motion.div>
        </div>
      </main>

      {/* Post Modal */}
      <AnimatePresence>
        {selectedPost && (
          <BlogPostModal
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
