import {
  IconCheck,
  IconClockPlay,
  IconFilter,
  IconSearch,
  IconX,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { OrderStatusId, PaymentMethod } from "@/orders/model"

export type MonitoreoStatusFilter = OrderStatusId | "all" | "active"

export type OrdersFiltersBarProps = {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter?: MonitoreoStatusFilter
  onStatusChange?: (status: MonitoreoStatusFilter) => void
  paymentFilter: PaymentMethod | "all"
  onPaymentChange: (payment: PaymentMethod | "all") => void
  statusCounts?: Partial<Record<MonitoreoStatusFilter, number>>
  placeholder?: string
}

const PAYMENT_OPTIONS: ReadonlyArray<{
  readonly id: PaymentMethod | "all"
  readonly label: string
}> = [
  { id: "all", label: "Todos" },
  { id: "cuenta-corriente", label: "Cta. Cte." },
  { id: "contado", label: "Contado" },
]

const STATUS_OPTIONS: ReadonlyArray<{
  readonly id: MonitoreoStatusFilter
  readonly label: string
  readonly isAccent?: boolean
}> = [
  { id: "all", label: "Todos" },
  { id: "active", label: "En Cola / Activos", isAccent: true },
  { id: "en-analisis", label: "En análisis" },
  { id: "en-proceso", label: "En proceso" },
  { id: "entregado", label: "Entregados" },
  { id: "cancelado", label: "Cancelados" },
]

/**
 * Filter bar component for searching and categorizing orders.
 * Includes instant search, multi-status tab triggers with counters,
 * payment method toggles, and one-click reset.
 */
export function OrdersFiltersBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  paymentFilter,
  onPaymentChange,
  statusCounts,
  placeholder = "Buscar por ID, cliente o dirección...",
}: OrdersFiltersBarProps) {
  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    paymentFilter !== "all" ||
    (statusFilter !== undefined && statusFilter !== "all")

  const handleClearAll = () => {
    onSearchChange("")
    onPaymentChange("all")
    if (onStatusChange) {
      onStatusChange("all")
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search input with icons */}
        <div className="relative flex-1 sm:max-w-md">
          <IconSearch
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="h-9 pr-8 pl-9 text-xs"
          />
          {searchTerm.length > 0 && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Borrar búsqueda"
            >
              <IconX className="size-3.5" aria-hidden />
            </button>
          )}
        </div>

        {/* Payment Method Selector & Reset */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          <span className="mr-1 text-xs font-medium text-muted-foreground">
            Pago:
          </span>
          {PAYMENT_OPTIONS.map((opt) => (
            <Button
              key={opt.id}
              type="button"
              variant={paymentFilter === opt.id ? "default" : "outline"}
              size="sm"
              className={`h-7 px-2.5 text-xs ${
                paymentFilter === opt.id
                  ? "font-semibold shadow-xs"
                  : "text-muted-foreground"
              }`}
              onClick={() => onPaymentChange(opt.id)}
            >
              {opt.label}
            </Button>
          ))}

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-7 gap-1 px-2 text-xs font-medium text-muted-foreground hover:text-destructive"
            >
              <IconX className="size-3" aria-hidden />
              <span>Limpiar filtros</span>
            </Button>
          )}
        </div>
      </div>

      {/* Status Pill Buttons */}
      {statusFilter !== undefined && onStatusChange && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
          <div className="mr-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <IconFilter className="size-3.5" aria-hidden />
            <span>Filtro de Estado:</span>
          </div>

          {STATUS_OPTIONS.map((s) => {
            const count = statusCounts?.[s.id]
            const isSelected = statusFilter === s.id

            return (
              <Button
                key={s.id}
                type="button"
                variant={isSelected ? "secondary" : "ghost"}
                size="sm"
                className={`h-7 gap-1.5 px-2.5 text-xs transition-colors ${
                  isSelected
                    ? "font-semibold shadow-xs ring-1 ring-border"
                    : s.isAccent
                      ? "font-medium text-amber-600 hover:bg-amber-500/10 dark:text-amber-400"
                      : "text-muted-foreground"
                }`}
                onClick={() => onStatusChange(s.id)}
              >
                {s.isAccent && !isSelected && (
                  <IconClockPlay className="size-3" aria-hidden />
                )}
                {isSelected && (
                  <IconCheck className="size-3 text-primary" aria-hidden />
                )}
                <span>{s.label}</span>
                {count !== undefined && (
                  <span
                    className={`py-0.2 rounded-full px-1.5 text-[10px] tabular-nums ${
                      isSelected
                        ? "bg-foreground/10 font-bold text-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </Button>
            )
          })}
        </div>
      )}
    </div>
  )
}
