import { Search, Tag } from "lucide-react"
import type { ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { BlogCategory, BlogCategoryFilter } from "@/types/blog"

interface BlogFiltersProps {
  query: string
  category: BlogCategoryFilter
  tag: string
  pageSize: number
  categories: readonly BlogCategory[]
  tags: string[]
  pageSizes: readonly number[]
  onQueryChange: (value: string) => void
  onCategoryChange: (value: BlogCategoryFilter) => void
  onTagChange: (value: string) => void
  onPageSizeChange: (value: number) => void
}

export function BlogFilters({
  query,
  category,
  tag,
  pageSize,
  categories,
  tags,
  pageSizes,
  onQueryChange,
  onCategoryChange,
  onTagChange,
  onPageSizeChange,
}: BlogFiltersProps) {
  const allCategories: BlogCategoryFilter[] = ["All", ...categories]

  const handleTagChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    onTagChange(event.target.value)
  }

  const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    onPageSizeChange(Number(event.target.value))
  }

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onQueryChange(event.target.value)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={handleSearchChange}
          placeholder="Search posts, content, or tags"
          className="pl-10"
          aria-label="Search blog posts"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {allCategories.map((entry) => (
          <Button
            key={entry}
            variant={entry === category ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(entry)}
            className="gap-1"
          >
            <Tag className="h-3 w-3" />
            {entry}
          </Button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
          <span className="whitespace-nowrap text-muted-foreground">Tag</span>
          <select
            value={tag}
            onChange={handleTagChange}
            className="w-full bg-transparent text-foreground outline-none"
            aria-label="Filter by tag"
          >
            <option value="">All tags</option>
            {tags.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
          <span className="whitespace-nowrap text-muted-foreground">Page size</span>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="w-full bg-transparent text-foreground outline-none"
            aria-label="Posts per page"
          >
            {pageSizes.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
