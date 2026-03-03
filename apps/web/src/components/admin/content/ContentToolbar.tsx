import { Button } from "@/components/ui/button"

interface ContentToolbarProps {
  onInsert: (snippet: string) => void
}

const SNIPPETS: Array<{ label: string; value: string }> = [
  { label: "H2", value: "\n## Heading\n" },
  { label: "H3", value: "\n### Subheading\n" },
  { label: "Bold", value: "**bold text**" },
  { label: "Link", value: "[link text](https://example.com)" },
  { label: "Code", value: "\n```ts\n// code sample\n```\n" },
  { label: "List", value: "\n- Item one\n- Item two\n" },
]

export function ContentToolbar({ onInsert }: ContentToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-background p-2">
      {SNIPPETS.map((snippet) => (
        <Button key={snippet.label} type="button" size="sm" variant="outline" onClick={() => onInsert(snippet.value)}>
          {snippet.label}
        </Button>
      ))}
    </div>
  )
}
