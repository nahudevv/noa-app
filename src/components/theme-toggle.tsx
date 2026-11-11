import { IconMoon, IconSun } from "@tabler/icons-react"

import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/shared/lib/utils"

type ThemeToggleProps = {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)

    setTheme(isDark ? "light" : "dark")
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      title="Cambiar tema (Atajo: D)"
      aria-label="Cambiar tema claro u oscuro"
      className={cn(
        "relative overflow-hidden text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <IconSun
        className="size-4 scale-100 rotate-0 transition-all duration-300 dark:scale-0 dark:-rotate-90"
        aria-hidden
      />
      <IconMoon
        className="absolute size-4 scale-0 rotate-90 transition-all duration-300 dark:scale-100 dark:rotate-0"
        aria-hidden
      />
    </Button>
  )
}
