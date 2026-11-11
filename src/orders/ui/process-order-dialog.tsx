import { useEffect, useState } from "react"
import {
  IconAlertTriangle,
  IconCheck,
  IconMapPin,
  IconReceipt,
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
import { Field, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { fetchOrder } from "@/orders/api"
import {
  ORDER_CANCEL_REASONS,
  PAYMENT_METHODS,
  type Order,
} from "@/orders/model"
import { OrderStatusBadge } from "@/orders/ui/order-status-badge"
import { formatCurrency, formatDateTime } from "@/shared/lib/format"

export type ProcessOrderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
  onApprove: () => Promise<void> | void
  onCancel: (reason: string, observations?: string) => Promise<void> | void
}

type DialogMode = "default" | "cancel"

/**
 * Modal dialog for reviewing, approving or cancelling a pending order.
 * Displays order items, delivery details, and structured cancellation reasons.
 */
export function ProcessOrderDialog({
  open,
  onOpenChange,
  order,
  onApprove,
  onCancel,
}: ProcessOrderDialogProps) {
  const [mode, setMode] = useState<DialogMode>("default")
  const [selectedReasonId, setSelectedReasonId] = useState<string>("")
  const [reason, setReason] = useState("")
  const [observations, setObservations] = useState("")
  const [fetchedOrder, setFetchedOrder] = useState<Order | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const details = fetchedOrder?.id === order.id ? fetchedOrder : order
  const loadingDetails =
    open && Boolean(order?.id) && fetchedOrder?.id !== order.id && !loadFailed

  useEffect(() => {
    if (!open || !order?.id) return
    let active = true
    void fetchOrder(order.id)
      .then((fullOrder) => {
        if (active) {
          setFetchedOrder(fullOrder)
          setLoadFailed(false)
        }
      })
      .catch((err: unknown) => {
        if (active) setLoadFailed(true)
        console.warn("Error loading order items:", err)
      })

    return () => {
      active = false
    }
  }, [open, order.id])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setMode("default")
      setSelectedReasonId("")
      setReason("")
      setObservations("")
      setFetchedOrder(null)
      setLoadFailed(false)
    }
    onOpenChange(nextOpen)
  }

  const paymentLabel =
    PAYMENT_METHODS.find((m) => m.id === details.paymentMethod)?.label ??
    details.paymentMethod
  const shortId = details.id.slice(0, 8).toUpperCase()
  const trimmedReason = reason.trim()
  const trimmedObservations = observations.trim()
  const canConfirmCancel = trimmedReason.length > 0

  const handleSelectPresetReason = (presetId: string, presetLabel: string) => {
    setSelectedReasonId(presetId)
    if (presetId === "other") {
      setReason("")
    } else {
      setReason(presetLabel)
    }
  }

  const handleApproveClick = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      await onApprove()
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelClick = async () => {
    if (submitting || !canConfirmCancel) return
    setSubmitting(true)
    try {
      await onCancel(trimmedReason, trimmedObservations)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={submitting ? undefined : handleOpenChange}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <DialogTitle>Procesar pedido #{shortId}</DialogTitle>
              <OrderStatusBadge status={details.status} />
            </div>
            <DialogDescription>
              <span className="font-medium text-foreground">
                {details.userName}
              </span>
              {" · "}
              {formatDateTime(details.createdAt)}
            </DialogDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <Badge variant="outline">{paymentLabel}</Badge>
            {details.deliveryAddress && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <IconMapPin className="size-3.5 shrink-0" aria-hidden />
                <span className="max-w-[300px] truncate">
                  {details.deliveryAddress}
                </span>
              </span>
            )}
          </div>
        </DialogHeader>

        <Separator />

        {/* ORDER ITEMS LIST */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-1 pb-2 text-muted-foreground">
            <div className="flex items-center gap-2">
              <IconReceipt className="size-3.5" aria-hidden />
              <span className="text-xs font-semibold tracking-wider uppercase">
                {details.items.length}{" "}
                {details.items.length === 1 ? "producto" : "productos"}
              </span>
            </div>
            {loadingDetails && (
              <div className="flex items-center gap-1.5 text-xs">
                <Spinner className="size-3.5 text-muted-foreground" />
                <span>Cargando detalle…</span>
              </div>
            )}
          </div>

          {loadingDetails && details.items.length === 0 ? (
            <div className="flex items-center justify-center rounded-xl border border-border bg-muted/20 py-8">
              <Spinner className="size-5 text-muted-foreground" />
            </div>
          ) : details.items.length === 0 ? (
            <div className="rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">
              Sin productos detallados para este pedido.
            </div>
          ) : (
            <ul className="flex max-h-56 flex-col divide-y divide-border overflow-y-auto rounded-xl border border-border bg-muted/15">
              {details.items.map((item) => {
                const lineTotal = item.price * item.quantity
                return (
                  <li
                    key={item.productId || item.name}
                    className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 px-3.5 py-2.5 text-sm transition-colors hover:bg-muted/40"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium">{item.name}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {item.quantity}{" "}
                        {item.quantity === 1 ? "unidad" : "unidades"} ·{" "}
                        {formatCurrency(item.price)} / {item.unit}
                      </span>
                    </div>
                    <span className="self-center text-right font-semibold tabular-nums">
                      {formatCurrency(lineTotal)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}

          {/* TOTAL BREAKDOWN */}
          <div className="mt-3 flex items-center justify-between rounded-xl border border-border/80 bg-muted/30 px-3.5 py-2.5">
            <span className="text-sm font-medium text-muted-foreground">
              Total del pedido
            </span>
            <span className="text-lg font-bold text-foreground tabular-nums">
              {formatCurrency(details.subtotal)}
            </span>
          </div>

          {/* OBSERVATIONS NOTICE IF CLIENT LEFT ANY */}
          {details.observations && (
            <div className="mt-2.5 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              <strong className="text-foreground">Nota del cliente:</strong>{" "}
              {details.observations}
            </div>
          )}
        </div>

        {/* CANCELLATION FORM MODE */}
        {mode === "cancel" && (
          <div className="flex animate-scale-in flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
              <IconAlertTriangle className="size-4" aria-hidden />
              <span>Cancelar Pedido</span>
            </div>

            {/* Preset cancellation reason chips */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">
                Seleccioná un motivo:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ORDER_CANCEL_REASONS.map((preset) => {
                  const isChosen = selectedReasonId === preset.id
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        handleSelectPresetReason(preset.id, preset.label)
                      }
                      className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs transition-all duration-150 active:scale-95 ${
                        isChosen
                          ? "border-destructive bg-destructive font-medium text-white shadow-2xs"
                          : "border-border bg-card text-muted-foreground hover:border-destructive/40 hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {preset.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Custom reason textarea */}
            <Field>
              <FieldLabel htmlFor="cancel-reason" className="text-xs">
                Motivo que se registrará:{" "}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <Textarea
                id="cancel-reason"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value)
                  if (
                    !ORDER_CANCEL_REASONS.some(
                      (r) => r.label === e.target.value
                    )
                  ) {
                    setSelectedReasonId("other")
                  }
                }}
                placeholder="Describí el motivo de cancelación..."
                rows={2}
                disabled={submitting}
                className="bg-background/80 text-xs"
              />
            </Field>

            {/* Optional Observations */}
            <Field>
              <FieldLabel htmlFor="cancel-observations" className="text-xs">
                Observaciones internas (opcional)
              </FieldLabel>
              <Textarea
                id="cancel-observations"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Detalles adicionales para registro administrativo..."
                rows={2}
                disabled={submitting}
                className="bg-background/80 text-xs"
              />
            </Field>
          </div>
        )}

        <DialogFooter>
          {mode === "default" ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={() => setMode("cancel")}
                className="text-destructive hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
              >
                <IconX className="size-4" data-icon="inline-start" />
                Cancelar pedido
              </Button>
              <Button
                type="button"
                disabled={submitting || loadingDetails}
                onClick={() => void handleApproveClick()}
              >
                {submitting ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Aprobando…
                  </>
                ) : (
                  <>
                    <IconCheck className="size-4" data-icon="inline-start" />
                    Aprobar pedido
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                disabled={submitting}
                onClick={() => {
                  setMode("default")
                  setSelectedReasonId("")
                  setReason("")
                  setObservations("")
                }}
              >
                Volver
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={!canConfirmCancel || submitting}
                onClick={() => void handleCancelClick()}
              >
                {submitting ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Cancelando…
                  </>
                ) : (
                  "Confirmar cancelación"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
