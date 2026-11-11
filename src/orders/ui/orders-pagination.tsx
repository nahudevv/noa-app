import { Button } from "@/components/ui/button"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"

export type OrdersPaginationProps = {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

/**
 * Reusable pagination bar for orders tables.
 * Displays current item range, total items count, and navigation buttons.
 */
export function OrdersPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: OrdersPaginationProps) {
  if (totalItems === 0) {
    return null
  }

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
      <p className="text-xs text-muted-foreground">
        Mostrando{" "}
        <span className="font-semibold text-foreground">{startItem}</span> -{" "}
        <span className="font-semibold text-foreground">{endItem}</span> de{" "}
        <span className="font-semibold text-foreground">{totalItems}</span>{" "}
        pedidos
      </p>

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1 px-2.5 text-xs font-medium"
          disabled={!canGoPrevious}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Página anterior"
        >
          <IconChevronLeft className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        <div className="flex items-center px-2 text-xs font-medium text-muted-foreground">
          Página{" "}
          <span className="mx-1 font-semibold text-foreground">
            {currentPage}
          </span>{" "}
          de <span className="mx-1">{totalPages}</span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1 px-2.5 text-xs font-medium"
          disabled={!canGoNext}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Página siguiente"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <IconChevronRight className="size-3.5" aria-hidden />
        </Button>
      </div>
    </div>
  )
}
