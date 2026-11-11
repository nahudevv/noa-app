import { IconChevronRight, IconMapPin, IconUser } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { clientLabel } from "@/logistics/client-label"
import { PAYMENT_METHODS, type Order } from "@/orders/model"
import { OrderStatusBadge } from "@/orders/ui/order-status-badge"
import { formatCurrency } from "@/shared/lib/format"

type DeliveryOrderCardProps = {
  order: Order
  onShowDetails: (order: Order) => void
  onRegisterDelivery: (order: Order) => void
  onCancel: (order: Order) => void
}

export function DeliveryOrderCard({
  order,
  onShowDetails,
  onRegisterDelivery,
  onCancel,
}: DeliveryOrderCardProps) {
  const shortId = order.id.slice(0, 8).toUpperCase()
  const paymentLabel =
    PAYMENT_METHODS.find((m) => m.id === order.paymentMethod)?.label ??
    order.paymentMethod
  const canManage = order.status === "en-proceso"

  return (
    <Card
      className="group/delivery cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/30 hover:shadow-md hover:ring-foreground/20"
      onClick={() => onShowDetails(order)}
    >
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-heading text-base font-semibold tracking-tight tabular-nums transition-colors group-hover/delivery:text-primary">
              Pedido #{shortId}
            </span>
            <OrderStatusBadge status={order.status} />
            <Badge variant="outline" className="font-normal">
              {paymentLabel}
            </Badge>
          </div>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <IconUser className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate font-medium text-foreground">
                {clientLabel(order)}
              </span>
            </span>
            <span className="flex items-center gap-2">
              <IconMapPin className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">
                {order.deliveryAddress ?? "Dirección no disponible"}
              </span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 sm:justify-end">
          <div className="flex flex-col sm:items-end">
            <span className="text-xs text-muted-foreground">Subtotal</span>
            <span className="text-lg font-semibold tabular-nums">
              {formatCurrency(order.subtotal)}
            </span>
          </div>
          {canManage ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onCancel(order)
                }}
                aria-label={`Cancelar pedido ${shortId}`}
                className="hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
              >
                Cancelar pedido
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onRegisterDelivery(order)
                }}
                aria-label={`Registrar entrega del pedido ${shortId}`}
              >
                Registrar entrega
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onShowDetails(order)
              }}
              aria-label={`Ver detalle del pedido ${shortId}`}
              className="text-muted-foreground group-hover/delivery:text-foreground"
            >
              Detalle
              <IconChevronRight
                data-icon="inline-end"
                className="transition-transform duration-150 group-hover/delivery:translate-x-0.5"
              />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
