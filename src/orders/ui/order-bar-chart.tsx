import { IconChartBar, IconX } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import type { Order, OrderStatusId } from "@/orders/model"
import { formatCurrency } from "@/shared/lib/format"

export type OrderBarChartProps = {
  orders: Order[]
  selectedStatus: OrderStatusId | "all"
  onSelectStatus: (status: OrderStatusId | "all") => void
}

type StatusBarConfig = {
  readonly id: OrderStatusId
  readonly label: string
  readonly barClass: string
  readonly activeClass: string
  readonly textClass: string
}

const STATUS_ITEMS: ReadonlyArray<StatusBarConfig> = [
  {
    id: "en-analisis",
    label: "En análisis",
    barClass: "bg-amber-500 hover:bg-amber-400",
    activeClass: "ring-2 ring-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "en-proceso",
    label: "En proceso",
    barClass: "bg-blue-500 hover:bg-blue-400",
    activeClass: "ring-2 ring-blue-500",
    textClass: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "entregado",
    label: "Entregados",
    barClass: "bg-emerald-500 hover:bg-emerald-400",
    activeClass: "ring-2 ring-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "cancelado",
    label: "Cancelados",
    barClass: "bg-destructive hover:opacity-90",
    activeClass: "ring-2 ring-destructive",
    textClass: "text-destructive",
  },
]

/**
 * Clean vertical bar chart showing order distribution across statuses.
 * Clicking any bar filters the table below.
 */
export function OrderBarChart({
  orders,
  selectedStatus,
  onSelectStatus,
}: OrderBarChartProps) {
  const total = orders.length

  const counts: Record<OrderStatusId, number> = {
    "en-analisis": orders.filter((o) => o.status === "en-analisis").length,
    "en-proceso": orders.filter((o) => o.status === "en-proceso").length,
    entregado: orders.filter((o) => o.status === "entregado").length,
    cancelado: orders.filter((o) => o.status === "cancelado").length,
  }

  const amounts: Record<OrderStatusId, number> = {
    "en-analisis": orders
      .filter((o) => o.status === "en-analisis")
      .reduce((sum, o) => sum + o.subtotal, 0),
    "en-proceso": orders
      .filter((o) => o.status === "en-proceso")
      .reduce((sum, o) => sum + o.subtotal, 0),
    entregado: orders
      .filter((o) => o.status === "entregado")
      .reduce((sum, o) => sum + o.subtotal, 0),
    cancelado: orders
      .filter((o) => o.status === "cancelado")
      .reduce((sum, o) => sum + o.subtotal, 0),
  }

  const maxCount = Math.max(...Object.values(counts), 1)

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconChartBar className="size-4" aria-hidden />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              Pedidos por Estado
            </h3>
            <p className="text-xs text-muted-foreground">
              Cantidad y porcentaje por etapa operativa.
            </p>
          </div>
        </div>

        {selectedStatus !== "all" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSelectStatus("all")}
            className="h-7 gap-1 px-2 text-xs font-medium"
          >
            <IconX className="size-3" aria-hidden />
            <span>Ver todos</span>
          </Button>
        )}
      </div>

      {/* Vertical Bars Container */}
      <div className="relative mt-2 flex h-48 w-full items-end justify-between gap-3 pt-6 pb-2">
        {/* Horizontal gridlines */}
        <div className="pointer-events-none absolute inset-x-0 top-6 border-b border-border/40" />
        <div className="pointer-events-none absolute inset-x-0 top-1/2 border-b border-border/30" />
        <div className="pointer-events-none absolute inset-x-0 bottom-2 border-b border-border/60" />

        {STATUS_ITEMS.map((item) => {
          const count = counts[item.id]
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0
          const barHeightPercent = Math.max(
            (count / maxCount) * 100,
            count > 0 ? 8 : 3
          )
          const isSelected = selectedStatus === item.id
          const hasOtherSelected =
            selectedStatus !== "all" && selectedStatus !== item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectStatus(isSelected ? "all" : item.id)}
              className={`group relative flex h-full flex-1 cursor-pointer flex-col items-center justify-end transition-all ${
                hasOtherSelected ? "opacity-45 hover:opacity-80" : ""
              }`}
              aria-pressed={isSelected}
              title={`Filtrar por ${item.label}: ${count} pedidos (${percentage}%)`}
            >
              {/* Value label above bar */}
              <div className="mb-1 flex flex-col items-center">
                <span className="text-xs font-bold text-foreground tabular-nums transition-transform group-hover:scale-105">
                  {count}
                </span>
              </div>

              {/* Bar */}
              <div className="relative flex w-full max-w-14 flex-1 items-end justify-center">
                <div
                  className={`w-full rounded-t-md transition-all duration-300 ${item.barClass} ${
                    isSelected ? `${item.activeClass} shadow-md` : ""
                  }`}
                  style={{ height: `${barHeightPercent}%` }}
                />
              </div>

              {/* Labels below */}
              <div className="mt-2 flex flex-col items-center text-center">
                <span className="text-xs font-medium whitespace-nowrap text-foreground">
                  {item.label}
                </span>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {percentage}% · {formatCurrency(amounts[item.id])}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer info */}
      <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5 text-[11px] text-muted-foreground">
        <span>Total: {total} pedidos</span>
        <span className="italic">Haz clic en una columna para filtrar</span>
      </div>
    </div>
  )
}
