import { useState } from "react"

import "./App.css"
import LandingPage from "@/pages/LandingPage"
import OnboardPage from "@/pages/OnboardPage"
import DashboardPage from "@/pages/DashboardPage"

type View = "landing" | "onboarding" | "dashboard"

function App() {
  const [view, setView] = useState<View>("landing")

  return (
    <div className="dark min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500/30">
      <div className="relative h-screen overflow-hidden flex flex-col">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.2_0.1_260/0.4),transparent_50%)]" />

        {/* ── Navbar ── */}
        <header className="relative z-20 flex h-16 w-full shrink-0 items-center justify-between border-b border-slate-800/60 bg-slate-950/20 px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 shadow-[0_0_20px_rgba(56,189,248,0.2)] overflow-hidden">
              <img src="/logo.png" alt="PULSE" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-100">PULSE</span>
              <span className="text-[0.55rem] font-bold text-slate-500">X-RAY ADVISOR</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/40 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-widest text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Pulse Engine Online
            </span>
          </div>
        </header>

        {/* ── Viewport ── */}
        <main className="relative z-10 flex-1 overflow-hidden">
          {view === "landing" && (
            <LandingPage onStartAudit={() => setView("onboarding")} />
          )}
          {view === "onboarding" && (
            <OnboardPage
              onBackToLanding={() => setView("landing")}
              onAnalysisComplete={() => setView("dashboard")}
            />
          )}
          {view === "dashboard" && <DashboardPage />}
        </main>
      </div>
    </div>
  )
}

export default App
