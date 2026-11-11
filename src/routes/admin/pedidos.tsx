import { useEffect, useMemo, useState } from "react"
import { IconInbox, IconRefresh, IconSearch, IconX } from "@tabler/icons-react"
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
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Order, PaymentMethod } from "@/orders/model"
import { PAYMENT_METHODS } from "@/orders/model"
import { useOrdersStore } from "@/orders/store"
import { OrdersPagination } from "@/orders/ui/orders-pagination"
import { OrderStatusBadge } from "@/orders/ui/order-status-badge"
import { ProcessOrderDialog } from "@/orders/ui/process-order-dialog"
import { formatCurrency, formatDate } from "@/shared/lib/format"
import { usePreservedValue } from "@/shared/lib/use-preserved-value"

const PAGE_SIZE = 8

/**
 * Admin page for reviewing and processing incoming orders pending analysis.
 */
export function AdminPedidosPage() {
  const orders = useOrdersStore((s) => s.orders)
  const isLoading = useOrdersStore((s) => s.isLoading)
  const loadError = useOrdersStore((s) => s.loadError)
  const loadOrders = useOrdersStore((s) => s.loadOrders)
  const updateOrder = useOrdersStore((s) => s.updateOrder)

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const displayedOrder = usePreservedValue(selectedOrder)
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | "all">(
    "all"
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    document.title = "Pedidos · Distribuidora NOA"
    void loadOrders()
  }, [loadOrders])

  // Filter pending analysis orders first
  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status === "en-analisis"),
    [orders]
  )

  // Apply search query and payment filter
  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return pendingOrders.filter((order) => {
      const matchesPayment =
        paymentFilter === "all" || order.paymentMethod === paymentFilter
      if (!matchesPayment) return false

      if (!query) return true
      return (
        order.id.toLowerCase().includes(query) ||
        order.userName.toLowerCase().includes(query) ||
        (order.deliveryAddress ?? "").toLowerCase().includes(query)
      )
    })
  }, [pendingOrders, searchTerm, paymentFilter])

  // Calculate total pages and safe clamped page
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginatedOrders = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE
    return filteredOrders.slice(startIndex, startIndex + PAGE_SIZE)
  }, [filteredOrders, safeCurrentPage])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await loadOrders()
      toast.success("Pedidos sincronizados")
    } catch {
      toast.error("No pudimos actualizar los pedidos")
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedOrder) return
    const orderId = selectedOrder.id
    const clientName = selectedOrder.userName
    try {
      await updateOrder(orderId, { status: "en-proceso" })
      setSelectedOrder(null)
      toast.success("Pedido aprobado con éxito", {
        description: `El pedido de ${clientName} (#${orderId.slice(0, 8).toUpperCase()}) pasó a "En proceso".`,
      })
    } catch (err) {
      toast.error("Error al aprobar el pedido", {
        description:
          err instanceof Error
            ? err.message
            : "No pudimos procesar la aprobación del pedido.",
      })
    }
  }

  const handleCancel = async (reason: string, observations?: string) => {
    if (!selectedOrder) return
    const orderId = selectedOrder.id
    const clientName = selectedOrder.userName
    try {
      await updateOrder(orderId, {
        status: "cancelado",
        reason,
        observations: observations ?? "",
      })
      setSelectedOrder(null)
      toast.success("Pedido cancelado", {
        description: `El pedido de ${clientName} (#${orderId.slice(0, 8).toUpperCase()}) fue cancelado.`,
      })
    } catch (err) {
      toast.error("Error al cancelar el pedido", {
        description:
          err instanceof Error
            ? err.message
            : "No pudimos completar la cancelación.",
      })
    }
  }

  const showInitialLoading = isLoading && orders.length === 0

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-6">
      {/* Header with Title and Actions */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-[1.65rem] font-semibold tracking-tight">
              Recepción de Pedidos
            </h1>
            {!isLoading && (
              <Badge variant="secondary" className="text-xs font-semibold">
                {pendingOrders.length}{" "}
                {pendingOrders.length === 1 ? "pendiente" : "pendientes"}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Revisá los pedidos en análisis, verificá disponibilidad y aprobalos
            para preparación o cancelalos con motivo.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void handleRefresh()}
          disabled={isLoading || isRefreshing}
          className="gap-1.5 self-start text-xs font-medium sm:self-auto"
        >
          <IconRefresh
            className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            aria-hidden
          />
          <span>Actualizar</span>
        </Button>
      </header>

      {/* Search and Quick Filters Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <IconSearch
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Buscar por ID, cliente o dirección…"
            className="h-9 pr-8 pl-9 text-xs"
          />
          {searchTerm.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("")
                setCurrentPage(1)
              }}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpiar búsqueda"
            >
              <IconX className="size-3.5" aria-hidden />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="mr-1 text-xs text-muted-foreground">Pago:</span>
          <Button
            type="button"
            variant={paymentFilter === "all" ? "default" : "outline"}
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={() => {
              setPaymentFilter("all")
              setCurrentPage(1)
            }}
          >
            Todos
          </Button>
          <Button
            type="button"
            variant={
              paymentFilter === "cuenta-corriente" ? "default" : "outline"
            }
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={() => {
              setPaymentFilter("cuenta-corriente")
              setCurrentPage(1)
            }}
          >
            Cta. Cte.
          </Button>
          <Button
            type="button"
            variant={paymentFilter === "contado" ? "default" : "outline"}
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={() => {
              setPaymentFilter("contado")
              setCurrentPage(1)
            }}
          >
            Contado
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {showInitialLoading ? (
        <div className="flex flex-1 items-center justify-center py-24">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      ) : loadError && orders.length === 0 ? (
        <Empty className="animate-fade-up border border-dashed py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconInbox />
            </EmptyMedia>
            <EmptyTitle>Error al cargar pedidos</EmptyTitle>
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
      ) : pendingOrders.length === 0 ? (
        <Empty className="animate-fade-up border border-dashed py-14">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconInbox />
            </EmptyMedia>
            <EmptyTitle>Bandeja al día</EmptyTitle>
            <EmptyDescription>
              No hay pedidos pendientes de análisis en este momento.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : filteredOrders.length === 0 ? (
        <Empty className="animate-fade-up border border-dashed py-14">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconInbox />
            </EmptyMedia>
            <EmptyTitle>Sin coincidencias</EmptyTitle>
            <EmptyDescription>
              Ningún pedido pendiente coincide con los filtros aplicados.
            </EmptyDescription>
          </EmptyHeader>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("")
              setPaymentFilter("all")
            }}
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
                  <TableHead className="w-28 text-center font-semibold">
                    Acción
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order) => {
                  const payment = PAYMENT_METHODS.find(
                    (method) => method.id === order.paymentMethod
                  )

                  return (
                    <TableRow
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="cursor-pointer transition-colors hover:bg-muted/40"
                    >
                      <TableCell className="text-center font-mono text-xs font-semibold text-muted-foreground">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {order.userName}
                          </span>
                          {order.deliveryAddress && (
                            <span
                              className="line-clamp-1 max-w-[260px] text-xs text-muted-foreground"
                              title={order.deliveryAddress}
                            >
                              {order.deliveryAddress}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-xs whitespace-nowrap text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-foreground tabular-nums">
                        {formatCurrency(order.subtotal)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {payment?.label ?? order.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell
                        className="text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="h-8 px-3 text-xs font-medium"
                        >
                          Procesar
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination bar */}
          <OrdersPagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            totalItems={filteredOrders.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Modal Dialog for Processing or Cancelling Order */}
      {displayedOrder ? (
        <ProcessOrderDialog
          key={displayedOrder.id}
          open={Boolean(selectedOrder)}
          onOpenChange={(open) => {
            if (!open) setSelectedOrder(null)
          }}
          order={displayedOrder}
          onApprove={() => void handleApprove()}
          onCancel={(reason, observations) =>
            void handleCancel(reason, observations)
          }
        />
      ) : null}
    </div>
  )
}
