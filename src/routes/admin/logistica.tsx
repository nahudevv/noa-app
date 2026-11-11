import { useCallback, useEffect, useMemo, useState } from "react"
import {
  IconEye,
  IconInbox,
  IconMapPin,
  IconTruckDelivery,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { SearchInput } from "@/catalog/ui/search-input"
import { clientLabel } from "@/logistics/client-label"
import {
  DELIVERY_CANCEL_REASONS,
  getDeliveryCancelReason,
  type DeliveryCancelReason,
} from "@/logistics/model"
import type {
  ContadoCollectionMethod,
  Order,
  PaymentMethod,
} from "@/orders/model"
import { PAYMENT_METHODS } from "@/orders/model"
import { selectOrdersForStatus, useOrdersStore } from "@/orders/store"
import { CancelDeliveryDialog } from "@/orders/ui/cancel-delivery-dialog"
import { OrderDetailDialog } from "@/orders/ui/order-detail-dialog"
import { OrdersPagination } from "@/orders/ui/orders-pagination"
import { OrderStatusBadge } from "@/orders/ui/order-status-badge"
import { RegisterDeliveryDialog } from "@/orders/ui/register-delivery-dialog"
import { formatCurrency, formatDate } from "@/shared/lib/format"
import { usePreservedValue } from "@/shared/lib/use-preserved-value"

const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback

// La logística solo trabaja con pedidos que ya pasaron el análisis: no hay
// tab de "en análisis" acá.
type LogisticsStatusFilter = "en-proceso" | "cancelado" | "entregado"

const STATUS_FILTERS: ReadonlyArray<{
  id: LogisticsStatusFilter
  label: string
}> = [
  { id: "en-proceso", label: "En proceso" },
  { id: "cancelado", label: "Cancelados" },
  { id: "entregado", label: "Entregados" },
]

const EMPTY_MESSAGES: Readonly<
  Record<LogisticsStatusFilter, { title: string; description: string }>
> = {
  "en-proceso": {
    title: "No hay entregas pendientes",
    description: "Cuando un pedido pase a “En proceso” lo vas a ver acá.",
  },
  cancelado: {
    title: "No hay pedidos cancelados",
    description: "Los pedidos que canceles desde acá van a aparecer acá.",
  },
  entregado: {
    title: "No hay pedidos entregados",
    description: "Los pedidos ya entregados van a aparecer acá.",
  },
}

type PaymentFilter = "todos" | PaymentMethod

const PAYMENT_FILTERS: ReadonlyArray<{ id: PaymentFilter; label: string }> = [
  { id: "todos", label: "Todos" },
  { id: "cuenta-corriente", label: "Cta. cte." },
  { id: "contado", label: "Contado" },
]

// El backend no distingue "cancelado desde logística" de "cancelado por el
// cliente en análisis": ambos quedan con status "cancelado". Se los separa
// por el motivo, que solo esta pantalla completa (siempre uno de estos
// labels fijos); el cliente cancela sin motivo.
const LOGISTICS_CANCEL_LABELS = new Set(
  DELIVERY_CANCEL_REASONS.map((r) => r.label)
)

const isLogisticsCancellation = (order: Order): boolean =>
  Boolean(order.cancelReason) &&
  LOGISTICS_CANCEL_LABELS.has(order.cancelReason ?? "")

const matchesPayment = (order: Order, filter: PaymentFilter): boolean =>
  filter === "todos" || order.paymentMethod === filter

const matchesSearch = (order: Order, query: string): boolean => {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    order.id.toLowerCase().includes(q) ||
    clientLabel(order).toLowerCase().includes(q)
  )
}

export function AdminLogisticaPage() {
  const orders = useOrdersStore((s) => s.orders)
  const isLoading = useOrdersStore((s) => s.isLoading)
  const loadError = useOrdersStore((s) => s.loadError)
  const loadOrders = useOrdersStore((s) => s.loadOrders)
  const updateOrder = useOrdersStore((s) => s.updateOrder)
  const hydrateOrder = useOrdersStore((s) => s.hydrateOrder)

  useEffect(() => {
    void loadOrders()
  }, [loadOrders])

  const [statusFilter, setStatusFilter] =
    useState<LogisticsStatusFilter>("en-proceso")
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("todos")
  const [search, setSearch] = useState("")
  const hasFilters = paymentFilter !== "todos" || search !== ""
  const clearFilters = () => {
    setPaymentFilter("todos")
    setSearch("")
    setCurrentPage(1)
  }

  const ordersForStatus = useMemo(() => {
    const forStatus = selectOrdersForStatus(orders, statusFilter)
    // "Cancelados" solo muestra los cancelados desde acá: los que el
    // cliente canceló en análisis nunca pasaron por logística.
    return statusFilter === "cancelado"
      ? forStatus.filter(isLogisticsCancellation)
      : forStatus
  }, [orders, statusFilter])
  const filteredOrders = useMemo(
    () =>
      ordersForStatus.filter(
        (order) =>
          matchesPayment(order, paymentFilter) && matchesSearch(order, search)
      ),
    [ordersForStatus, paymentFilter, search]
  )

  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 8

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (value: string) => {
    if (value) {
      setStatusFilter(value as LogisticsStatusFilter)
      setCurrentPage(1)
    }
  }

  const handlePaymentFilterChange = (value: string) => {
    if (value) {
      setPaymentFilter(value as PaymentFilter)
      setCurrentPage(1)
    }
  }

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedOrders = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE
    return filteredOrders.slice(startIndex, startIndex + PAGE_SIZE)
  }, [filteredOrders, safeCurrentPage])

  const [registerId, setRegisterId] = useState<string | null>(null)
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogError, setDialogError] = useState<string | null>(null)
  // Se busca en todos los pedidos, no en los filtrados: el registro/cancel
  // solo se dispara desde una tarjeta "en proceso" ya visible en pantalla.
  const registerTarget = orders.find((o) => o.id === registerId)
  const cancelTarget = orders.find((o) => o.id === cancelId)
  const detailOrder = orders.find((o) => o.id === detailId)

  const displayedRegisterTarget = usePreservedValue(registerTarget)
  const displayedCancelTarget = usePreservedValue(cancelTarget)
  const displayedDetailOrder = usePreservedValue(detailOrder)

  // El listado no trae items: se piden con GET /orders/:id al abrir el
  // detalle o el registro de entrega, lo que ocurra primero (nunca los dos
  // diálogos a la vez).
  const [itemsError, setItemsError] = useState<string | null>(null)
  const itemsOrder = registerTarget ?? detailOrder
  const isLoadingItems =
    itemsOrder !== undefined && itemsOrder.items.length === 0 && !itemsError

  const loadOrderItems = useCallback(
    (id: string) =>
      hydrateOrder(id)
        .then(() => setItemsError(null))
        .catch((error: unknown) => {
          setItemsError(
            error instanceof Error
              ? error.message
              : "No pudimos cargar el detalle del pedido."
          )
        }),
    [hydrateOrder, setItemsError]
  )

  useEffect(() => {
    if (!itemsOrder || itemsOrder.items.length > 0) return
    void loadOrderItems(itemsOrder.id)
  }, [itemsOrder, loadOrderItems])

  const openRegister = (order: Order) => {
    setDialogError(null)
    setItemsError(null)
    setRegisterId(order.id)
  }

  const openCancel = (order: Order) => {
    setDialogError(null)
    setCancelId(order.id)
  }

  const closeDialogs = () => {
    setRegisterId(null)
    setCancelId(null)
    setDialogError(null)
  }

  const openDetails = (order: Order) => {
    setItemsError(null)
    setDetailId(order.id)
  }

  // Si la API falla, el dialog sigue abierto con el error y no se toca el
  // state: updateOrder solo escribe cuando el pedido ya fue entregado o
  // cancelado en el backend.
  const confirmRegister = async (input: {
    paymentMethod?: ContadoCollectionMethod
    observations?: string
  }) => {
    if (!registerTarget || isSubmitting) return
    setIsSubmitting(true)
    setDialogError(null)
    try {
      const updated = await updateOrder(registerTarget.id, {
        status: "entregado",
        paymentMethod: input.paymentMethod,
        observations: input.observations,
      })
      toast.success("Entrega registrada")
      closeDialogs()
      openDetails(updated)
    } catch (error) {
      setDialogError(errorMessage(error, "No pudimos registrar la entrega."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmCancel = async (input: {
    reason: DeliveryCancelReason
    observations: string
  }) => {
    if (!cancelTarget || isSubmitting) return
    setIsSubmitting(true)
    setDialogError(null)
    try {
      await updateOrder(cancelTarget.id, {
        status: "cancelado",
        reason: getDeliveryCancelReason(input.reason).label,
        observations: input.observations || undefined,
      })
      toast.success("Pedido cancelado")
      closeDialogs()
    } catch (error) {
      setDialogError(errorMessage(error, "No pudimos cancelar el pedido."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const showInitialLoading = isLoading && orders.length === 0
  const showLoadError = Boolean(loadError) && orders.length === 0

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <IconTruckDelivery className="size-4 text-primary" aria-hidden />
          <span className="text-xs font-medium tracking-wider uppercase">
            Logística
          </span>
        </div>
        <h1 className="font-heading text-[1.65rem] font-semibold tracking-tight">
          Entregas
        </h1>
        <p className="text-sm text-muted-foreground">
          Pedidos en proceso, cancelados y entregados. Registrá la entrega o
          cancelá un pedido en proceso.
        </p>
      </header>

      <section
        className="flex flex-col gap-3"
        aria-labelledby="deliveries-list"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 id="deliveries-list" className="text-sm font-medium">
            Pedidos{" "}
            {STATUS_FILTERS.find(
              (f) => f.id === statusFilter
            )?.label.toLowerCase()}
          </h2>
          {filteredOrders.length > 0 ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
              {filteredOrders.length}
            </span>
          ) : null}
        </div>

        {orders.length > 0 ? (
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3.5 shadow-2xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SearchInput
                value={search}
                onChange={handleSearchChange}
                placeholder="Buscar por ID o cliente…"
                ariaLabel="Buscar pedidos por ID o cliente"
                className="sm:max-w-xs"
              />
              <ToggleGroup
                type="single"
                variant="outline"
                size="sm"
                value={statusFilter}
                onValueChange={handleStatusFilterChange}
                className="flex-wrap justify-start"
              >
                {STATUS_FILTERS.map((filter) => (
                  <ToggleGroupItem key={filter.id} value={filter.id}>
                    {filter.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <ToggleGroup
                type="single"
                variant="outline"
                size="sm"
                value={paymentFilter}
                onValueChange={handlePaymentFilterChange}
                className="flex-wrap justify-start"
              >
                {PAYMENT_FILTERS.map((filter) => (
                  <ToggleGroupItem key={filter.id} value={filter.id}>
                    {filter.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              {hasFilters ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                >
                  Limpiar
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}

        {loadError && orders.length > 0 ? (
          <p
            role="status"
            className="rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground"
          >
            No pudimos actualizar los pedidos. Mostramos la última información
            guardada.
          </p>
        ) : null}

        {showInitialLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="size-6 text-muted-foreground" />
          </div>
        ) : showLoadError ? (
          <Empty className="max-w-md animate-fade-up self-center py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconInbox />
              </EmptyMedia>
              <EmptyTitle>Error al cargar</EmptyTitle>
              <EmptyDescription>{loadError}</EmptyDescription>
            </EmptyHeader>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadOrders()}
            >
              Reintentar
            </Button>
          </Empty>
        ) : ordersForStatus.length === 0 ? (
          <Empty className="max-w-md animate-fade-up self-center py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconTruckDelivery />
              </EmptyMedia>
              <EmptyTitle>{EMPTY_MESSAGES[statusFilter].title}</EmptyTitle>
              <EmptyDescription>
                {EMPTY_MESSAGES[statusFilter].description}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : filteredOrders.length === 0 ? (
          <Empty className="max-w-md animate-fade-up self-center py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconInbox />
              </EmptyMedia>
              <EmptyTitle>Sin resultados</EmptyTitle>
              <EmptyDescription>
                Ningún pedido coincide con estos filtros.
              </EmptyDescription>
            </EmptyHeader>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              Limpiar filtros
            </Button>
          </Empty>
        ) : (
          <div className="flex animate-fade-up flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-24 text-center font-semibold">
                      ID
                    </TableHead>
                    <TableHead className="text-left font-semibold">
                      Cliente
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      Fecha
                    </TableHead>
                    <TableHead className="text-right font-semibold">
                      Total
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      Pago
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      Estado
                    </TableHead>
                    <TableHead className="w-44 text-center font-semibold">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => {
                    const shortId = order.id.slice(0, 8).toUpperCase()
                    const payment = PAYMENT_METHODS.find(
                      (m) => m.id === order.paymentMethod
                    )
                    const isChecking =
                      order.paymentMethod === "cuenta-corriente"
                    const canManage = order.status === "en-proceso"

                    return (
                      <TableRow
                        key={order.id}
                        onClick={() => openDetails(order)}
                        className="cursor-pointer transition-colors hover:bg-muted/40"
                      >
                        <TableCell className="text-center font-mono text-xs font-semibold text-muted-foreground">
                          #{shortId}
                        </TableCell>
                        <TableCell className="text-left">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {clientLabel(order)}
                            </span>
                            {order.deliveryAddress ? (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <IconMapPin
                                  className="size-3 shrink-0"
                                  aria-hidden
                                />
                                <span
                                  className="line-clamp-1 max-w-[240px] truncate"
                                  title={order.deliveryAddress}
                                >
                                  {order.deliveryAddress}
                                </span>
                              </div>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-xs whitespace-nowrap text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-foreground tabular-nums">
                          {formatCurrency(order.subtotal)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={
                              isChecking
                                ? "border-blue-500/30 text-blue-600 dark:text-blue-400"
                                : "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                            }
                          >
                            {payment?.label ?? order.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell
                          className="text-center whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {canManage ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => openRegister(order)}
                                className="h-8 px-2.5 text-xs font-medium"
                              >
                                Entregar
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => openCancel(order)}
                                className="h-8 px-2 text-xs font-medium text-muted-foreground hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                              >
                                Cancelar
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => openDetails(order)}
                              className="h-8 gap-1 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                            >
                              <IconEye className="size-3.5" aria-hidden />
                              <span>Detalle</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            <OrdersPagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              totalItems={filteredOrders.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </section>

      {displayedRegisterTarget ? (
        <RegisterDeliveryDialog
          open={Boolean(registerTarget)}
          onOpenChange={(open) => {
            if (!open) closeDialogs()
          }}
          shortId={displayedRegisterTarget.id.slice(0, 8).toUpperCase()}
          clientName={displayedRegisterTarget.userName}
          deliveryAddress={displayedRegisterTarget.deliveryAddress}
          subtotal={displayedRegisterTarget.subtotal}
          orderPaymentMethod={displayedRegisterTarget.paymentMethod}
          items={displayedRegisterTarget.items}
          isLoadingItems={isLoadingItems}
          itemsError={itemsError}
          onRetryItems={() => {
            setItemsError(null)
            void loadOrderItems(displayedRegisterTarget.id)
          }}
          isSubmitting={isSubmitting}
          error={dialogError}
          onConfirm={(input) => void confirmRegister(input)}
        />
      ) : null}

      {displayedCancelTarget ? (
        <CancelDeliveryDialog
          open={Boolean(cancelTarget)}
          onOpenChange={(open) => {
            if (!open) closeDialogs()
          }}
          shortId={displayedCancelTarget.id.slice(0, 8).toUpperCase()}
          clientName={displayedCancelTarget.userName}
          isSubmitting={isSubmitting}
          error={dialogError}
          onConfirm={(input) => void confirmCancel(input)}
        />
      ) : null}

      {displayedDetailOrder ? (
        <OrderDetailDialog
          open={Boolean(detailOrder)}
          onOpenChange={(open) => {
            if (!open) setDetailId(null)
          }}
          order={displayedDetailOrder}
          clientName={clientLabel(displayedDetailOrder)}
          isLoadingItems={isLoadingItems}
          itemsError={itemsError}
          onRetryItems={() => {
            setItemsError(null)
            void loadOrderItems(displayedDetailOrder.id)
          }}
        />
      ) : null}
    </div>
  )
}
