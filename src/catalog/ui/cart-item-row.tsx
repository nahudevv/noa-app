import { IconTrash } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/shared/lib/format"
import { useCartStore } from "@/catalog/cart-store"
import type { CartItem } from "@/catalog/model"

type CartItemRowProps = {
  item: CartItem
}

export function CartItemRow({ item }: CartItemRowProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)

  const lineTotal = item.price * item.quantity

  return (
    <li className="flex animate-fade-up flex-col gap-2 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{item.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(item.price)} {item.unit}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => removeItem(item.productId)}
          aria-label={`Quitar ${item.name}`}
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <IconTrash />
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <QuantityStepper
          quantity={item.quantity}
          onDecrease={() => updateQuantity(item.productId, item.quantity - 1)}
          onIncrease={() => updateQuantity(item.productId, item.quantity + 1)}
        />
        <span className="text-sm font-semibold tabular-nums">
          {formatCurrency(lineTotal)}
        </span>
      </div>
    </li>
  )
}

type QuantityStepperProps = {
  quantity: number
  onDecrease: () => void
  onIncrease: () => void
}

function QuantityStepper({
  quantity,
  onDecrease,
  onIncrease,
}: QuantityStepperProps) {
  return (
    <div
      className="inline-flex items-center rounded-lg border border-border bg-card shadow-2xs"
      role="group"
      aria-label="Cantidad"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onDecrease}
        aria-label="Disminuir cantidad"
        className="rounded-r-none"
      >
        −
      </Button>
      <span
        key={quantity}
        className="min-w-6 animate-scale-in text-center text-xs font-semibold tabular-nums"
        aria-live="polite"
      >
        {quantity}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onIncrease}
        aria-label="Aumentar cantidad"
        className="rounded-l-none"
      >
        +
      </Button>
    </div>
  )
}
