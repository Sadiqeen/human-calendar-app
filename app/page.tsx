import { MonthBoard } from "@/components/month-board"
import { TimeTranslator } from "@/components/time-translator"

export default function HumanCalendarPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/30">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-accent/30 flex items-center justify-center">
            <span className="text-xs" aria-hidden>📅</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">Human Calendar</span>
        </div>
        <p className="text-[11px] text-muted-foreground/50 hidden sm:block">
          Low-effort month &amp; time reference
        </p>
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
