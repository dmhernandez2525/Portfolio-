import type { TocHeading } from "@/types/blog"

interface BlogTableOfContentsProps {
  headings: TocHeading[]
}

export function BlogTableOfContents({ headings }: BlogTableOfContentsProps) {
  if (!headings.length) {
    return null
  }

  return (
    <aside className="rounded-lg border border-border/60 bg-card/40 p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Table of contents</h2>
      <ul className="space-y-1 text-sm">
        {headings.map((heading) => (
          <li key={heading.id} style={{ paddingLeft: `${(heading.level - 1) * 8}px` }}>
            <a href={`#${heading.id}`} className="text-muted-foreground transition-colors hover:text-primary">
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}
