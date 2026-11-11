import { IconChartPie, IconX } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import type { Order, PaymentMethod } from "@/orders/model"
import { formatCurrency } from "@/shared/lib/format"

export type OrderPieChartProps = {
  orders: Order[]
  selectedPayment: PaymentMethod | "all"
  onSelectPayment: (payment: PaymentMethod | "all") => void
}

/**
 * Clean SVG Donut / Pie chart displaying payment methods distribution
 * (Cuenta Corriente vs Contado).
 * Clicking any slice or legend item filters the table.
 */
export function OrderPieChart({
  orders,
  selectedPayment,
  onSelectPayment,
}: OrderPieChartProps) {
  const total = orders.length

  const checkingOrders = orders.filter(
    (o) => o.paymentMethod === "cuenta-corriente"
  )
  const cashOrders = orders.filter((o) => o.paymentMethod === "contado")

  const checkingCount = checkingOrders.length
  const cashCount = cashOrders.length

  const checkingTotal = checkingOrders.reduce((sum, o) => sum + o.subtotal, 0)
  const cashTotal = cashOrders.reduce((sum, o) => sum + o.subtotal, 0)
  const totalVolume = checkingTotal + cashTotal

  const checkingPercent =
    total > 0 ? Math.round((checkingCount / total) * 100) : 0
  const cashPercent = total > 0 ? 100 - checkingPercent : 0

  // SVG Donut calculation
  const radius = 42
  const circumference = 2 * Math.PI * radius // ~263.89
  const checkingStroke = (checkingPercent / 100) * circumference
  const cashStroke = circumference - checkingStroke

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <IconChartPie className="size-4" aria-hidden />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              Medios de Pago
            </h3>
            <p className="text-xs text-muted-foreground">
              Proporción de Cuenta Corriente vs Contado.
            </p>
          </div>
        </div>

        {selectedPayment !== "all" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSelectPayment("all")}
            className="h-7 gap-1 px-2 text-xs font-medium"
          >
            <IconX className="size-3" aria-hidden />
            <span>Ver todos</span>
          </Button>
        )}
      </div>

      {/* Donut and Legend Body */}
      <div className="my-auto flex flex-col items-center justify-around gap-6 py-2 sm:flex-row">
        {/* SVG Donut */}
        <div className="relative flex size-36 shrink-0 items-center justify-center">
          <svg
            className="size-full -rotate-90 transform"
            viewBox="0 0 120 120"
            aria-hidden
          >
            {/* Background circle if empty */}
            {total === 0 ? (
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="16"
                className="text-muted/40"
              />
            ) : (
              <>
                {/* Cuenta Corriente Segment (Blue) */}
                {checkingCount > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="16"
                    strokeDasharray={`${checkingStroke} ${circumference}`}
                    strokeDashoffset={0}
                    className={`cursor-pointer text-blue-500 transition-all duration-500 hover:opacity-85 ${
                      selectedPayment === "cuenta-corriente"
                        ? "stroke-[18]"
                        : ""
                    }`}
                    onClick={() =>
                      onSelectPayment(
                        selectedPayment === "cuenta-corriente"
                          ? "all"
                          : "cuenta-corriente"
                      )
                    }
                  />
                )}

                {/* Contado Segment (Emerald) */}
                {cashCount > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="16"
                    strokeDasharray={`${cashStroke} ${circumference}`}
                    strokeDashoffset={-checkingStroke}
                    className={`cursor-pointer text-emerald-500 transition-all duration-500 hover:opacity-85 ${
                      selectedPayment === "contado" ? "stroke-[18]" : ""
                    }`}
                    onClick={() =>
                      onSelectPayment(
                        selectedPayment === "contado" ? "all" : "contado"
                      )
                    }
                  />
                )}
              </>
            )}
          </svg>

          {/* Center Text */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold tracking-tight text-foreground tabular-nums">
              {total}
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">
              pedidos
            </span>
          </div>
        </div>

        {/* Legend Cards */}
        <div className="flex w-full flex-col gap-2.5 sm:max-w-xs">
          {/* Cuenta Corriente */}
          <button
            type="button"
            onClick={() =>
              onSelectPayment(
                selectedPayment === "cuenta-corriente"
                  ? "all"
                  : "cuenta-corriente"
              )
            }
            className={`flex w-full cursor-pointer items-center justify-between rounded-lg border p-2.5 text-left transition-all hover:bg-muted/40 ${
              selectedPayment === "cuenta-corriente"
                ? "border-blue-500/40 bg-blue-500/10 ring-1 ring-blue-500"
                : "border-border/60 bg-background/50"
            }`}
            aria-pressed={selectedPayment === "cuenta-corriente"}
          >
            <div className="flex items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full bg-blue-500" />
              <div>
                <div className="text-xs font-semibold text-foreground">
                  Cuenta Corriente
                </div>
                <div className="text-[10px] text-muted-foreground tabular-nums">
                  {formatCurrency(checkingTotal)}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-foreground tabular-nums">
                {checkingCount}
              </span>
              <span className="ml-1 text-[11px] text-muted-foreground">
                ({checkingPercent}%)
              </span>
            </div>
          </button>

          {/* Contado */}
          <button
            type="button"
            onClick={() =>
              onSelectPayment(selectedPayment === "contado" ? "all" : "contado")
            }
            className={`flex w-full cursor-pointer items-center justify-between rounded-lg border p-2.5 text-left transition-all hover:bg-muted/40 ${
              selectedPayment === "contado"
                ? "border-emerald-500/40 bg-emerald-500/10 ring-1 ring-emerald-500"
                : "border-border/60 bg-background/50"
            }`}
            aria-pressed={selectedPayment === "contado"}
          >
            <div className="flex items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full bg-emerald-500" />
              <div>
                <div className="text-xs font-semibold text-foreground">
                  Contado Inmediato
                </div>
                <div className="text-[10px] text-muted-foreground tabular-nums">
                  {formatCurrency(cashTotal)}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-foreground tabular-nums">
                {cashCount}
              </span>
              <span className="ml-1 text-[11px] text-muted-foreground">
                ({cashPercent}%)
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5 text-[11px] text-muted-foreground">
        <span>Volumen: {formatCurrency(totalVolume)}</span>
        <span className="italic">Haz clic para filtrar</span>
      </div>
    </div>
  )
}
