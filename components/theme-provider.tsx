"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { loadThemePreference } from "@/lib/local-storage"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  // Initialize theme from localStorage on client side
  useEffect(() => {
    const savedTheme = loadThemePreference()
    if (savedTheme) {
      setTheme(savedTheme)
    }
    setMounted(true)
  }, [])

  // Apply theme class to document
  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme, mounted])

  // Add media query listener for system theme changes
  useEffect(() => {
    if (!mounted) return
    
    // Only add listener if using system theme
    if (theme !== 'system') return
    
    const mqListener = (e: MediaQueryListEvent) => {
      const root = window.document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(e.matches ? "dark" : "light")
    }
    
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    mq.addEventListener("change", mqListener)
    
    return () => {
      mq.removeEventListener("change", mqListener)
    }
  }, [theme, mounted])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem("ui-theme", theme)
      setTheme(theme)
    },
  }

  // Avoid hydration mismatch by rendering a simple div until mounted
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
