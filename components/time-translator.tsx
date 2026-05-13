"use client"

import { useState, useEffect, useRef } from "react"
import { translateToThaiTime } from "@/lib/calendar-data"
import { cn } from "@/lib/utils"

function pad(n: number) {
  return n.toString().padStart(2, "0")
}

function parseTo24h(input: string): { hour: number; minute: number } | null {
  // Try HH:MM (24h)
  const match24 = input.match(/^(\d{1,2}):(\d{2})$/)
  if (match24) {
    const h = parseInt(match24[1])
    const m = parseInt(match24[2])
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) return { hour: h, minute: m }
  }

  // Try H:MM AM/PM
  const matchAmPm = input.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i)
  if (matchAmPm) {
    let h = parseInt(matchAmPm[1])
    const m = matchAmPm[2] ? parseInt(matchAmPm[2]) : 0
    const period = matchAmPm[3].toLowerCase()
    if (period === "am" && h === 12) h = 0
    if (period === "pm" && h !== 12) h += 12
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) return { hour: h, minute: m }
  }

  // Try plain number like "19" or "7"
  const matchPlain = input.match(/^(\d{1,2})$/)
  if (matchPlain) {
    const h = parseInt(matchPlain[1])
    if (h >= 0 && h <= 23) return { hour: h, minute: 0 }
  }

  return null
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
  const [input, setInput] = useState("")
  const [liveTime, setLiveTime] = useState<{ hour: number; minute: number; second: number } | null>(null)
  const [useLive, setUseLive] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

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

  // Determine what to translate
  const parsed = input.trim() ? parseTo24h(input.trim()) : null
  const activeTime = parsed ?? (useLive && liveTime ? { hour: liveTime.hour, minute: liveTime.minute } : null)
  const result = activeTime ? translateToThaiTime(activeTime.hour, activeTime.minute) : null

  const handleInput = (val: string) => {
    setInput(val)
    setUseLive(val.trim() === "")
  }

  const handleQuickPick = (val: string) => {
    setInput(val)
    setUseLive(false)
    inputRef.current?.focus()
  }

  const handleClear = () => {
    setInput("")
    setUseLive(true)
  }

  const displayHour = activeTime ? pad(activeTime.hour) : "--"
  const displayMinute = activeTime ? pad(activeTime.minute) : "--"
  const displaySecond = useLive && !input && liveTime ? pad(liveTime.second) : null

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-0.5">
          Time Translator
        </h2>
        <p className="text-[11px] text-muted-foreground/60">
          {useLive ? "Live — showing current time" : "Type any time to translate"}
        </p>
      </div>

      {/* Big live clock display */}
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
          <p className="text-sm text-muted-foreground/50">Enter a time to see Thai translation</p>
        </div>
      )}

      {/* Input */}
      <div className="relative mb-4">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="e.g. 19:00, 7pm, 13"
          className={cn(
            "w-full rounded-xl bg-muted/30 border border-border/60 px-4 py-3",
            "text-base font-mono placeholder:text-muted-foreground/40 text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50",
            "transition-all duration-150"
          )}
        />
        {input && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground text-xs px-1.5 py-0.5 rounded transition-colors"
            aria-label="Clear input"
          >
            ✕
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
                input === ex.label
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
