"use client"

import { useState, useEffect, useRef } from "react"
import { translateToThaiTime } from "@/lib/calendar-data"
import { cn } from "@/lib/utils"
import {
  Clock,
  X,
  Radio,
  Moon,
  Sunrise,
  Sun,
  Sunset,
  Cloud,
  ChevronDown,
  Check,
} from "lucide-react"
import type { PeriodIconType } from "@/lib/calendar-data"

function pad(n: number) {
  return n.toString().padStart(2, "0")
}

// Icon color map per period
const PERIOD_ICON_CONFIG: Record<
  PeriodIconType,
  { icon: typeof Moon; color: string }
> = {
  Moon:    { icon: Moon,    color: "text-indigo-400" },
  Clock:   { icon: Clock,   color: "text-blue-400" },
  Sunrise: { icon: Sunrise, color: "text-orange-400" },
  Sun:     { icon: Sun,     color: "text-yellow-400" },
  Cloud:   { icon: Cloud,   color: "text-sky-400" },
  Sunset:  { icon: Sunset,  color: "text-rose-400" },
}

type TimeMode = "24hr" | "ampm"

const HOURS_24 = Array.from({ length: 24 }, (_, i) => i)

function to12(h: number): { hour: number; period: "AM" | "PM" } {
  if (h === 0)  return { hour: 12, period: "AM" }
  if (h < 12)   return { hour: h,  period: "AM" }
  if (h === 12) return { hour: 12, period: "PM" }
  return { hour: h - 12, period: "PM" }
}

function from12(h: number, p: "AM" | "PM"): number {
  if (p === "AM") return h === 12 ? 0 : h
  return h === 12 ? 12 : h + 12
}

function formatHourLabel(h: number, mode: TimeMode): string {
  if (mode === "24hr") return `${pad(h)}:00`
  const { hour, period } = to12(h)
  return `${hour}:00 ${period}`
}

interface HourDropdownProps {
  value: number | null
  liveHour: number
  useLive: boolean
  mode: TimeMode
  onChange: (h: number) => void
}

function HourDropdown({ value, liveHour, useLive, mode, onChange }: HourDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const displayHour = useLive ? liveHour : (value ?? liveHour)
  const label = formatHourLabel(displayHour, mode)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border text-sm font-mono transition-all",
          "bg-muted/30 border-border/50 text-foreground hover:bg-muted/50 hover:border-border",
          open && "border-accent/50 bg-muted/50"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <span className="flex-1 text-left tabular-nums">{label}</span>
        {useLive && (
          <span className="text-[10px] text-accent-foreground/70 uppercase tracking-wide">Live</span>
        )}
        <ChevronDown
          className={cn("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-50 top-full mt-1 left-0 right-0 max-h-56 overflow-y-auto rounded-xl border border-border bg-card shadow-xl"
        >
          {HOURS_24.map((h) => {
            const isSelected = !useLive && value === h
            return (
              <button
                key={h}
                role="option"
                aria-selected={isSelected}
                onClick={() => { onChange(h); setOpen(false) }}
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-2 text-sm font-mono transition-colors text-left",
                  isSelected
                    ? "bg-accent/20 text-accent-foreground"
                    : "text-foreground/80 hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <span className="tabular-nums flex-1">{formatHourLabel(h, mode)}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-accent-foreground" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function TimeTranslator() {
  const [selectedHour, setSelectedHour] = useState<number | null>(null)
  const [liveTime, setLiveTime] = useState<{ hour: number; minute: number; second: number } | null>(null)
  const [useLive, setUseLive] = useState(true)
  const [mode, setMode] = useState<TimeMode>("24hr")

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setLiveTime({ hour: now.getHours(), minute: now.getMinutes(), second: now.getSeconds() })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const activeHour: number = useLive && liveTime ? liveTime.hour : (selectedHour ?? 0)
  const result = translateToThaiTime(activeHour, 0)

  const handleHourChange = (hour: number) => {
    setSelectedHour(hour)
    setUseLive(false)
  }

  const handleClear = () => {
    setSelectedHour(null)
    setUseLive(true)
  }

  const displayHour = pad(activeHour)
  const displaySecond = useLive && liveTime ? pad(liveTime.second) : null

  const periodConfig = PERIOD_ICON_CONFIG[result.periodIcon]
  const PeriodIcon = periodConfig.icon

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-0.5">
          Time Translator
        </h2>
        <p className="text-[11px] text-muted-foreground/60 flex items-center gap-1">
          {useLive ? (
            <>
              <Radio className="w-2.5 h-2.5 text-accent-foreground" aria-hidden />
              Live — showing current time
            </>
          ) : (
            "Custom hour selected"
          )}
        </p>
      </div>

      {/* Big clock display */}
      <div className="flex items-baseline gap-1 mb-5">
        <span className="text-5xl font-bold tracking-tight tabular-nums text-foreground">
          {displayHour}
        </span>
        <span className="text-3xl font-light text-muted-foreground mb-0.5">:</span>
        <span className="text-5xl font-bold tracking-tight tabular-nums text-foreground">00</span>
        {displaySecond !== null && (
          <>
            <span className="text-xl font-light text-muted-foreground/50 mb-0.5 ml-0.5">:</span>
            <span className="text-xl font-mono text-muted-foreground/50 tabular-nums mb-0.5">
              {displaySecond}
            </span>
          </>
        )}
      </div>

      {/* Thai translation result */}
      <div className="bg-muted/30 border border-border/50 rounded-2xl p-5 mb-5 transition-all duration-300">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-4xl font-bold text-foreground leading-none mb-2 text-pretty">
              {result.thaiSpoken}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="text-accent-foreground font-medium">{result.periodEnglish}</span>
              {" · "}
              <span>{result.period}</span>
            </p>
          </div>
          <PeriodIcon
            className={cn("w-8 h-8 flex-shrink-0 mt-1", periodConfig.color)}
            aria-hidden
          />
        </div>
      </div>

      {/* Controls row: dropdown + mode toggle */}
      <div className="flex items-center gap-2 mb-5">
        <div className="flex-1">
          <HourDropdown
            value={selectedHour}
            liveHour={liveTime?.hour ?? 0}
            useLive={useLive}
            mode={mode}
            onChange={handleHourChange}
          />
        </div>

        {/* 24hr / AM-PM toggle */}
        <div className="flex items-center rounded-xl border border-border/50 bg-muted/20 p-0.5 gap-0.5 flex-shrink-0">
          <button
            onClick={() => setMode("24hr")}
            className={cn(
              "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
              mode === "24hr"
                ? "bg-accent/20 text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            24h
          </button>
          <button
            onClick={() => setMode("ampm")}
            className={cn(
              "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
              mode === "ampm"
                ? "bg-accent/20 text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            AM/PM
          </button>
        </div>

        {/* Clear / back to live */}
        {!useLive && (
          <button
            onClick={handleClear}
            className="p-2 rounded-xl border border-border/50 bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all flex-shrink-0"
            aria-label="Back to live time"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Reference table */}
      <div>
        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-2">Thai Time Periods</p>
        <div className="grid grid-cols-2 gap-1.5">
          {(
            [
              { period: "เที่ยงคืน", en: "Midnight",  time: "00:00", icon: "Moon"    },
              { period: "ตี ...",     en: "Deep Night", time: "01–05", icon: "Clock"   },
              { period: "... โมงเช้า",en: "Morning",   time: "06–11", icon: "Sun"     },
              { period: "เที่ยง",    en: "Noon",       time: "12:00", icon: "Sun"     },
              { period: "บ่าย ...",   en: "Afternoon",  time: "13–15", icon: "Cloud"   },
              { period: "... โมงเย็น",en: "Evening",   time: "16–18", icon: "Sunset"  },
              { period: "... ทุ่ม",   en: "Night",     time: "19–23", icon: "Moon"    },
            ] as Array<{ period: string; en: string; time: string; icon: PeriodIconType }>
          ).map((row) => {
            const cfg = PERIOD_ICON_CONFIG[row.icon]
            const IconComp = cfg.icon
            const isActive = result.periodEnglish === row.en
            return (
              <div
                key={row.period}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2.5 py-2 transition-all",
                  isActive
                    ? "bg-accent/15 border border-accent/30"
                    : "bg-muted/20 border border-transparent"
                )}
              >
                <IconComp
                  className={cn("w-4 h-4 flex-shrink-0", isActive ? cfg.color : "text-muted-foreground/40")}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-foreground/80 leading-none truncate">{row.period}</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5">{row.time} · {row.en}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
