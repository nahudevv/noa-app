import { useState } from "react"
import { Link } from "react-router"
import { IconBuildingWarehouse, IconMenu2 } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { AdminMobileNav } from "@/layout/admin-mobile-nav"

export function AdminTopbar() {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-border bg-card/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <Link
          to="/admin"
          className="flex items-center gap-2.5 text-sm font-semibold tracking-tight"
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconBuildingWarehouse className="size-4" aria-hidden />
          </div>
          <span className="truncate">Distribuidora NOA</span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setNavOpen(true)}
            aria-label="Abrir menú de navegación"
          >
            <IconMenu2 aria-hidden />
          </Button>
        </div>
      </header>
      <AdminMobileNav open={navOpen} onOpenChange={setNavOpen} />
    </>
  )
}
