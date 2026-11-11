import { useState } from "react"

/**
 * Retains the last non-null/defined value so controlled modals can complete
 * their exit animation when the active selection is cleared.
 */
export function usePreservedValue<T>(value: T | null | undefined): T | null {
  const [preserved, setPreserved] = useState<T | null>(value ?? null)

  if (value !== null && value !== undefined && value !== preserved) {
    setPreserved(value)
  }

  return value ?? preserved
}
