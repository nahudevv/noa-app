import { IconChevronRight } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PAYMENT_METHODS, type Order } from "@/orders/model"
import { OrderStatusBadge } from "@/orders/ui/order-status-badge"
import { formatCurrency, formatDateTime } from "@/shared/lib/format"

type OrderCardProps = {
  order: Order
  onShowDetails: (order: Order) => void
  onCancel?: (order: Order) => void
}

export function OrderCard({ order, onShowDetails, onCancel }: OrderCardProps) {
  const shortId = order.id.slice(0, 8).toUpperCase()
  const paymentLabel =
    PAYMENT_METHODS.find((m) => m.id === order.paymentMethod)?.label ??
    order.paymentMethod
  const itemCount = order.items.length
  const canCancel = order.status === "en-analisis" && onCancel !== undefined

  return (
    <Card
      className="group/order cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/30 hover:shadow-md hover:ring-foreground/20"
      onClick={() => onShowDetails(order)}
    >
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-heading text-base font-semibold tracking-tight tabular-nums transition-colors group-hover/order:text-primary">
              Pedido #{shortId}
            </span>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="tabular-nums">
              {formatDateTime(order.createdAt)}
            </span>
            <Badge variant="outline" className="font-normal">
              {paymentLabel}
            </Badge>
            {itemCount > 0 ? (
              <span>
                {itemCount} {itemCount === 1 ? "producto" : "productos"}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 sm:justify-end">
          <div className="flex flex-col sm:items-end">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-lg font-semibold tabular-nums">
              {formatCurrency(order.subtotal)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {canCancel ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onCancel(order)
                }}
                aria-label={`Cancelar pedido ${shortId}`}
              >
                Cancelar pedido
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onShowDetails(order)
              }}
              aria-label={`Mostrar detalles del pedido ${shortId}`}
            >
              Mostrar detalles
              <IconChevronRight
                data-icon="inline-end"
                className="transition-transform duration-150 group-hover/order:translate-x-0.5"
              />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
