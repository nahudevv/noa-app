import { useId, useMemo, useState } from "react"
import { IconShoppingCart, IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"

import { CartItemRow } from "@/catalog/ui/cart-item-row"
import { ConfirmOrderDialog } from "@/catalog/ui/confirm-order-dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { checkAccount } from "@/clients/api"
import type { Account, AccountBlockReason } from "@/clients/model"
import { OrderBlockedDialog } from "@/clients/ui/order-blocked-dialog"
import { useAuthStore } from "@/auth/session-store"
import { useOrdersStore } from "@/orders/store"
import { PAYMENT_METHODS, type PaymentMethod } from "@/orders/model"
import { usePreservedValue } from "@/shared/lib/use-preserved-value"
import { cn } from "@/shared/lib/utils"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { selectCartSubtotal, useCartStore } from "@/catalog/cart-store"
import { formatCurrency } from "@/shared/lib/format"

type CartBodyProps = {
  onClose?: () => void
}

export function CartBody({ onClose }: CartBodyProps) {
  const items = useCartStore((s) => s.items)
  const clear = useCartStore((s) => s.clear)
  const user = useAuthStore((s) => s.user)
  const createOrder = useOrdersStore((s) => s.createOrder)
  const subtotal = useMemo(() => selectCartSubtotal(items), [items])

  const idPrefix = useId()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("contado")
  const [isChecking, setIsChecking] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [blocked, setBlocked] = useState<{
    reason: AccountBlockReason
    shortfall: number
    account: Account
    totalAmount: number
  } | null>(null)
  const displayedBlocked = usePreservedValue(blocked)

  const totalQuantity = items.reduce((acc, i) => acc + i.quantity, 0)

  const handleClear = () => {
    if (items.length === 0) return
    clear()
    toast.info("Pedido vaciado")
  }

  const handlePreConfirm = async () => {
    if (items.length === 0 || isChecking) return

    setIsChecking(true)
    try {
      if (paymentMethod === "cuenta-corriente") {
        const { result, account, totalAmount } = await checkAccount(items)
        if (!result.ok) {
          setBlocked({
            reason: result.reason,
            shortfall: result.shortfall,
            account,
            totalAmount,
          })
          return
        }
      }

      if (!user) {
        throw new Error("Iniciá sesión para continuar.")
      }

      // Si todo está correcto, abrimos el modal de confirmación
      setConfirmOpen(true)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al verificar tu cuenta."
      )
    } finally {
      setIsChecking(false)
    }
  }

  const handleFinalConfirm = async () => {
    if (!user) {
      throw new Error("Iniciá sesión para confirmar el pedido.")
    }

    try {
      await createOrder({ items, paymentMethod })
      toast.success("Pedido creado con éxito", {
        description: `Tu pedido por ${formatCurrency(subtotal)} ya ingresó a revisión.`,
      })
      clear()
      setConfirmOpen(false)
      onClose?.()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos completar la creación del pedido."
      )
      throw error
    }
  }

  return (
    <>
      <header className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconShoppingCart className="size-4" aria-hidden />
          </div>
          <h2 className="text-sm font-semibold">Tu pedido</h2>
          {totalQuantity > 0 ? (
            <span
              key={totalQuantity}
              className="animate-scale-in rounded-full bg-primary/12 px-2 py-0.5 text-xs font-medium text-primary tabular-nums"
            >
              {totalQuantity}
            </span>
          ) : null}
        </div>
        {items.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleClear}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <IconTrash data-icon="inline-start" />
            Vaciar
          </Button>
        ) : null}
      </header>

      {items.length === 0 ? (
        <div className="flex flex-1 animate-fade-up items-center justify-center p-5">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconShoppingCart />
              </EmptyMedia>
              <EmptyTitle>Tu pedido está vacío</EmptyTitle>
              <EmptyDescription>
                Sumá productos del catálogo para empezar a armar tu pedido.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <ul className="flex min-h-0 flex-1 flex-col divide-y divide-border overflow-y-auto px-5">
          {items.map((item) => (
            <CartItemRow key={item.productId} item={item} />
          ))}
        </ul>
      )}

      <Separator />
      <footer className="flex shrink-0 flex-col gap-3 bg-muted/15 px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="text-lg font-bold tabular-nums">
            {formatCurrency(subtotal)}
          </span>
        </div>
        <RadioGroup
          value={paymentMethod}
          onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
          aria-label="Forma de pago"
          className="gap-2"
        >
          {PAYMENT_METHODS.map((method) => {
            const id = `${idPrefix}-${method.id}`
            return (
              <label
                key={method.id}
                htmlFor={id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 transition-all duration-150",
                  paymentMethod === method.id
                    ? "border-primary bg-primary/8 shadow-2xs"
                    : "bg-card hover:bg-muted/50"
                )}
              >
                <RadioGroupItem id={id} value={method.id} />
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-sm font-medium">{method.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {method.description}
                  </span>
                </div>
              </label>
            )
          })}
        </RadioGroup>
        <Button
          type="button"
          size="lg"
          disabled={items.length === 0 || isChecking}
          onClick={() => void handlePreConfirm()}
          className="w-full font-semibold shadow-xs"
        >
          {isChecking ? "Verificando cuenta…" : "Crear pedido"}
        </Button>
      </footer>

      {/* Modal de confirmación final */}
      <ConfirmOrderDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        items={items}
        paymentMethod={paymentMethod}
        subtotal={subtotal}
        onConfirm={handleFinalConfirm}
      />

      {displayedBlocked ? (
        <OrderBlockedDialog
          open={Boolean(blocked)}
          onOpenChange={(open) => {
            if (!open) setBlocked(null)
          }}
          reason={displayedBlocked.reason}
          account={displayedBlocked.account}
          subtotal={displayedBlocked.totalAmount}
          shortfall={displayedBlocked.shortfall}
        />
      ) : null}
    </>
  )
}
