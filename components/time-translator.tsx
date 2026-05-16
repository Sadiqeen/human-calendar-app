"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import type { PeriodIconType } from "@/lib/calendar-data"

function pad(n: number) {
  return n.toString().padStart(2, "0")
}

const PERIOD_ICON_CONFIG: Record<PeriodIconType, { icon: typeof Moon; color: string }> = {
  Moon:    { icon: Moon,    color: "text-indigo-400" },
  Clock:   { icon: Clock,   color: "text-blue-400" },
  Sunrise: { icon: Sunrise, color: "text-orange-400" },
  Sun:     { icon: Sun,     color: "text-yellow-400" },
  Cloud:   { icon: Cloud,   color: "text-sky-400" },
  Sunset:  { icon: Sunset,  color: "text-rose-400" },
}

type TimeMode = "24hr" | "ampm"

// --- Scroll-Wheel Column ---
interface WheelColumnProps {
  items: string[]
  selectedIndex: number
  onChange: (index: number) => void
  label?: string
}

const ITEM_H = 44 // px per row

function WheelColumn({ items, selectedIndex, onChange, label }: WheelColumnProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startY = useRef(0)
  const startIndex = useRef(0)
  const frameRef = useRef<number | null>(null)

  // Scroll into view on change
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.scrollTo({ top: selectedIndex * ITEM_H, behavior: "smooth" })
  }, [selectedIndex])

  const clamp = (v: number) => Math.max(0, Math.min(items.length - 1, v))

  const handleScroll = useCallback(() => {
    if (frameRef.current) return
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null
      const el = containerRef.current
      if (!el) return
      const idx = Math.round(el.scrollTop / ITEM_H)
      if (idx !== selectedIndex) onChange(clamp(idx))
    })
  }, [selectedIndex, onChange, items.length])

  // Touch/mouse drag
  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    startY.current = e.clientY
    startIndex.current = selectedIndex
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    const delta = startY.current - e.clientY
    const newIdx = clamp(startIndex.current + Math.round(delta / ITEM_H))
    if (newIdx !== selectedIndex) {
      onChange(newIdx)
      containerRef.current?.scrollTo({ top: newIdx * ITEM_H, behavior: "instant" })
    }
  }
  const onPointerUp = () => { isDragging.current = false }

  return (
    <div className="flex flex-col items-center select-none">
      {label && (
        <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mb-1">{label}</span>
      )}
      {/* Up arrow */}
      <button
        onClick={() => onChange(clamp(selectedIndex - 1))}
        className="flex items-center justify-center w-full py-1 text-muted-foreground/40 hover:text-foreground/70 transition-colors"
        tabIndex={-1}
        aria-label="Previous"
      >
        <ChevronUp className="w-4 h-4" />
      </button>

      {/* Viewport — 3 rows visible, middle is selected */}
      <div className="relative w-full" style={{ height: ITEM_H * 3 }}>
        {/* Selection highlight */}
        <div
          className="absolute inset-x-0 pointer-events-none rounded-lg bg-accent/15 border border-accent/25"
          style={{ top: ITEM_H, height: ITEM_H }}
        />

        {/* Fade masks */}
        <div className="absolute inset-x-0 top-0 pointer-events-none z-10"
          style={{ height: ITEM_H, background: "linear-gradient(to bottom, var(--tw-gradient-from), transparent)" }}
        />
        <div className="absolute inset-x-0 bottom-0 pointer-events-none z-10"
          style={{ height: ITEM_H, background: "linear-gradient(to top, var(--tw-gradient-from), transparent)" }}
        />

        <div
          ref={containerRef}
          onScroll={handleScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="absolute inset-0 overflow-y-scroll no-scrollbar cursor-ns-resize"
          style={{ scrollSnapType: "y mandatory" }}
        >
          {/* padding before first item */}
          <div style={{ height: ITEM_H }} />
          {items.map((item, i) => (
            <div
              key={item}
              onClick={() => onChange(i)}
              style={{ height: ITEM_H, scrollSnapAlign: "center" }}
              className={cn(
                "flex items-center justify-center font-mono text-lg font-semibold tabular-nums transition-all cursor-pointer",
                i === selectedIndex
                  ? "text-foreground scale-110"
                  : "text-muted-foreground/40 scale-95 hover:text-muted-foreground/70"
              )}
            >
              {item}
            </div>
          ))}
          {/* padding after last item */}
          <div style={{ height: ITEM_H }} />
        </div>
      </div>

      {/* Down arrow */}
      <button
        onClick={() => onChange(clamp(selectedIndex + 1))}
        className="flex items-center justify-center w-full py-1 text-muted-foreground/40 hover:text-foreground/70 transition-colors"
        tabIndex={-1}
        aria-label="Next"
      >
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  )
}

// --- Main Component ---
export function TimeTranslator() {
  const [selectedHour, setSelectedHour] = useState<number | null>(null)
  const [liveTime, setLiveTime] = useState<{ hour: number; minute: number; second: number } | null>(null)
  const [useLive, setUseLive] = useState(true)
  const [mode, setMode] = useState<TimeMode>("24hr")
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM")

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
  const periodConfig = PERIOD_ICON_CONFIG[result.periodIcon]
  const PeriodIcon = periodConfig.icon

  // --- Wheel picker items ---
  const hours24 = Array.from({ length: 24 }, (_, i) => pad(i))     // "00"–"23"
  const hours12 = Array.from({ length: 12 }, (_, i) => pad(i + 1)) // "01"–"12"
  const ampmItems = ["AM", "PM"]

  // Convert activeHour to 12h for display
  const active12h = activeHour === 0 ? 12 : activeHour > 12 ? activeHour - 12 : activeHour
  const activeAmpm: "AM" | "PM" = activeHour < 12 ? "AM" : "PM"

  const handleHourChange24 = (idx: number) => {
    setSelectedHour(idx)
    setUseLive(false)
  }

  const handleHourChange12 = (idx: number) => {
    const h12 = idx + 1 // 1–12
    const newHour = ampm === "AM"
      ? (h12 === 12 ? 0 : h12)
      : (h12 === 12 ? 12 : h12 + 12)
    setSelectedHour(newHour)
    setUseLive(false)
  }

  const handleAmpmChange = (idx: number) => {
    const newAmpm = idx === 0 ? "AM" : "PM"
    setAmpm(newAmpm)
    const h12 = useLive ? active12h : (selectedHour === null ? 12 : active12h)
    const newHour = newAmpm === "AM"
      ? (h12 === 12 ? 0 : h12)
      : (h12 === 12 ? 12 : h12 + 12)
    setSelectedHour(newHour)
    setUseLive(false)
  }

  const handleClear = () => {
    setSelectedHour(null)
    setUseLive(true)
  }

  // Sync ampm with liveTime when in live mode
  useEffect(() => {
    if (useLive && liveTime) {
      setAmpm(liveTime.hour < 12 ? "AM" : "PM")
    }
  }, [useLive, liveTime])

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
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-5xl font-bold tracking-tight tabular-nums text-foreground">
          {pad(activeHour)}
        </span>
        <span className="text-3xl font-light text-muted-foreground mb-0.5">:</span>
        <span className="text-5xl font-bold tracking-tight tabular-nums text-foreground">00</span>
        {useLive && liveTime && (
          <>
            <span className="text-xl font-light text-muted-foreground/50 mb-0.5 ml-0.5">:</span>
            <span className="text-xl font-mono text-muted-foreground/50 tabular-nums mb-0.5">
              {pad(liveTime.second)}
            </span>
          </>
        )}
      </div>

      {/* Thai translation result */}
      <div className="bg-muted/30 border border-border/50 rounded-2xl p-4 mb-4 transition-all duration-300">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-3xl font-bold text-foreground leading-none mb-2 text-pretty">
              {result.thaiSpoken}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="text-accent-foreground font-medium">{result.periodEnglish}</span>
              {" · "}
              <span>{result.period}</span>
            </p>
          </div>
          <PeriodIcon className={cn("w-7 h-7 flex-shrink-0 mt-1", periodConfig.color)} aria-hidden />
        </div>
      </div>

      {/* Wheel Picker + controls */}
      <div className="bg-muted/20 border border-border/30 rounded-2xl p-4 mb-4"
        style={{ "--tw-gradient-from": "oklch(0.16 0.006 240)" } as React.CSSProperties}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Pick hour</span>
          <div className="flex items-center gap-0.5 rounded-lg border border-border/40 bg-muted/20 p-0.5">
            <button
              onClick={() => setMode("24hr")}
              className={cn(
                "px-2 py-1 rounded-md text-[11px] font-medium transition-all",
                mode === "24hr" ? "bg-accent/20 text-accent-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              24h
            </button>
            <button
              onClick={() => setMode("ampm")}
              className={cn(
                "px-2 py-1 rounded-md text-[11px] font-medium transition-all",
                mode === "ampm" ? "bg-accent/20 text-accent-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              AM/PM
            </button>
          </div>
          {!useLive && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Back to live time"
            >
              <X className="w-3.5 h-3.5" />
              Live
            </button>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          {mode === "24hr" ? (
            <div className="w-20">
              <WheelColumn
                items={hours24}
                selectedIndex={activeHour}
                onChange={handleHourChange24}
                label="hour"
              />
            </div>
          ) : (
            <>
              <div className="w-16">
                <WheelColumn
                  items={hours12}
                  selectedIndex={active12h - 1}
                  onChange={handleHourChange12}
                  label="hour"
                />
              </div>
              <div className="w-14">
                <WheelColumn
                  items={ampmItems}
                  selectedIndex={useLive ? (activeAmpm === "AM" ? 0 : 1) : (ampm === "AM" ? 0 : 1)}
                  onChange={handleAmpmChange}
                  label="period"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reference table */}
      <div>
        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-2">Thai Time Periods</p>
        <div className="grid grid-cols-2 gap-1.5">
          {(
            [
              { period: "เที่ยงคืน",   en: "Midnight",   time: "00:00", icon: "Moon"    },
              { period: "ตี ...",       en: "Deep Night", time: "01–05", icon: "Clock"   },
              { period: "... โมงเช้า", en: "Morning",    time: "06–11", icon: "Sun"     },
              { period: "เที่ยง",      en: "Noon",       time: "12:00", icon: "Sun"     },
              { period: "บ่าย ...",    en: "Afternoon",  time: "13–15", icon: "Cloud"   },
              { period: "... โมงเย็น", en: "Evening",    time: "16–18", icon: "Sunset"  },
              { period: "... ทุ่ม",    en: "Night",      time: "19–23", icon: "Moon"    },
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
                  className={cn("w-4 h-4 flex-shrink-0", isActive ? cfg.color : "text-muted-foreground/30")}
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
