"use client"

import { classNames } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/** Build the page list with ellipses, e.g. [1,2,3,4,5,6,7,8,"…",99]. */
function pageItems(current: number, total: number): (number | "…")[] {
  if (total <= 9) return Array.from({ length: total }, (_, index) => index + 1)
  const items: (number | "…")[] = []
  const around = [current - 1, current, current + 1].filter(
    (pageNumber) => pageNumber > 1 && pageNumber < total,
  )
  items.push(1)
  if (around[0] && around[0] > 2) items.push("…")
  for (let pageNumber = 2; pageNumber <= 8; pageNumber++) {
    if (pageNumber < total) items.push(pageNumber)
  }
  if (total > 9) items.push("…")
  items.push(total)
  return items
}

interface PaginationProps {
  /** Active page (1-based). */
  current: number
  /** Total number of pages. */
  totalPages: number
  /** Fired with the next page when a control is clicked. */
  onPageChange: (page: number) => void
}

export function Pagination({
  current,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="inline-flex items-center divide-x divide-gray-300 overflow-hidden rounded-lg border border-gray-300 text-sm">
      <Button
        type="button"
        variant="ghost"
        disabled={current <= 1}
        onClick={() => onPageChange(current - 1)}
        className="h-auto rounded-none px-3 py-1.5 font-normal text-gray-600 hover:bg-gray-50 disabled:opacity-40"
      >
        Previous
      </Button>
      {pageItems(current, totalPages).map((item, index) =>
        item === "…" ? (
          <span key={`gap-${index}`} className="px-3 py-1.5 text-gray-400">
            …
          </span>
        ) : (
          <Button
            key={item}
            type="button"
            variant="ghost"
            onClick={() => onPageChange(item)}
            className={classNames(
              "h-auto min-w-[40px] rounded-none px-3 py-1.5 font-normal text-gray-600 hover:bg-gray-50",
              item === current &&
                "bg-primary-100 font-medium text-primary-700 hover:bg-primary-100",
            )}
          >
            {item}
          </Button>
        ),
      )}
      <Button
        type="button"
        variant="ghost"
        disabled={current >= totalPages}
        onClick={() => onPageChange(current + 1)}
        className="h-auto rounded-none px-3 py-1.5 font-normal text-gray-600 hover:bg-gray-50 disabled:opacity-40"
      >
        Next
      </Button>
    </div>
  )
}
