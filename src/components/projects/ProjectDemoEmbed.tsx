import { useMemo, useState } from "react"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProjectDemoEmbedProps {
  link?: string
  title: string
}

function isEmbeddableExternalLink(value: string): boolean {
  return value.startsWith("https://") || value.startsWith("http://")
}

export function ProjectDemoEmbed({ link, title }: ProjectDemoEmbedProps) {
  const [embedState, setEmbedState] = useState<"loading" | "ready" | "error">("loading")

  const canEmbed = useMemo(() => {
    if (!link) return false
    if (!isEmbeddableExternalLink(link)) return false
    if (link.includes("github.com")) return false
    return true
  }, [link])

  if (!link) {
    return null
  }

  if (!canEmbed) {
    return (
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Live Demo</h2>
        <Button asChild>
          <a href={link} target={link.startsWith("/") ? "_self" : "_blank"} rel="noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Demo
          </a>
        </Button>
      </section>
    )
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Live Demo Embed</h2>
        <Button asChild variant="outline" size="sm">
          <a href={link} target="_blank" rel="noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in New Tab
          </a>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card/30">
        {embedState !== "ready" ? (
          <div className="flex h-12 items-center px-4 text-sm text-muted-foreground">
            {embedState === "loading" ? "Loading embedded demo..." : "Embed blocked by site headers. Use Open in New Tab."}
          </div>
        ) : null}

        <iframe
          src={link}
          title={`${title} live demo`}
          className="h-[480px] w-full"
          loading="lazy"
          onLoad={() => setEmbedState("ready")}
          onError={() => setEmbedState("error")}
        />
      </div>
    </section>
  )
}
