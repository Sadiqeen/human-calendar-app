"use client"

import { useState, useEffect } from "react"
import { translateToThaiTime } from "@/lib/calendar-data"
import { cn } from "@/lib/utils"
import { Clock, Radio, RotateCcw, Moon, Sunrise, Sun, Sunset, Cloud } from "lucide-react"
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

// Format a 24h hour as 12h string
function formatHour(hour: number, mode: TimeMode): string {
  if (mode === "24hr") return pad(hour)
  const h12 = hour % 12 || 12
  const period = hour < 12 ? "AM" : "PM"
  return `${h12}${period}`
}

// Period background tint per time-of-day block
function periodTint(hour: number): string {
  if (hour === 0)              return "bg-indigo-500/10 border-indigo-500/20"
  if (hour >= 1 && hour <= 5) return "bg-blue-500/10 border-blue-500/20"
  if (hour >= 6 && hour <= 11) return "bg-orange-400/10 border-orange-400/20"
  if (hour === 12)             return "bg-yellow-400/10 border-yellow-400/20"
  if (hour >= 13 && hour <= 15) return "bg-yellow-300/10 border-yellow-300/20"
  if (hour >= 16 && hour <= 18) return "bg-rose-400/10 border-rose-400/20"
  return "bg-indigo-600/10 border-indigo-600/20"
}

export function TimeTranslator() {
  const [selectedHour, setSelectedHour] = useState<number | null>(null)
  const [liveTime, setLiveTime] = useState<{ hour: number; minute: number; second: number } | null>(null)
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

  const isLive = selectedHour === null
  const activeHour = isLive ? (liveTime?.hour ?? 0) : selectedHour
  const result = translateToThaiTime(activeHour, 0)
  const periodConfig = PERIOD_ICON_CONFIG[result.periodIcon]
  const PeriodIcon = periodConfig.icon

  const handleReset = () => setSelectedHour(null)

  // 24 hours in a 6x4 grid
  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-0.5">
            Time Translator
          </h2>
          <p className="text-[11px] text-muted-foreground/60 flex items-center gap-1">
            {isLive ? (
              <>
                <Radio className="w-2.5 h-2.5 text-accent-foreground" aria-hidden />
                Live — current time
              </>
            ) : (
              "Custom hour selected"
            )}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-0.5 rounded-lg border border-border/40 bg-muted/20 p-0.5">
          {(["24hr", "ampm"] as TimeMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all",
                mode === m
                  ? "bg-accent/20 text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m === "24hr" ? "24h" : "AM/PM"}
            </button>
          ))}
        </div>
      </div>

      {/* Big clock display */}
      <div className="flex items-baseline gap-1">
        <span className="text-5xl font-bold tracking-tight tabular-nums text-foreground">
          {pad(activeHour)}
        </span>
        <span className="text-3xl font-light text-muted-foreground/50 mb-0.5">:</span>
        <span className="text-5xl font-bold tracking-tight tabular-nums text-foreground">00</span>
        {isLive && liveTime && (
          <>
            <span className="text-xl font-light text-muted-foreground/40 mb-0.5 ml-0.5">:</span>
            <span className="text-xl font-mono text-muted-foreground/40 tabular-nums mb-0.5">
              {pad(liveTime.second)}
            </span>
          </>
        )}
      </div>

      {/* Thai translation result */}
      <div className="bg-muted/30 border border-border/50 rounded-2xl p-4 transition-all duration-300">
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
          <PeriodIcon
            className={cn("w-7 h-7 flex-shrink-0 mt-1", periodConfig.color)}
            aria-hidden
          />
        </div>
      </div>

      {/* Hour grid table */}
      <div className="bg-muted/20 border border-border/30 rounded-2xl p-3">
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
            Pick hour
          </span>
          <button
            onClick={handleReset}
            disabled={isLive}
            className={cn(
              "flex items-center gap-1 text-[11px] rounded-md px-2 py-1 transition-all font-medium",
              isLive
                ? "text-muted-foreground/30 cursor-default"
                : "text-accent-foreground bg-accent/15 hover:bg-accent/25"
            )}
            aria-label="Reset to current time"
          >
            <RotateCcw className="w-3 h-3" />
            Now
          </button>
        </div>

        {/* 6 columns × 4 rows */}
        <div className="grid grid-cols-6 gap-1.5">
          {hours.map((h) => {
            const isSelected = h === activeHour
            const isCurrentLive = isLive && h === (liveTime?.hour ?? -1)
            return (
              <button
                key={h}
                onClick={() => setSelectedHour(h)}
                aria-label={`Select ${formatHour(h, mode)}`}
                aria-pressed={isSelected}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-xl py-2 px-1 border transition-all duration-150 text-center",
                  isSelected
                    ? cn("border-accent/60 bg-accent/20 text-accent-foreground shadow-sm scale-105", periodTint(h))
                    : cn(
                        "border-transparent text-muted-foreground hover:border-border/50 hover:text-foreground hover:bg-muted/40",
                        periodTint(h)
                      )
                )}
              >
                <span className={cn(
                  "text-sm font-semibold tabular-nums leading-none",
                  isSelected ? "text-foreground" : ""
                )}>
                  {formatHour(h, mode)}
                </span>
                {/* Live pulse dot */}
                {isCurrentLive && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-accent-foreground animate-pulse" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Reference table */}
      <div>
        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-2">
          Thai Time Periods
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {(
            [
              { period: "เที่ยงคืน",    en: "Midnight",   time: "00:00", icon: "Moon"    },
              { period: "ตี ...",        en: "Deep Night", time: "01–05", icon: "Clock"   },
              { period: "... โมงเช้า",  en: "Morning",    time: "06–11", icon: "Sun"     },
              { period: "เที่ยง",       en: "Noon",       time: "12:00", icon: "Sun"     },
              { period: "บ่าย ...",     en: "Afternoon",  time: "13–15", icon: "Cloud"   },
              { period: "... โมงเย็น",  en: "Evening",    time: "16–18", icon: "Sunset"  },
              { period: "... ทุ่ม",     en: "Night",      time: "19–23", icon: "Moon"    },
            ] as Array<{ period: string; en: string; time: string; icon: PeriodIconType }>
          ).map((row) => {
            const cfg = PERIOD_ICON_CONFIG[row.icon]
            const IconComp = cfg.icon
            const isActive = result.periodEnglish === row.en
            return (
              <div
                key={row.period}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2.5 py-2 transition-all border",
                  isActive
                    ? "bg-accent/15 border-accent/30"
                    : "bg-muted/20 border-transparent"
                )}
              >
                <IconComp
                  className={cn(
                    "w-4 h-4 flex-shrink-0",
                    isActive ? cfg.color : "text-muted-foreground/30"
                  )}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-foreground/80 leading-none truncate">
                    {row.period}
                  </p>
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                    {row.time} · {row.en}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
