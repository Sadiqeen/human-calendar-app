"use client"

import { MONTHS, type MonthData } from "@/lib/calendar-data"
import { cn } from "@/lib/utils"

interface MonthRowProps {
  month: MonthData
  isCurrentMonth: boolean
}

function MonthRow({ month, isCurrentMonth }: MonthRowProps) {
  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-default transition-all duration-200",
        isCurrentMonth
          ? "bg-accent/20 ring-1 ring-accent/40"
          : "hover:bg-muted/50"
      )}
    >
      {/* Month number */}
      <span className={cn(
        "w-6 text-right text-xs font-mono font-medium transition-colors",
        isCurrentMonth ? "text-accent-foreground" : "text-muted-foreground"
      )}>
        {month.number}
      </span>

      {/* Divider */}
      <span className="text-border text-xs">·</span>

      {/* Short + Full name */}
      <div className="flex items-baseline gap-1.5 min-w-0 flex-1">
        <span className={cn(
          "text-sm font-semibold tracking-wide transition-colors",
          isCurrentMonth ? "text-foreground" : "text-foreground/90"
        )}>
          {month.short}
        </span>
        <span className="text-xs text-muted-foreground hidden sm:block truncate">
          {month.full}
        </span>
      </div>

      {/* Thai name */}
      <span className={cn(
        "text-sm font-medium transition-colors",
        isCurrentMonth ? "text-foreground" : "text-foreground/80"
      )}>
        {month.thai}
      </span>

      {/* Season dot */}
      <span className="text-sm ml-1" title={month.season}>
        {month.seasonEmoji}
      </span>

      {/* Current month indicator */}
      {isCurrentMonth && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r-full" />
      )}

    </div>
  )
}

export function MonthBoard() {
  const currentMonth = new Date().getMonth() + 1

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-0.5">
          Month Mapping
        </h2>
        <p className="text-[11px] text-muted-foreground/60">Number · English · Thai</p>
      </div>

      {/* Column labels */}
      <div className="flex items-center gap-3 px-3 mb-2">
        <span className="w-6 text-right text-[10px] text-muted-foreground/40 font-mono">#</span>
        <span className="text-[10px] text-muted-foreground/40">·</span>
        <div className="flex-1 text-[10px] text-muted-foreground/40 uppercase tracking-wider">English</div>
        <div className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">ภาษาไทย</div>
        <span className="w-5" />
      </div>

      {/* Month rows */}
      <div className="flex flex-col gap-0.5 overflow-y-auto flex-1 pr-1 -mr-1">
        {MONTHS.map((month) => (
          <MonthRow
            key={month.number}
            month={month}
            isCurrentMonth={month.number === currentMonth}
          />
        ))}
      </div>
    </div>
  )
}
