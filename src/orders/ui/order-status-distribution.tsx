import {
  IconChartBar,
  IconCheck,
  IconClockSearch,
  IconPackage,
  IconTruckDelivery,
  IconX,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import type { Order, OrderStatusId } from "@/orders/model"
import { formatCurrency } from "@/shared/lib/format"

export type OrderStatusDistributionProps = {
  orders: Order[]
  selectedStatus: OrderStatusId | "all"
  onSelectStatus: (status: OrderStatusId | "all") => void
}

type StatusItemConfig = {
  readonly id: OrderStatusId
  readonly label: string
  readonly description: string
  readonly icon: typeof IconClockSearch
  readonly barClass: string
  readonly activeClass: string
  readonly textClass: string
  readonly badgeBg: string
}

const STATUS_ITEMS: ReadonlyArray<StatusItemConfig> = [
  {
    id: "en-analisis",
    label: "En Análisis",
    description: "Pendiente validación comercial",
    icon: IconClockSearch,
    barClass: "bg-amber-500",
    activeClass: "bg-amber-500/10 ring-2 ring-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  {
    id: "en-proceso",
    label: "En Proceso",
    description: "Armado y preparación logística",
    icon: IconPackage,
    barClass: "bg-blue-500",
    activeClass: "bg-blue-500/10 ring-2 ring-blue-500",
    textClass: "text-blue-600 dark:text-blue-400",
    badgeBg: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  },
  {
    id: "entregado",
    label: "Entregados",
    description: "Despacho finalizado con éxito",
    icon: IconTruckDelivery,
    barClass: "bg-emerald-500",
    activeClass: "bg-emerald-500/10 ring-2 ring-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "cancelado",
    label: "Cancelados",
    description: "Pedidos desestimados o fallidos",
    icon: IconX,
    barClass: "bg-destructive",
    activeClass: "bg-destructive/10 ring-2 ring-destructive",
    textClass: "text-destructive",
    badgeBg: "bg-destructive/15 text-destructive",
  },
]

/**
 * Interactive visual distribution chart for order statuses.
 * Shows relative percentages, absolute order counts, and monetary volume per status.
 * Clicking any status bar activates instant table filtering.
 */
export function OrderStatusDistribution({
  orders,
  selectedStatus,
  onSelectStatus,
}: OrderStatusDistributionProps) {
  const totalOrders = orders.length

  const getStats = (id: OrderStatusId) => {
    const list = orders.filter((o) => o.status === id)
    const count = list.length
    const amount = list.reduce((sum, o) => sum + o.subtotal, 0)
    const percent =
      totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0
    return { count, amount, percent }
  }

  const maxCount = Math.max(
    ...STATUS_ITEMS.map(
      (item) => orders.filter((o) => o.status === item.id).length
    ),
    1
  )

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-xs">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconChartBar className="size-4" aria-hidden />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              Desglose Operativo por Estado
            </h3>
            <p className="text-xs text-muted-foreground">
              Volumen y carga distribuida en cada etapa del sistema.
            </p>
          </div>
        </div>

        {selectedStatus !== "all" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSelectStatus("all")}
            className="h-7 gap-1 px-2.5 text-xs font-medium hover:bg-muted"
          >
            <IconX className="size-3" aria-hidden />
            <span>Ver todos</span>
          </Button>
        )}
      </div>

      {/* Status Bars List */}
      <div className="flex flex-col gap-2.5">
        {STATUS_ITEMS.map((item) => {
          const { count, amount, percent } = getStats(item.id)
          const barWidthPercent = Math.max(
            (count / maxCount) * 100,
            count > 0 ? 8 : 2
          )
          const isSelected = selectedStatus === item.id
          const Icon = item.icon

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectStatus(isSelected ? "all" : item.id)}
              className={`group flex w-full cursor-pointer flex-col gap-2 rounded-xl border border-transparent p-3 text-left transition-all hover:border-border hover:bg-muted/40 ${
                isSelected
                  ? item.activeClass
                  : "bg-background/40 hover:bg-muted/30"
              }`}
              aria-pressed={isSelected}
              aria-label={`Filtrar por ${item.label}: ${count} pedidos (${percent}%)`}
            >
              {/* Row Top: Icon, Label, Percentage and Amount */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div
                    className={`flex size-6 shrink-0 items-center justify-center rounded-md ${item.badgeBg}`}
                  >
                    <Icon className="size-3.5" aria-hidden />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-semibold text-foreground group-hover:text-primary">
                      {item.label}
                    </span>
                    <span className="truncate text-[11px] text-muted-foreground">
                      {item.description}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-foreground tabular-nums">
                      {formatCurrency(amount)}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
                      {count} {count === 1 ? "pedido" : "pedidos"} ({percent}%)
                    </span>
                  </div>
                  {isSelected && (
                    <div className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <IconCheck className="size-3" aria-hidden />
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/70">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${item.barClass}`}
                  style={{ width: `${barWidthPercent}%` }}
                />
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer Helper */}
      <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
        <span>
          Filtrando por:{" "}
          <strong className="text-foreground">
            {selectedStatus === "all"
              ? "Todos los estados"
              : STATUS_ITEMS.find((i) => i.id === selectedStatus)?.label}
          </strong>
        </span>
        <span className="text-[11px] italic">Clic para aislar pedidos</span>
      </div>
    </div>
  )
}
