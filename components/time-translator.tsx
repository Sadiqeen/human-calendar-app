"use client"

import { useState, useEffect } from "react"
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
  Cloud
} from "lucide-react"
import type { PeriodIconType } from "@/lib/calendar-data"

function pad(n: number) {
  return n.toString().padStart(2, "0")
}

const QUICK_EXAMPLES = [
  { hour: 0, display: "Midnight" },
  { hour: 6, display: "6am" },
  { hour: 12, display: "Noon" },
  { hour: 13, display: "1pm" },
  { hour: 18, display: "6pm" },
  { hour: 19, display: "7pm" },
  { hour: 23, display: "11pm" },
]

const PERIOD_ICONS: Record<PeriodIconType, typeof Moon> = {
  "Moon": Moon,
  "Clock": Clock,
  "Sunrise": Sunrise,
  "Sun": Sun,
  "Cloud": Cloud,
  "Sunset": Sunset,
}

export function TimeTranslator() {
  const [selectedHour, setSelectedHour] = useState<number | null>(null)
  const [liveTime, setLiveTime] = useState<{ hour: number; minute: number; second: number } | null>(null)
  const [useLive, setUseLive] = useState(true)

  // Live clock
  useEffect(() => {
    const update = () => {
      const now = new Date()
      setLiveTime({ hour: now.getHours(), minute: now.getMinutes(), second: now.getSeconds() })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const activeHour: number | null = useLive && liveTime ? liveTime.hour : selectedHour
  const result = activeHour !== null ? translateToThaiTime(activeHour, 0) : null

  const handleHourChange = (hour: number) => {
    setSelectedHour(hour)
    setUseLive(false)
  }

  const handleQuickPick = (hour: number) => {
    setSelectedHour(hour)
    setUseLive(false)
  }

  const handleClear = () => {
    setSelectedHour(null)
    setUseLive(true)
  }

  const displayHour = activeHour !== null ? pad(activeHour) : "--"
  const displayMinute = "00"
  const displaySecond = useLive && liveTime ? pad(liveTime.second) : null

  const PeriodIcon = result ? PERIOD_ICONS[result.periodIcon] : null

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
        <span className="text-5xl font-bold tracking-tight tabular-nums text-foreground">
          {displayMinute}
        </span>
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
      {result ? (
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
            {PeriodIcon && (
              <PeriodIcon
                className="w-8 h-8 text-accent-foreground/60 flex-shrink-0 mt-1"
                aria-hidden
              />
            )}
          </div>
        </div>
      ) : (
        <div className="bg-muted/20 border border-dashed border-border/40 rounded-2xl p-5 mb-5 flex items-center justify-center">
          <p className="text-sm text-muted-foreground/50">Pick an hour to see Thai translation</p>
        </div>
      )}

      {/* Hour range slider */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
            Hour: {displayHour}
          </label>
          {!useLive && (
            <button
              onClick={handleClear}
              className="text-muted-foreground/50 hover:text-muted-foreground transition-colors p-0.5 rounded"
              aria-label="Clear — go back to live time"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <input
          type="range"
          min="0"
          max="23"
          value={selectedHour !== null ? selectedHour : (liveTime?.hour ?? 0)}
          onChange={(e) => handleHourChange(parseInt(e.target.value))}
          className={cn(
            "w-full h-2 bg-muted/50 rounded-lg appearance-none cursor-pointer",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4",
            "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-foreground [&::-webkit-slider-thumb]:cursor-pointer",
            "[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-all",
            "[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full",
            "[&::-moz-range-thumb]:bg-accent-foreground [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer",
            "[&::-moz-range-thumb]:shadow-md"
          )}
          aria-label="Select hour"
        />
        <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground/30 tabular-nums">
          <span>0</span>
          <span>6</span>
          <span>12</span>
          <span>18</span>
          <span>23</span>
        </div>
      </div>

      {/* Quick examples */}
      <div className="mb-5">
        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-2">Quick try</p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_EXAMPLES.map((ex) => (
            <button
              key={ex.hour}
              onClick={() => handleQuickPick(ex.hour)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-mono transition-all duration-150",
                selectedHour === ex.hour && !useLive
                  ? "bg-accent/20 text-accent-foreground border border-accent/40"
                  : "bg-muted/30 text-muted-foreground border border-border/40 hover:bg-muted/50 hover:text-foreground"
              )}
            >
              {pad(ex.hour)}:00
              <span className="ml-1 text-[10px] opacity-50">{ex.display}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reference table */}
      <div>
        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-2">Thai Time Periods</p>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { period: "เที่ยงคืน", en: "Midnight", time: "00:00", icon: "Moon" as PeriodIconType },
            { period: "ตี ...", en: "Deep Night", time: "01–05", icon: "Clock" as PeriodIconType },
            { period: "... โมงเช้า", en: "Morning", time: "06–11", icon: "Sun" as PeriodIconType },
            { period: "เที่ยง", en: "Noon", time: "12:00", icon: "Sun" as PeriodIconType },
            { period: "บ่าย ...", en: "Afternoon", time: "13–15", icon: "Cloud" as PeriodIconType },
            { period: "... โมงเย็น", en: "Evening", time: "16–18", icon: "Sunset" as PeriodIconType },
            { period: "... ทุ่ม", en: "Night", time: "19–23", icon: "Moon" as PeriodIconType },
          ].map((row) => {
            const IconComp = PERIOD_ICONS[row.icon]
            return (
              <div
                key={row.period}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2.5 py-2 transition-all",
                  result?.periodEnglish === row.en
                    ? "bg-accent/15 border border-accent/30"
                    : "bg-muted/20 border border-transparent"
                )}
              >
                <IconComp className="w-4 h-4 flex-shrink-0 text-muted-foreground/50" aria-hidden />
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
