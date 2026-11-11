import { useCallback, useEffect, useMemo, useState } from "react"
import {
  IconBuildingBank,
  IconCash,
  IconInbox,
  IconRefresh,
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
import { clientLabel } from "@/logistics/client-label"
import type { OrderStatusId, PaymentMethod } from "@/orders/model"
import { PAYMENT_METHODS } from "@/orders/model"
import { useOrdersStore } from "@/orders/store"
import { OrderBarChart } from "@/orders/ui/order-bar-chart"
import { OrderDetailDialog } from "@/orders/ui/order-detail-dialog"
import { OrderPieChart } from "@/orders/ui/order-pie-chart"
import type { MonitoreoStatusFilter } from "@/orders/ui/orders-filters-bar"
import { OrdersFiltersBar } from "@/orders/ui/orders-filters-bar"
import { OrdersPagination } from "@/orders/ui/orders-pagination"
import { OrderStatusBadge } from "@/orders/ui/order-status-badge"
import { formatCurrency, formatDate } from "@/shared/lib/format"
import { usePreservedValue } from "@/shared/lib/use-preserved-value"

const PAGE_SIZE = 6

/**
 * Admin monitoring page:
 * Clean overview with 1 bar chart (by status), 1 pie chart (by payment method),
 * filter controls, and full orders table.
 */
export function AdminMonitoreoPage() {
  const orders = useOrdersStore((s) => s.orders)
  const isLoading = useOrdersStore((s) => s.isLoading)
  const loadError = useOrdersStore((s) => s.loadError)
  const loadOrders = useOrdersStore((s) => s.loadOrders)
  const hydrateOrder = useOrdersStore((s) => s.hydrateOrder)

  const [statusFilter, setStatusFilter] = useState<MonitoreoStatusFilter>("all")
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | "all">(
    "all"
  )
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Order inspection state for OrderDetailDialog
  const [inspectId, setInspectId] = useState<string | null>(null)
  const [itemsError, setItemsError] = useState<string | null>(null)
  const inspectOrder = orders.find((o) => o.id === inspectId)
  const displayedInspectOrder = usePreservedValue(inspectOrder)

  const isLoadingItems =
    inspectOrder !== undefined && inspectOrder.items.length === 0 && !itemsError

  const loadOrderItems = useCallback(
    (id: string) =>
      hydrateOrder(id)
        .then(() => setItemsError(null))
        .catch((error: unknown) => {
          setItemsError(
            error instanceof Error
              ? error.message
              : "No pudimos cargar el detalle de los productos."
          )
        }),
    [hydrateOrder]
  )

  useEffect(() => {
    document.title = "Monitoreo de Pedidos · Distribuidora NOA"
    void loadOrders()
  }, [loadOrders])

  useEffect(() => {
    if (inspectId) {
      void loadOrderItems(inspectId)
    }
  }, [inspectId, loadOrderItems])

  // Count distribution across all orders
  const statusCounts = useMemo<Record<MonitoreoStatusFilter, number>>(
    () => ({
      all: orders.length,
      active: orders.filter(
        (o) => o.status === "en-analisis" || o.status === "en-proceso"
      ).length,
      "en-analisis": orders.filter((o) => o.status === "en-analisis").length,
      "en-proceso": orders.filter((o) => o.status === "en-proceso").length,
      entregado: orders.filter((o) => o.status === "entregado").length,
      cancelado: orders.filter((o) => o.status === "cancelado").length,
    }),
    [orders]
  )

  // Filter orders matching status, payment, and search term
  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? order.status === "en-analisis" || order.status === "en-proceso"
            : order.status === statusFilter

      const matchesPayment =
        paymentFilter === "all" || order.paymentMethod === paymentFilter
      if (!matchesStatus || !matchesPayment) return false

      if (!query) return true
      return (
        order.id.toLowerCase().includes(query) ||
        order.userName.toLowerCase().includes(query) ||
        (order.deliveryAddress ?? "").toLowerCase().includes(query)
      )
    })
  }, [orders, statusFilter, paymentFilter, searchTerm])

  const handleSearchChange = (query: string) => {
    setSearchTerm(query)
    setCurrentPage(1)
  }

  const handleStatusChange = (status: MonitoreoStatusFilter) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handlePaymentChange = (payment: PaymentMethod | "all") => {
    setPaymentFilter(payment)
    setCurrentPage(1)
  }

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
      toast.success("Datos actualizados")
    } catch {
      toast.error("No pudimos actualizar los datos")
    } finally {
      setIsRefreshing(false)
    }
  }

  const showInitialLoading = isLoading && orders.length === 0

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 p-6">
      {/* Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Monitoreo de Pedidos
          </h1>
          <p className="text-sm text-muted-foreground">
            Control y seguimiento de todos los pedidos registrados en el
            sistema.
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

      {/* 2 CHARTS: 1 BAR CHART + 1 PIE/DONUT CHART */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Gráfico de Barras: Pedidos por Estado */}
        <OrderBarChart
          orders={orders}
          selectedStatus={
            statusFilter === "active"
              ? "all"
              : (statusFilter as OrderStatusId | "all")
          }
          onSelectStatus={handleStatusChange}
        />

        {/* Gráfico de Tortas: Medios de Pago */}
        <OrderPieChart
          orders={orders}
          selectedPayment={paymentFilter}
          onSelectPayment={handlePaymentChange}
        />
      </div>

      {/* FILTROS */}
      <OrdersFiltersBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        paymentFilter={paymentFilter}
        onPaymentChange={handlePaymentChange}
        statusCounts={statusCounts}
        placeholder="Buscar por ID, cliente o dirección..."
      />

      {/* TABLA CON TODOS LOS PEDIDOS */}
      {showInitialLoading ? (
        <div className="flex flex-1 items-center justify-center py-20">
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
      ) : orders.length === 0 ? (
        <Empty className="animate-fade-up border border-dashed py-14">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconInbox />
            </EmptyMedia>
            <EmptyTitle>Sin pedidos registrados</EmptyTitle>
            <EmptyDescription>
              Aún no se han recibido pedidos en el sistema.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : filteredOrders.length === 0 ? (
        <Empty className="animate-fade-up border border-dashed py-14">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconInbox />
            </EmptyMedia>
            <EmptyTitle>Sin resultados</EmptyTitle>
            <EmptyDescription>
              No hay pedidos que coincidan con los filtros seleccionados.
            </EmptyDescription>
          </EmptyHeader>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("")
              setStatusFilter("all")
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order) => {
                  const payment = PAYMENT_METHODS.find(
                    (method) => method.id === order.paymentMethod
                  )
                  const isChecking = order.paymentMethod === "cuenta-corriente"

                  return (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer transition-colors hover:bg-muted/40"
                      onClick={() => setInspectId(order.id)}
                      title="Clic para ver detalle"
                    >
                      <TableCell className="text-left font-medium text-foreground">
                        {order.userName}
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
                          className={`gap-1 font-medium ${
                            isChecking
                              ? "border-blue-500/30 text-blue-600 dark:text-blue-400"
                              : "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {isChecking ? (
                            <IconBuildingBank className="size-3" aria-hidden />
                          ) : (
                            <IconCash className="size-3" aria-hidden />
                          )}
                          <span>{payment?.label ?? order.paymentMethod}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Table Pagination */}
          <OrdersPagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            totalItems={filteredOrders.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Order Detail Modal Inspection */}
      {displayedInspectOrder ? (
        <OrderDetailDialog
          open={Boolean(inspectOrder)}
          onOpenChange={(open) => {
            if (!open) {
              setInspectId(null)
              setItemsError(null)
            }
          }}
          order={displayedInspectOrder}
          clientName={clientLabel(displayedInspectOrder)}
          isLoadingItems={isLoadingItems}
          itemsError={itemsError}
          onRetryItems={() => {
            setItemsError(null)
            void loadOrderItems(displayedInspectOrder.id)
          }}
        />
      ) : null}
    </div>
  )
}
