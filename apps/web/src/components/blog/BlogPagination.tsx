import { Button } from "@/components/ui/button"
import type { BlogPagination as BlogPaginationState } from "@/types/blog"

interface BlogPaginationProps {
  pagination: BlogPaginationState
  onPageChange: (page: number) => void
}

function getVisiblePages(totalPages: number, currentPage: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5]
  }

  if (currentPage >= totalPages - 2) {
    return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }

  return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2]
}

export function BlogPagination({ pagination, onPageChange }: BlogPaginationProps) {
  if (pagination.totalItems === 0) {
    return null
  }

  const pages = getVisiblePages(pagination.totalPages, pagination.page)

  return (
    <div className="mt-10 flex flex-col items-center gap-4">
      <p className="text-sm text-muted-foreground">
        Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} posts)
      </p>

      {pagination.totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPreviousPage}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            Previous
          </Button>

          {pages.map((page) => (
            <Button
              key={page}
              variant={page === pagination.page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNextPage}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  )
}
