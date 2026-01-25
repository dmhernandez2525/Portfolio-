import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowLeft, Youtube, ExternalLink, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SocialContent {
  id: string
  type: "video" | "short"
  title: string
  description: string
  thumbnail?: string
  link: string
  date: string
}

const youtubeContent: SocialContent[] = [
  {
    id: "1",
    type: "video",
    title: "Building a VR Game from Scratch",
    description: "Watch me develop a physics-based VR puzzle game using Unity and hand tracking.",
    link: "https://youtube.com/@danieldanger5539",
    date: "2024-12-01"
  },
  {
    id: "2",
    type: "video",
    title: "3D Printing Workshop Setup",
    description: "Building out my home workshop with multiple 3D printers and tools.",
    link: "https://youtube.com/@danieldanger5539",
    date: "2024-11-15"
  },
  {
    id: "3",
    type: "short",
    title: "Quick Tip: Debugging React",
    description: "My favorite debugging techniques in 60 seconds.",
    link: "https://youtube.com/@danieldanger5539",
    date: "2024-11-05"
  }
]

function ContentCard({ content }: { content: SocialContent }) {
  const isVideo = content.type === "video" || content.type === "short"

  return (
    <motion.a
      href={content.link}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="group block"
    >
      <div className="overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all">
        {/* Thumbnail Area */}
        <div className="relative aspect-video bg-muted overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
            <Youtube className="w-16 h-16 text-red-500/60" />
          </div>

          {/* Play button overlay for videos */}
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="w-8 h-8 text-black ml-1" fill="currentColor" />
              </div>
            </div>
          )}

          {/* Type Badge */}
          <Badge className="absolute top-3 left-3 bg-red-500">
            {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
          </Badge>

          {/* Platform Icon */}
          <div className="absolute top-3 right-3">
            <Youtube className="w-5 h-5 text-white drop-shadow-lg" />
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {content.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {content.description}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {new Date(content.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric"
              })}
            </span>
            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </motion.a>
  )
}

export function Social() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-24 pb-20">
        <div className="container max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-pink-500 to-red-500 bg-clip-text text-transparent">
              Beyond the Code
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Follow my journey on YouTube
            </p>

            {/* Social Links */}
            <div className="flex items-center justify-center gap-4">
              <Button asChild size="lg" variant="destructive">
                <a href="https://youtube.com/@danieldanger5539" target="_blank" rel="noopener noreferrer">
                  <Youtube className="mr-2 h-5 w-5" />
                  Subscribe on YouTube
                </a>
              </Button>
            </div>
          </motion.div>

          {/* YouTube Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Youtube className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold">YouTube</h2>
              <Badge variant="secondary" className="ml-2">Videos & Shorts</Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {youtubeContent.map(content => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          </motion.section>

          {/* What You'll Find */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">What I Share</h2>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { icon: "🎮", title: "Game Dev", desc: "VR game development journey" },
                { icon: "🔧", title: "Workshop", desc: "3D printing & hardware projects" },
                { icon: "💻", title: "Code Tips", desc: "Development tricks & tutorials" },
                { icon: "🏠", title: "Life", desc: "Behind the scenes & family moments" },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center p-6 rounded-xl border border-border/50 bg-card/30"
                >
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="font-bold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex justify-center"
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
    </div>
  )
}
