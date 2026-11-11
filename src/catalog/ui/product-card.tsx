import { IconMinus, IconPlus } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCategory } from "@/catalog/categories"
import { formatCurrency } from "@/shared/lib/format"
import { useCartStore } from "@/catalog/cart-store"
import type { Product } from "@/catalog/model"
import { cn } from "@/shared/lib/utils"

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const item = useCartStore((s) =>
    s.items.find((i) => i.productId === product.id)
  )
  const addItem = useCartStore((s) => s.addItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)

  const category = getCategory(product.category)
  const Icon = category.icon
  const inCart = Boolean(item)
  const quantity = item?.quantity ?? 0

  return (
    <Card
      className={cn(
        "group/product flex h-full flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        inCart
          ? "ring-primary/40 dark:ring-primary/50"
          : "hover:ring-foreground/20"
      )}
    >
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div
            className={cn(
              "flex size-9 items-center justify-center rounded-lg transition-all duration-200 group-hover/product:scale-105",
              inCart
                ? "bg-primary/12 text-primary"
                : "bg-muted text-muted-foreground group-hover/product:bg-primary/10 group-hover/product:text-primary"
            )}
            aria-hidden
          >
            <Icon className="size-5" />
          </div>
          <Badge variant="outline" className="font-normal">
            {product.unit}
          </Badge>
        </div>
        <div className="flex-1">
          <p className="text-sm leading-snug font-medium transition-colors group-hover/product:text-foreground">
            {product.name}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{category.label}</p>
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-base font-semibold tabular-nums">
            {formatCurrency(product.price)}
          </span>
          {inCart ? (
            <QuantityStepper
              quantity={quantity}
              onDecrease={() => updateQuantity(product.id, quantity - 1)}
              onIncrease={() => updateQuantity(product.id, quantity + 1)}
              className="animate-scale-in"
            />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => addItem(product)}
              aria-label={`Agregar ${product.name}`}
              className="hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
            >
              <IconPlus data-icon="inline-start" />
              Agregar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

type QuantityStepperProps = {
  quantity: number
  onDecrease: () => void
  onIncrease: () => void
  className?: string
}

function QuantityStepper({
  quantity,
  onDecrease,
  onIncrease,
  className,
}: QuantityStepperProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-primary/30 bg-primary/5 shadow-2xs",
        className
      )}
      role="group"
      aria-label="Cantidad"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onDecrease}
        aria-label="Disminuir cantidad"
        className="rounded-r-none text-primary hover:bg-primary/15 hover:text-primary"
      >
        <IconMinus />
      </Button>
      <span
        key={quantity}
        className="min-w-6 animate-scale-in text-center text-sm font-semibold text-primary tabular-nums"
        aria-live="polite"
      >
        {quantity}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onIncrease}
        aria-label="Aumentar cantidad"
        className="rounded-l-none text-primary hover:bg-primary/15 hover:text-primary"
      >
        <IconPlus />
      </Button>
    </div>
  )
}
