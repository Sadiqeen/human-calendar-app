"use client"

import { useState, useEffect } from "react"
import { translateToThaiTime } from "@/lib/calendar-data"
import { cn } from "@/lib/utils"
import { Clock, X, Radio } from "lucide-react"

function pad(n: number) {
  return n.toString().padStart(2, "0")
}

const QUICK_EXAMPLES = [
  { label: "00:00", display: "Midnight" },
  { label: "06:00", display: "6am" },
  { label: "12:00", display: "Noon" },
  { label: "13:00", display: "1pm" },
  { label: "18:00", display: "6pm" },
  { label: "19:00", display: "7pm" },
  { label: "23:00", display: "11pm" },
]

export function TimeTranslator() {
  const [pickerValue, setPickerValue] = useState("") // "HH:MM" from <input type="time">
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

  // Sync picker to live when live mode first activates
  useEffect(() => {
    if (useLive && liveTime) {
      setPickerValue(`${pad(liveTime.hour)}:${pad(liveTime.minute)}`)
    }
  }, [useLive, liveTime?.hour, liveTime?.minute])

  const activeTime: { hour: number; minute: number } | null = useLive && liveTime
    ? { hour: liveTime.hour, minute: liveTime.minute }
    : pickerValue
    ? { hour: parseInt(pickerValue.split(":")[0]), minute: parseInt(pickerValue.split(":")[1]) }
    : null

  const result = activeTime ? translateToThaiTime(activeTime.hour, activeTime.minute) : null

  const handlePickerChange = (val: string) => {
    setPickerValue(val)
    setUseLive(false)
  }

  const handleQuickPick = (val: string) => {
    setPickerValue(val)
    setUseLive(false)
  }

  const handleClear = () => {
    setPickerValue("")
    setUseLive(true)
  }

  const displayHour = activeTime ? pad(activeTime.hour) : "--"
  const displayMinute = activeTime ? pad(activeTime.minute) : "--"
  const displaySecond = useLive && liveTime ? pad(liveTime.second) : null

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
            "Custom time selected"
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
            <span className="text-4xl leading-none mt-1 select-none" aria-hidden>
              {result.periodIcon}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-muted/20 border border-dashed border-border/40 rounded-2xl p-5 mb-5 flex items-center justify-center">
          <p className="text-sm text-muted-foreground/50">Pick a time to see Thai translation</p>
        </div>
      )}

      {/* Time picker */}
      <div className="relative mb-4">
        <Clock
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none"
          aria-hidden
        />
        <input
          type="time"
          value={pickerValue}
          onChange={(e) => handlePickerChange(e.target.value)}
          className={cn(
            "w-full rounded-xl bg-muted/30 border border-border/60 pl-10 pr-10 py-3",
            "text-base font-mono text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50",
            "transition-all duration-150",
            "[color-scheme:dark]",
            "[&::-webkit-calendar-picker-indicator]:opacity-0",
            "[&::-webkit-calendar-picker-indicator]:absolute"
          )}
          aria-label="Select time"
        />
        {!useLive && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors p-0.5 rounded"
            aria-label="Clear — go back to live time"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quick examples */}
      <div className="mb-5">
        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-2">Quick try</p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => handleQuickPick(ex.label)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-mono transition-all duration-150",
                pickerValue === ex.label && !useLive
                  ? "bg-accent/20 text-accent-foreground border border-accent/40"
                  : "bg-muted/30 text-muted-foreground border border-border/40 hover:bg-muted/50 hover:text-foreground"
              )}
            >
              {ex.label}
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
            { period: "เที่ยงคืน", en: "Midnight", time: "00:00", icon: "🌑" },
            { period: "ตี ...", en: "Deep Night", time: "01–05", icon: "🌙" },
            { period: "... โมงเช้า", en: "Morning", time: "06–11", icon: "☀️" },
            { period: "เที่ยง", en: "Noon", time: "12:00", icon: "🌞" },
            { period: "บ่าย ...", en: "Afternoon", time: "13–15", icon: "🌤️" },
            { period: "... โมงเย็น", en: "Evening", time: "16–18", icon: "🌇" },
            { period: "... ทุ่ม", en: "Night", time: "19–23", icon: "🌃" },
          ].map((row) => (
            <div
              key={row.period}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2.5 py-2 transition-all",
                result?.periodEnglish === row.en
                  ? "bg-accent/15 border border-accent/30"
                  : "bg-muted/20 border border-transparent"
              )}
            >
              <span className="text-sm" aria-hidden>{row.icon}</span>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-foreground/80 leading-none truncate">{row.period}</p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">{row.time} · {row.en}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
