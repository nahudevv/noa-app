import { useEffect } from "react"
import { Link, Navigate, useLocation, type Location } from "react-router"
import { IconBuildingWarehouse } from "@tabler/icons-react"

import { LoginForm } from "@/auth/ui/login-form"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/auth/session-store"
import { useAuthHydration } from "@/auth/use-auth-hydration"
import { homePathForRole } from "@/auth/model"

type LocationState = { from?: Location }

export function LoginPage() {
  const hydrated = useAuthHydration()
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  const from = (location.state as LocationState | null)?.from?.pathname

  useEffect(() => {
    document.title = "Ingresar · Distribuidora NOA"
  }, [])

  if (hydrated && user) {
    return <Navigate to={from ?? homePathForRole(user.role)} replace />
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl"
      />
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-sm animate-page-in">
        <div className="mb-6 flex items-center justify-center gap-2.5 text-sm font-semibold tracking-tight text-foreground">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-2xs">
            <IconBuildingWarehouse className="size-4.5" aria-hidden />
          </div>
          <span>Distribuidora NOA</span>
        </div>

        <Card className="shadow-lg ring-1 ring-foreground/10">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Acceso mayorista
            </CardTitle>
            <CardDescription>
              Iniciá sesión con tu cuenta habilitada para operar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        <Separator className="my-6" />

        <p className="text-center text-xs text-muted-foreground">
          ¿Problemas para ingresar?{" "}
          <Link
            to="#"
            className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Contactá a tu vendedor
          </Link>
        </p>
      </div>
    </div>
  )
}
