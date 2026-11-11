import { useEffect } from "react"
import { Link } from "react-router"
import {
  IconArrowRight,
  IconBox,
  IconChartBar,
  IconClock,
  IconEye,
  IconPackage,
  IconReceipt,
  IconTruckDelivery,
  IconUsers,
} from "@tabler/icons-react"

import { useAuthStore } from "@/auth/session-store"
import { displayName } from "@/auth/model"
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

type ModuleShortcut = {
  readonly to: string
  readonly title: string
  readonly description: string
  readonly icon: typeof IconReceipt
  readonly badge?: { label: string; tone: "default" | "secondary" | "outline" }
}

/**
 * Main dashboard for the administrative portal.
 * Provides high-level operational metrics, quick navigation cards, and recent orders.
 */
export function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const orders = useOrdersStore((s) => s.orders)
  const loadOrders = useOrdersStore((s) => s.loadOrders)

  useEffect(() => {
    document.title = "Panel de Control · Distribuidora NOA"
    void loadOrders()
  }, [loadOrders])

  const pendingAnalysis = orders.filter((o) => o.status === "en-analisis")
  const inProcess = orders.filter((o) => o.status === "en-proceso")
  const delivered = orders.filter((o) => o.status === "entregado")
  const totalVolume = orders.reduce((sum, o) => sum + o.subtotal, 0)

  // Top 5 newest orders
  const recentOrders = orders.slice(0, 5)

  const userName = user ? displayName(user) : "Administrador"

  const MODULES: ReadonlyArray<ModuleShortcut> = [
    {
      to: "/admin/pedidos",
      title: "Recepción de Pedidos",
      description:
        "Revisá pedidos en análisis, verificá disponibilidad y aprobalos para preparación.",
      icon: IconReceipt,
      badge:
        pendingAnalysis.length > 0
          ? {
              label: `${pendingAnalysis.length} ${
                pendingAnalysis.length === 1 ? "pendiente" : "pendientes"
              }`,
              tone: "default",
            }
          : undefined,
    },
    {
      to: "/admin/monitoreo",
      title: "Monitoreo de Estados",
      description:
        "Trazabilidad en tiempo real, métricas de cobro y consulta detallada de productos.",
      icon: IconEye,
      badge: {
        label: `${orders.length} pedidos`,
        tone: "secondary",
      },
    },
    {
      to: "/admin/logistica",
      title: "Logística y Entregas",
      description:
        "Seguimiento de pedidos en camino, registro de cobros contado y entregas efectivas.",
      icon: IconTruckDelivery,
      badge:
        inProcess.length > 0
          ? {
              label: `${inProcess.length} en proceso`,
              tone: "outline",
            }
          : undefined,
    },
    {
      to: "/admin/inventario",
      title: "Inventario y Stock",
      description:
        "Control de stock de mercadería, catálogo de productos y precios mayoristas.",
      icon: IconBox,
    },
    {
      to: "/admin/clientes",
      title: "Clientes y Cuentas",
      description:
        "Gestión de saldos de cuenta corriente, límites de crédito y movimientos comerciales.",
      icon: IconUsers,
    },
    {
      to: "/admin/reportes",
      title: "Reportes y Caja",
      description:
        "Métricas de ventas, desglose de métodos de pago y cierres operativos de caja.",
      icon: IconChartBar,
    },
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
      {/* Welcome Banner */}
      <header className="flex flex-col gap-2 rounded-xl border border-border bg-gradient-to-r from-card via-card to-primary/5 p-5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              ¡Hola, {userName}!
            </h1>
            <span className="flex size-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Bienvenido al panel de gestión de{" "}
            <strong className="font-semibold text-foreground">
              Distribuidora NOA
            </strong>
            . Acá tenés el resumen de la operación en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="outline" className="gap-1.5 bg-card/80 py-1 text-xs">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Operación Activa
          </Badge>
        </div>
      </header>

      {/* Primary KPI Stats Grid */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Pending Analysis KPI */}
        <div
          className={`flex flex-col justify-between rounded-xl border p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
            pendingAnalysis.length > 0
              ? "border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10"
              : "border-border bg-card"
          }`}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold tracking-wider uppercase">
              En Análisis
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <IconClock className="size-4" aria-hidden />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-amber-600 tabular-nums dark:text-amber-400">
              {pendingAnalysis.length}
            </span>
            {pendingAnalysis.length > 0 && (
              <Button
                asChild
                variant="link"
                size="sm"
                className="group/link h-auto p-0 text-xs"
              >
                <Link to="/admin/pedidos" className="flex items-center gap-1">
                  <span>Revisar</span>
                  <IconArrowRight className="size-3 transition-transform group-hover/link:translate-x-0.5" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* In Process KPI */}
        <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold tracking-wider uppercase">
              En Proceso / Logística
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <IconTruckDelivery className="size-4" aria-hidden />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {inProcess.length}
            </span>
            <span className="text-xs text-muted-foreground">
              En preparación / entrega
            </span>
          </div>
        </div>

        {/* Delivered Orders KPI */}
        <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold tracking-wider uppercase">
              Entregados
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <IconPackage className="size-4" aria-hidden />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {delivered.length}
            </span>
            <span className="text-xs text-muted-foreground">Completados</span>
          </div>
        </div>

        {/* Total Volume KPI */}
        <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold tracking-wider uppercase">
              Volumen Gestionado
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconReceipt className="size-4" aria-hidden />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-xl font-bold tracking-tight text-foreground tabular-nums">
              {formatCurrency(totalVolume)}
            </span>
            <span className="text-xs text-muted-foreground">
              {orders.length} pedidos
            </span>
          </div>
        </div>
      </section>

      {/* Modules Quick Access Grid */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
          Módulos del Sistema
        </h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((mod, index) => (
            <Link
              key={mod.to}
              to={mod.to}
              style={{ animationDelay: `${index * 40}ms` }}
              className="group flex animate-fade-up flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/25 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted transition-all duration-200 group-hover:scale-105 group-hover:bg-primary/10 group-hover:text-primary">
                    <mod.icon className="size-5" aria-hidden />
                  </div>
                  {mod.badge && (
                    <Badge variant={mod.badge.tone} className="text-[11px]">
                      {mod.badge.label}
                    </Badge>
                  )}
                </div>

                <h3 className="mt-3 text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                  {mod.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {mod.description}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary opacity-70 transition-all duration-200 group-hover:opacity-100">
                <span>Ingresar</span>
                <IconArrowRight
                  className="size-3.5 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Orders Overview */}
      {recentOrders.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
              Últimos Pedidos Registrados
            </h2>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="group/all h-8 gap-1 text-xs font-medium"
            >
              <Link to="/admin/monitoreo">
                <span>Ver todos en Monitoreo</span>
                <IconArrowRight
                  className="size-3.5 transition-transform duration-150 group-hover/all:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-28 text-center">ID</TableHead>
                  <TableHead className="text-left">Cliente</TableHead>
                  <TableHead className="text-center">Fecha</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="w-24 text-center">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="transition-colors hover:bg-muted/40"
                  >
                    <TableCell className="text-center font-mono text-xs font-semibold text-muted-foreground">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell className="text-left font-medium text-foreground">
                      {order.userName}
                    </TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-foreground tabular-nums">
                      {formatCurrency(order.subtotal)}
                    </TableCell>
                    <TableCell className="text-center">
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                      >
                        <Link
                          to={
                            order.status === "en-analisis"
                              ? "/admin/pedidos"
                              : "/admin/monitoreo"
                          }
                        >
                          Ver
                        </Link>
                      </Button>
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
