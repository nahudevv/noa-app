import {
  IconAlertCircle,
  IconCircleCheckFilled,
  IconExclamationCircle,
  IconMapPin,
  IconReceipt,
  IconTruckDelivery,
  IconUser,
  IconX,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, formatDateTime } from "@/shared/lib/format"
import { getOrderStatus } from "@/orders/model"
import { PAYMENT_METHODS } from "@/orders/model"
import type { Order } from "@/orders/model"

type OrderDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
  onCancelOrder?: (order: Order) => void
  // Se pasa desde logística/admin, donde el pedido es de otra persona: activa
  // el renglón de cliente y apaga el aviso "te avisaremos" (pensado para el
  // propio cliente).
  clientName?: string
  // El listado no trae items: se piden al abrir el detalle.
  isLoadingItems?: boolean
  itemsError?: string | null
  onRetryItems?: () => void
}

export function OrderDetailDialog({
  open,
  onOpenChange,
  order,
  onCancelOrder,
  clientName,
  isLoadingItems = false,
  itemsError = null,
  onRetryItems,
}: OrderDetailDialogProps) {
  const status = getOrderStatus(order.status)
  const paymentLabel =
    PAYMENT_METHODS.find((m) => m.id === order.paymentMethod)?.label ??
    order.paymentMethod
  const shortId = order.id.slice(0, 8).toUpperCase()
  const itemCount = order.items.length
  const isDelivered = order.status === "entregado"
  const isCancelled = order.status === "cancelado"
  const canCancel =
    order.status === "en-analisis" && onCancelOrder !== undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <DialogTitle>Pedido #{shortId}</DialogTitle>
              <Badge variant={status.tone}>{status.label}</Badge>
              <Badge variant="outline">{paymentLabel}</Badge>
            </div>
            <DialogDescription>
              {formatDateTime(order.createdAt)}
            </DialogDescription>
          </div>
        </DialogHeader>

        <Separator />

        <div className="flex flex-col">
          {clientName ? (
            <div className="flex items-center gap-2 px-1 pb-2.5 text-sm text-muted-foreground">
              <IconUser className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate font-medium text-foreground">
                {clientName}
              </span>
            </div>
          ) : null}

          {order.deliveryAddress ? (
            <div className="flex items-center gap-2 px-1 pb-3 text-sm text-muted-foreground">
              <IconMapPin className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate" title={order.deliveryAddress}>
                {order.deliveryAddress}
              </span>
            </div>
          ) : null}

          <div className="flex items-center gap-2 px-1 pb-2.5 text-muted-foreground">
            <IconReceipt className="size-3.5" aria-hidden />
            <span className="text-xs font-semibold tracking-wider uppercase">
              {itemCount === 0
                ? "Productos"
                : `${itemCount} ${itemCount === 1 ? "producto" : "productos"}`}
            </span>
          </div>

          {itemCount > 0 ? (
            <ul className="flex max-h-60 animate-fade-up flex-col divide-y divide-border overflow-y-auto rounded-xl border border-border bg-muted/15">
              {order.items.map((item) => {
                const lineTotal = item.price * item.quantity
                return (
                  <li
                    key={item.productId}
                    className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 px-3.5 py-2.5 text-sm transition-colors hover:bg-muted/40"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium">{item.name}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {item.quantity}{" "}
                        {item.quantity === 1 ? "unidad" : "unidades"} ·{" "}
                        {formatCurrency(item.price)} {item.unit}
                      </span>
                    </div>
                    <span className="self-center text-right font-semibold tabular-nums">
                      {formatCurrency(lineTotal)}
                    </span>
                  </li>
                )
              })}
            </ul>
          ) : isLoadingItems ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              <Spinner className="size-4" />
              Cargando el detalle de productos...
            </div>
          ) : itemsError ? (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-muted/30 p-3.5 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <IconExclamationCircle
                  className="size-3.5 shrink-0"
                  aria-hidden
                />
                {itemsError}
              </span>
              {onRetryItems ? (
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={onRetryItems}
                >
                  Reintentar
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-muted/30 p-3.5 text-sm text-muted-foreground">
              El detalle de productos de este pedido no está disponible.
            </div>
          )}

          <div className="mt-3 flex items-center justify-between rounded-xl border border-border/80 bg-muted/30 px-3.5 py-2.5">
            <span className="text-sm font-medium text-muted-foreground">
              Total del pedido
            </span>
            <span className="text-lg font-bold tabular-nums">
              {formatCurrency(order.subtotal)}
            </span>
          </div>
        </div>

        {order.observations ? (
          <div className="flex flex-col gap-0.5 rounded-xl border border-border bg-muted/30 p-3 text-sm">
            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Observaciones
            </span>
            <span className="text-foreground">{order.observations}</span>
          </div>
        ) : null}

        {isDelivered ? (
          <>
            <Separator />
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <IconTruckDelivery className="size-3.5" aria-hidden />
                <span className="text-xs font-semibold tracking-wider uppercase">
                  Entrega
                </span>
              </div>
              {order.deliveredAt ? (
                <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3 text-sm">
                  <span className="text-muted-foreground">Fecha</span>
                  <span className="font-medium tabular-nums">
                    {formatDateTime(order.deliveredAt)}
                  </span>
                </div>
              ) : null}
              {order.deliveryObservations ? (
                <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                  <IconCircleCheckFilled
                    className="size-3.5 shrink-0 translate-y-0.5 text-emerald-500"
                    aria-hidden
                  />
                  <span className="text-foreground">
                    {order.deliveryObservations}
                  </span>
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        {isCancelled ? (
          <>
            <Separator />
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3.5 text-sm">
              <IconX
                className="size-3.5 shrink-0 translate-y-0.5 text-destructive"
                aria-hidden
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold tracking-wider text-destructive uppercase">
                  Motivo de cancelación
                </span>
                <span className="text-foreground">
                  {order.cancelReason ?? "Sin motivo especificado."}
                </span>
                {order.cancelObservations ? (
                  <span className="text-muted-foreground">
                    {order.cancelObservations}
                  </span>
                ) : null}
              </div>
            </div>
          </>
        ) : null}

        {!isDelivered && !isCancelled && !clientName ? (
          <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            <IconAlertCircle
              className="size-3.5 shrink-0 translate-y-0.5"
              aria-hidden
            />
            <span>
              Te avisaremos por email cuando haya novedades sobre este pedido.
            </span>
          </div>
        ) : null}

        <DialogFooter>
          {canCancel ? (
            <Button
              type="button"
              variant="destructive"
              onClick={() => onCancelOrder(order)}
            >
              Cancelar pedido
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
