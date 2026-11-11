import { useState } from "react"
import { Link, NavLink, useNavigate } from "react-router"
import {
  IconBox,
  IconBuildingWarehouse,
  IconChartBar,
  IconEye,
  IconLayoutGrid,
  IconLogout,
  IconReceipt,
  IconTruckDelivery,
  IconUsers,
  type Icon,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogoutDialog } from "@/shared/ui/logout-dialog"
import { useAuthStore } from "@/auth/session-store"
import { displayName } from "@/auth/model"
import { useCartStore } from "@/catalog/cart-store"
import { getInitials } from "@/shared/lib/initials"
import { cn } from "@/shared/lib/utils"

type NavItem = {
  to: string
  label: string
  icon: Icon
  end?: boolean
}

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { to: "/admin", label: "Panel general", icon: IconLayoutGrid, end: true },
  { to: "/admin/pedidos", label: "Pedidos", icon: IconReceipt },
  { to: "/admin/inventario", label: "Inventario", icon: IconBox },
  { to: "/admin/clientes", label: "Clientes", icon: IconUsers },
  { to: "/admin/logistica", label: "Logística", icon: IconTruckDelivery },
  { to: "/admin/monitoreo", label: "Monitoreo", icon: IconEye },
  { to: "/admin/reportes", label: "Reportes", icon: IconChartBar },
]

export function AdminSidebar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const clearCart = useCartStore((s) => s.clear)
  const navigate = useNavigate()
  const [logoutOpen, setLogoutOpen] = useState(false)

  const handleLogout = async () => {
    clearCart()
    await logout()
    setLogoutOpen(false)
    navigate("/login", { replace: true })
  }

  const initials = user ? getInitials(displayName(user)) : "?"

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
        <Link
          to="/admin"
          className="group flex min-w-0 items-center gap-3 rounded-lg p-1 transition-colors"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105">
            <IconBuildingWarehouse className="size-4.5" aria-hidden />
          </div>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold tracking-tight">
              Distribuidora NOA
            </span>
            <span className="truncate text-xs text-muted-foreground">
              Panel de control
            </span>
          </span>
        </Link>
        <ThemeToggle />
      </div>

      <nav aria-label="Administración" className="flex-1 overflow-y-auto p-3">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end ?? true}
                className={({ isActive }) =>
                  cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                    isActive
                      ? "bg-primary/10 font-medium text-primary shadow-2xs"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      aria-hidden
                      className={cn(
                        "absolute left-0 h-4 w-1 rounded-r-full bg-primary transition-all duration-200",
                        isActive
                          ? "scale-y-100 opacity-100"
                          : "scale-y-0 opacity-0"
                      )}
                    />
                    <item.icon
                      className={cn(
                        "size-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                      aria-hidden
                    />
                    <span className="truncate transition-transform duration-150 group-hover:translate-x-0.5">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto flex flex-col gap-2.5 border-t border-border bg-muted/20 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs font-semibold text-primary ring-1 ring-primary/20"
            aria-hidden
          >
            {initials}
          </div>
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-sm font-medium">
              {user ? displayName(user) : "Sin sesión"}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user?.email ?? ""}
            </span>
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setLogoutOpen(true)}
          aria-label="Cerrar sesión"
          className="w-full hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
        >
          <IconLogout data-icon="inline-start" />
          Salir
        </Button>
      </div>
      <LogoutDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={handleLogout}
      />
    </aside>
  )
}
