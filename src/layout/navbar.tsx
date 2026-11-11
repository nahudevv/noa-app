import { useState } from "react"
import { NavLink, useLocation, useNavigate } from "react-router"
import {
  IconBox,
  IconBuildingWarehouse,
  IconLogout,
  IconMenu2,
  IconReceipt,
  type Icon,
} from "@tabler/icons-react"

import { CartButton } from "@/catalog/ui/cart-button"
import { CartDrawer } from "@/catalog/ui/cart-drawer"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
}

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { to: "/catalogo", label: "Catálogo", icon: IconBox },
  { to: "/pedidos", label: "Mis pedidos", icon: IconReceipt },
]

export function Navbar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const clearCart = useCartStore((s) => s.clear)
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)

  const handleLogout = async () => {
    clearCart()
    await logout()
    setLogoutOpen(false)
    setMenuOpen(false)
    navigate("/login", { replace: true })
  }

  const handleNavigate = (to: string) => {
    setMenuOpen(false)
    navigate(to)
  }

  const isClient = user?.role === "cliente"
  const initials = user ? getInitials(displayName(user)) : "?"

  return (
    <>
      <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-border bg-card/90 px-4 py-2.5 backdrop-blur-md sm:px-6">
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
          <NavLink
            to="/catalogo"
            className="group flex min-w-0 items-center gap-2.5 text-sm font-semibold tracking-tight"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105">
              <IconBuildingWarehouse className="size-4.5" aria-hidden />
            </div>
            <span className="truncate">Distribuidora NOA</span>
          </NavLink>
          <nav
            aria-label="Principal"
            className="hidden items-center gap-1 lg:flex"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/pedidos"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all duration-150",
                    isActive
                      ? "bg-primary/10 font-medium text-primary shadow-2xs"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={cn(
                        "size-4 shrink-0 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                      aria-hidden
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isClient ? (
            <div className="lg:hidden">
              <CartButton onClick={() => setCartOpen(true)} />
            </div>
          ) : null}
          <ThemeToggle />
          {user ? (
            <div className="hidden items-center gap-2 pl-1 lg:flex">
              <div
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[11px] font-semibold text-primary ring-1 ring-primary/20"
                aria-hidden
              >
                {initials}
              </div>
              <span className="max-w-[160px] truncate text-sm font-medium text-foreground">
                {displayName(user)}
              </span>
            </div>
          ) : null}
          <Separator
            orientation="vertical"
            className="mx-0.5 hidden h-5 lg:block"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLogoutOpen(true)}
            aria-label="Cerrar sesión"
            className="hidden text-muted-foreground hover:bg-destructive/10 hover:text-destructive lg:inline-flex"
          >
            <IconLogout data-icon="inline-start" />
            Salir
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú de navegación"
            className="lg:hidden"
          >
            <IconMenu2 aria-hidden />
          </Button>
        </div>
      </header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="left"
          className="flex w-72 max-w-[85vw] flex-col gap-0 p-0"
          showCloseButton
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Menú principal</SheetTitle>
            <SheetDescription>Navegación de Distribuidora NOA</SheetDescription>
          </SheetHeader>
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconBuildingWarehouse className="size-4.5" aria-hidden />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              Distribuidora NOA
            </span>
          </div>
          <nav aria-label="Principal" className="flex-1 overflow-y-auto p-3">
            <ul className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname.startsWith(item.to)
                return (
                  <li key={item.to}>
                    <button
                      type="button"
                      onClick={() => handleNavigate(item.to)}
                      className={cn(
                        "relative flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all duration-150",
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
                          "size-4 shrink-0",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                        aria-hidden
                      />
                      <span>{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
          <div className="mt-auto border-t border-border bg-muted/20 p-3">
            {user ? (
              <div className="mb-2.5 flex items-center gap-3 rounded-lg px-2 py-1.5">
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs font-semibold text-primary ring-1 ring-primary/20"
                  aria-hidden
                >
                  {initials}
                </div>
                <div className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="truncate text-sm font-medium">
                    {displayName(user)}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            ) : null}
            <Button
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

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <LogoutDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={handleLogout}
      />
    </>
  )
}
