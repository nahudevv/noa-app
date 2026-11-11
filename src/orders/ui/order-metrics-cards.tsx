import {
  IconBuildingBank,
  IconCash,
  IconClockSearch,
  IconReceipt,
} from "@tabler/icons-react"

import type { Order } from "@/orders/model"
import { formatCurrency } from "@/shared/lib/format"

export type OrderMetricsCardsProps = {
  orders: Order[]
}

/**
 * Metric KPI cards for operational overview.
 * Calculates totals, payment breakdowns, and active queue counts.
 */
export function OrderMetricsCards({ orders }: OrderMetricsCardsProps) {
  const totalCount = orders.length

  const pendingAnalysis = orders.filter((o) => o.status === "en-analisis")
  const inProcess = orders.filter((o) => o.status === "en-proceso")
  const delivered = orders.filter((o) => o.status === "entregado")

  const checkingAccountOrders = orders.filter(
    (o) => o.paymentMethod === "cuenta-corriente"
  )
  const cashOrders = orders.filter((o) => o.paymentMethod === "contado")

  const checkingAccountTotal = checkingAccountOrders.reduce(
    (sum, o) => sum + o.subtotal,
    0
  )
  const cashTotal = cashOrders.reduce((sum, o) => sum + o.subtotal, 0)

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Orders Card */}
      <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold tracking-wider uppercase">
            Pedidos Totales
          </span>
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconReceipt className="size-4" aria-hidden />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {totalCount}
          </span>
          <span className="text-xs text-muted-foreground">
            {delivered.length} completados
          </span>
        </div>
      </div>

      {/* Active Queue Card */}
      <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold tracking-wider uppercase">
            Cola de Trabajo
          </span>
          <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <IconClockSearch className="size-4" aria-hidden />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
            {pendingAnalysis.length + inProcess.length}
          </span>
          <span className="text-xs text-muted-foreground">
            {pendingAnalysis.length} en análisis · {inProcess.length} en proceso
          </span>
        </div>
      </div>

      {/* Checking Account Card */}
      <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold tracking-wider uppercase">
            Cuenta Corriente
          </span>
          <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <IconBuildingBank className="size-4" aria-hidden />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {checkingAccountOrders.length}
          </span>
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            {formatCurrency(checkingAccountTotal)}
          </span>
        </div>
      </div>

      {/* Cash / Contado Card */}
      <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold tracking-wider uppercase">
            Contado
          </span>
          <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <IconCash className="size-4" aria-hidden />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {cashOrders.length}
          </span>
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            {formatCurrency(cashTotal)}
          </span>
        </div>
      </div>
    </div>
  )
}
