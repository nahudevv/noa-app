import { useState } from "react"
import { useLocation, useNavigate } from "react-router"
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
import { LogoutDialog } from "@/shared/ui/logout-dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useAuthStore } from "@/auth/session-store"
import { displayName } from "@/auth/model"
import { useCartStore } from "@/catalog/cart-store"
import { getInitials } from "@/shared/lib/initials"
import { cn } from "@/shared/lib/utils"

type NavItem = {
  to: string
  label: string
  icon: Icon
}

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { to: "/admin", label: "Panel general", icon: IconLayoutGrid },
  { to: "/admin/pedidos", label: "Pedidos", icon: IconReceipt },
  { to: "/admin/inventario", label: "Inventario", icon: IconBox },
  { to: "/admin/clientes", label: "Clientes", icon: IconUsers },
  { to: "/admin/logistica", label: "Logística", icon: IconTruckDelivery },
  { to: "/admin/monitoreo", label: "Monitoreo", icon: IconEye },
  { to: "/admin/reportes", label: "Reportes", icon: IconChartBar },
]

type AdminMobileNavProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminMobileNav({ open, onOpenChange }: AdminMobileNavProps) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const clearCart = useCartStore((s) => s.clear)
  const navigate = useNavigate()
  const location = useLocation()
  const [logoutOpen, setLogoutOpen] = useState(false)

  const handleNavigate = (to: string) => {
    onOpenChange(false)
    navigate(to)
  }

  const handleLogout = async () => {
    clearCart()
    await logout()
    setLogoutOpen(false)
    onOpenChange(false)
    navigate("/login", { replace: true })
  }

  const initials = user ? getInitials(displayName(user)) : "?"

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="left"
          className="flex w-72 max-w-[85vw] flex-col gap-0 p-0"
          showCloseButton
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Menú de administración</SheetTitle>
            <SheetDescription>
              Navegación del panel de control de Distribuidora NOA
            </SheetDescription>
          </SheetHeader>
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
          </div>

          <nav
            aria-label="Administración"
            className="flex-1 overflow-y-auto p-3"
          >
            <ul className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.to
                return (
                  <li key={item.to}>
                    <button
                      type="button"
                      onClick={() => handleNavigate(item.to)}
                      className={cn(
                        "group relative flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all duration-150",
                        isActive
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                      )}
                    >
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
                          "size-4 shrink-0 transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                        aria-hidden
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  </li>
                )
              })}
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
        </SheetContent>
      </Sheet>
      <LogoutDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={handleLogout}
      />
    </>
  )
}
