import { useEffect } from "react"
import { Link } from "react-router"
import {
  IconArrowRight,
  IconBox,
  IconChartBar,
  IconClock,
  IconEye,
  IconInbox,
  IconPackage,
  IconReceipt,
  IconTruckDelivery,
  IconUsers,
} from "@tabler/icons-react"

import { displayName } from "@/auth/model"
import { useAuthStore } from "@/auth/session-store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useOrdersStore } from "@/orders/store"
import { OrderStatusBadge } from "@/orders/ui/order-status-badge"
import { formatCurrency, formatDate } from "@/shared/lib/format"

/**
 * Executive director dashboard:
 * Fast, concise operational summary with direct one-click shortcuts
 * to Monitoring, Received Orders, Logistics, and other modules.
 */
export function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const orders = useOrdersStore((s) => s.orders)
  const loadOrders = useOrdersStore((s) => s.loadOrders)

  useEffect(() => {
    document.title = "Panel de Dirección · Distribuidora NOA"
    void loadOrders()
  }, [loadOrders])

  const pendingAnalysis = orders.filter((o) => o.status === "en-analisis")
  const inProcess = orders.filter((o) => o.status === "en-proceso")
  const delivered = orders.filter((o) => o.status === "entregado")
  const totalVolume = orders.reduce((sum, o) => sum + o.subtotal, 0)

  // 5 newest orders
  const recentOrders = orders.slice(0, 5)
  const userName = user ? displayName(user) : "Director"

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-6">
      {/* Executive Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              Panel de Dirección
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span>Operación en línea</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Hola, {userName}. Resumen ágil del flujo comercial y accesos rápidos
            de gestión.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            asChild
            variant="default"
            size="sm"
            className="h-8 gap-1.5 text-xs font-semibold shadow-xs"
          >
            <Link to="/admin/monitoreo">
              <IconEye className="size-3.5" aria-hidden />
              <span>Ver Monitoreo</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium"
          >
            <Link to="/admin/pedidos">
              <IconReceipt className="size-3.5" aria-hidden />
              <span>Pedidos ({pendingAnalysis.length})</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* Primary Quick Access Cards (The 2 Core Workflows) */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Shortcut 1: Pedidos Recibidos / Por Procesar */}
        <Link
          to="/admin/pedidos"
          className={`group flex items-center justify-between rounded-xl border p-4.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
            pendingAnalysis.length > 0
              ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500 dark:bg-amber-500/10"
              : "border-border bg-card hover:border-primary/40"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${
                pendingAnalysis.length > 0
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <IconInbox className="size-5.5" aria-hidden />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground transition-colors group-hover:text-primary">
                  Pedidos Recibidos
                </span>
                {pendingAnalysis.length > 0 && (
                  <Badge
                    variant="default"
                    className="h-5 bg-amber-600 px-1.5 text-[11px] font-bold text-white dark:bg-amber-500"
                  >
                    {pendingAnalysis.length} pendientes
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {pendingAnalysis.length > 0
                  ? "Hay pedidos en análisis comercial esperando aprobación"
                  : "Bandeja al día. No hay pedidos pendientes"}
              </p>
            </div>
          </div>

          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>

        {/* Shortcut 2: Monitoreo en Vivo */}
        <Link
          to="/admin/monitoreo"
          className="group flex items-center justify-between rounded-xl border border-border bg-card p-4.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105">
              <IconEye className="size-5.5" aria-hidden />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground transition-colors group-hover:text-primary">
                  Monitoreo Operativo
                </span>
                <Badge variant="secondary" className="h-5 px-1.5 text-[11px]">
                  {orders.length} pedidos
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Trazabilidad completa, gráficos y control en tiempo real
              </p>
            </div>
          </div>

          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      </section>

      {/* Concise Operational Metric Snapshot (Single Compact Row) */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Stat 1: Pendientes */}
        <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold tracking-wider uppercase">
              Por Revisar
            </span>
            <IconClock className="size-3.5 text-amber-500" aria-hidden />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {pendingAnalysis.length}
            </span>
            <span className="text-[11px] text-muted-foreground">en espera</span>
          </div>
        </div>

        {/* Stat 2: En Proceso */}
        <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold tracking-wider uppercase">
              En Despacho
            </span>
            <IconTruckDelivery className="size-3.5 text-blue-500" aria-hidden />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {inProcess.length}
            </span>
            <span className="text-[11px] text-muted-foreground">en camino</span>
          </div>
        </div>

        {/* Stat 3: Entregados */}
        <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold tracking-wider uppercase">
              Entregados
            </span>
            <IconPackage className="size-3.5 text-emerald-500" aria-hidden />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {delivered.length}
            </span>
            <span className="text-[11px] text-muted-foreground">
              completados
            </span>
          </div>
        </div>

        {/* Stat 4: Volumen */}
        <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold tracking-wider uppercase">
              Facturación
            </span>
            <IconReceipt className="size-3.5 text-primary" aria-hidden />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-foreground tabular-nums sm:text-2xl">
              {formatCurrency(totalVolume)}
            </span>
          </div>
        </div>
      </section>

      {/* Secondary Fast Action Buttons (Logística, Inventario, Clientes, Reportes) */}
      <section className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold text-muted-foreground uppercase">
          Acceso rápido:
        </span>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs font-medium hover:border-primary/40 hover:bg-muted/40"
        >
          <Link to="/admin/logistica">
            <IconTruckDelivery className="size-3.5 text-blue-500" />
            <span>Logística ({inProcess.length})</span>
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs font-medium hover:border-primary/40 hover:bg-muted/40"
        >
          <Link to="/admin/inventario">
            <IconBox className="size-3.5 text-muted-foreground" />
            <span>Inventario & Stock</span>
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs font-medium hover:border-primary/40 hover:bg-muted/40"
        >
          <Link to="/admin/clientes">
            <IconUsers className="size-3.5 text-muted-foreground" />
            <span>Clientes & Cuentas</span>
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs font-medium hover:border-primary/40 hover:bg-muted/40"
        >
          <Link to="/admin/reportes">
            <IconChartBar className="size-3.5 text-muted-foreground" />
            <span>Cierre & Reportes</span>
          </Link>
        </Button>
      </section>

      {/* Recent Orders (Compact Efficient Table) */}
      {recentOrders.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Últimos Pedidos
            </h2>
            <Button
              asChild
              variant="link"
              size="sm"
              className="group/link h-auto p-0 text-xs font-medium text-primary"
            >
              <Link to="/admin/monitoreo" className="flex items-center gap-1">
                <span>Ver todos en Monitoreo</span>
                <IconArrowRight className="size-3 transition-transform group-hover/link:translate-x-0.5" />
              </Link>
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
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
                    Estado
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer transition-colors hover:bg-muted/40"
                  >
                    <TableCell className="text-left font-medium text-foreground">
                      <Link
                        to={
                          order.status === "en-analisis"
                            ? "/admin/pedidos"
                            : "/admin/monitoreo"
                        }
                        className="block w-full hover:underline"
                      >
                        {order.userName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center text-xs whitespace-nowrap text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-foreground tabular-nums">
                      {formatCurrency(order.subtotal)}
                    </TableCell>
                    <TableCell className="text-center">
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      )}
    </div>
  )
}
