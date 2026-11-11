import { useEffect, useMemo, useRef, useState } from "react"
import { IconBox, IconInbox } from "@tabler/icons-react"

import { ClientShell } from "@/layout/client-shell"
import { ProductCard } from "@/catalog/ui/product-card"
import { CategoryFilter } from "@/catalog/ui/category-filter"
import { SearchInput } from "@/catalog/ui/search-input"
import { CartSummary } from "@/catalog/ui/cart-summary"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { useProductsStore, selectByCategory } from "@/catalog/products-store"
import type { CategoryId } from "@/catalog/model"

export function CatalogPage() {
  useEffect(() => {
    document.title = "Catálogo · Distribuidora NOA"
  }, [])

  const products = useProductsStore((s) => s.products)
  const loading = useProductsStore((s) => s.loading)
  const error = useProductsStore((s) => s.error)
  const load = useProductsStore((s) => s.load)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current) return
    if (products.length === 0 && !loading) {
      loadedRef.current = true
      load()
    }
  }, [products.length, loading, load])

  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<CategoryId | "all">("all")

  const filtered = useMemo(() => {
    const byCategory = selectByCategory(products, category)
    const normalized = query.trim().toLowerCase()
    if (!normalized) return byCategory
    return byCategory.filter((p) => p.name.toLowerCase().includes(normalized))
  }, [products, category, query])

  return (
    <ClientShell>
      <div className="flex min-h-0 flex-1">
        <div className="mx-auto flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
          <header className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconBox className="size-4 text-primary" aria-hidden />
              <span className="text-xs font-medium tracking-wider uppercase">
                Catálogo
              </span>
            </div>
            <h1 className="font-heading text-[1.65rem] font-semibold tracking-tight">
              Productos disponibles
            </h1>
            <p className="text-sm text-muted-foreground">
              Explorá el catálogo y agregá productos a tu pedido.
            </p>
          </header>

          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3.5 shadow-2xs sm:flex-row sm:items-center">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Buscar producto…"
              ariaLabel="Buscar productos"
              className="sm:max-w-sm"
            />
            <CategoryFilter value={category} onChange={setCategory} />
          </div>

          {loading ? (
            <div className="flex flex-1 items-center justify-center py-20">
              <Spinner className="size-6 text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-1 animate-fade-up items-center justify-center py-20">
              <Empty className="max-w-md">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <IconInbox />
                  </EmptyMedia>
                  <EmptyTitle>Error al cargar</EmptyTitle>
                  <EmptyDescription>{error}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-1 animate-fade-up items-center justify-center py-20">
              <Empty className="max-w-md">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <IconBox />
                  </EmptyMedia>
                  <EmptyTitle>Sin resultados</EmptyTitle>
                  <EmptyDescription>
                    {products.length === 0
                      ? "No hay productos disponibles por el momento."
                      : "No se encontraron productos con esos filtros."}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product, index) => (
                <div
                  key={product.id}
                  className="h-full animate-fade-up"
                  style={{
                    animationDelay: `${Math.min(index * 25, 220)}ms`,
                  }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
        <CartSummary />
      </div>
    </ClientShell>
  )
}
