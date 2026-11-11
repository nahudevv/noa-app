import { useState } from "react"
import {
  IconBuildingBank,
  IconCash,
  IconCheck,
  IconReceipt,
  IconShoppingCart,
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
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import type { CartItem } from "@/catalog/model"
import { PAYMENT_METHODS, type PaymentMethod } from "@/orders/model"
import { formatCurrency } from "@/shared/lib/format"

type ConfirmOrderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: CartItem[]
  paymentMethod: PaymentMethod
  subtotal: number
  onConfirm: () => Promise<void> | void
}

export function ConfirmOrderDialog({
  open,
  onOpenChange,
  items,
  paymentMethod,
  subtotal,
  onConfirm,
}: ConfirmOrderDialogProps) {
  const [submitting, setSubmitting] = useState(false)

  const paymentConfig = PAYMENT_METHODS.find((p) => p.id === paymentMethod) ?? {
    id: paymentMethod,
    label: paymentMethod,
    description: "",
  }

  const isCtaCte = paymentMethod === "cuenta-corriente"
  const totalUnits = items.reduce((acc, i) => acc + i.quantity, 0)

  const handleConfirm = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={submitting ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <IconShoppingCart className="size-5" aria-hidden />
            </div>
            <div>
              <DialogTitle>Confirmar y crear pedido</DialogTitle>
              <DialogDescription>
                Revisá los detalles de tu compra antes de enviar la orden.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Medio de pago seleccionado */}
        <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-card text-foreground shadow-2xs">
            {isCtaCte ? (
              <IconBuildingBank className="size-4.5 text-primary" aria-hidden />
            ) : (
              <IconCash
                className="size-4.5 text-emerald-600 dark:text-emerald-400"
                aria-hidden
              />
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Medio de pago
              </span>
              <Badge variant="outline" className="font-medium text-foreground">
                {paymentConfig.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {isCtaCte
                ? "Se imputará a tu saldo de cuenta corriente luego del análisis."
                : "Abonarás el total pactado contra entrega de la mercadería."}
            </p>
          </div>
        </div>

        {/* Desglose de productos */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium tracking-wider uppercase">
              <IconReceipt className="size-3.5" aria-hidden />
              Productos seleccionados ({items.length})
            </span>
            <span className="tabular-nums">
              {totalUnits}{" "}
              {totalUnits === 1 ? "unidad total" : "unidades totales"}
            </span>
          </div>

          <ul className="flex max-h-48 flex-col divide-y divide-border overflow-y-auto rounded-xl border border-border bg-card">
            {items.map((item) => {
              const lineTotal = item.price * item.quantity
              return (
                <li
                  key={item.productId}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 px-3.5 py-2.5 text-sm"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium text-foreground">
                      {item.name}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {item.quantity}{" "}
                      {item.quantity === 1 ? "unidad" : "unidades"} ·{" "}
                      {formatCurrency(item.price)} {item.unit}
                    </span>
                  </div>
                  <span className="text-right font-semibold text-foreground tabular-nums">
                    {formatCurrency(lineTotal)}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Resumen de Total */}
        <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase">
              Total a pagar
            </span>
            <p className="text-xs text-muted-foreground">
              Precios finales vigentes
            </p>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground tabular-nums">
            {formatCurrency(subtotal)}
          </span>
        </div>

        <Separator />

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            disabled={submitting}
            onClick={() => onOpenChange(false)}
          >
            Modificar pedido
          </Button>
          <Button
            type="button"
            disabled={submitting}
            onClick={() => void handleConfirm()}
            className="gap-1.5 shadow-sm"
          >
            {submitting ? (
              <>
                <Spinner data-icon="inline-start" />
                Creando pedido…
              </>
            ) : (
              <>
                <IconCheck className="size-4" data-icon="inline-start" />
                Confirmar y crear pedido
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
