"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { MonthBoard } from "@/components/month-board"
import { TimeTranslator } from "@/components/time-translator"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-8 h-8" />

  const isDark = theme === "dark"
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}

export default function HumanCalendarPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/30">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-accent/30 flex items-center justify-center">
            <Sun className="w-3.5 h-3.5 text-accent-foreground" aria-hidden />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">Human Calendar</span>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-[11px] text-muted-foreground/50 hidden sm:block">
            Low-effort month &amp; time reference
          </p>
          <ThemeToggle />
        </div>
      </header>

      {/* Split layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* LEFT — Month board */}
        <section
          aria-label="Month Mapping Board"
          className="flex-1 md:flex-[5] border-b md:border-b-0 md:border-r border-border/20 px-5 py-5 overflow-y-auto"
        >
          <MonthBoard />
        </section>

        {/* Divider decoration (desktop) */}
        <div className="hidden md:flex flex-col items-center justify-center w-px bg-border/20 relative">
          <div className="absolute w-px h-24 bg-gradient-to-b from-transparent via-border/60 to-transparent" />
        </div>

        {/* RIGHT — Time translator */}
        <section
          aria-label="Time Translator"
          className="flex-1 md:flex-[4] px-5 py-5 overflow-y-auto"
        >
          <TimeTranslator />
        </section>
      </div>
    </main>
  )
}
