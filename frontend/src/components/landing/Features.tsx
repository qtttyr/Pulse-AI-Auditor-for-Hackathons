import { Gauge, Radar, ShieldAlert, Workflow } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function Features() {
  return (
    <section className="border-t border-slate-800/80 bg-slate-950/40 py-14">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.18em] text-slate-400">
              Why judges care
              <span className="h-px w-8 bg-gradient-to-r from-slate-700 to-sky-500/70" />
            </p>
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
              From raw repositories to a verdict-ready story in minutes.
            </h2>
            <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
              Pulse compresses thousands of lines of code into a 3D map and a
              strict AI verdict, so judges and tech leads can understand real
              engineering value at a glance.
            </p>
          </div>
          <div className="text-xs text-slate-400">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
              Powered by
            </p>
            <p>OpenRouter (Trinity, Step 3.5) · Groq LLMs · Token Saver engine</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-sky-500/40 bg-slate-950/60">
            <CardHeader>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/15 text-sky-300">
                <Radar className="h-4 w-4" />
              </div>
              <CardTitle className="mt-4 text-sm text-slate-50">
                Instant repository x-ray
              </CardTitle>
              <CardDescription>
                Skip manual browsing. See architecture layers, hotspots and
                dead ends in one 3D view.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-1 text-[0.7rem] text-sky-200/80">
              Works with any Git repo. No config files or annotations required.
            </CardContent>
          </Card>
          <Card className="border-violet-500/40 bg-slate-950/60">
            <CardHeader>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
                <Gauge className="h-4 w-4" />
              </div>
              <CardTitle className="mt-4 text-sm text-slate-50">
                Verdict without fluff
              </CardTitle>
              <CardDescription>
                A strict JSON verdict with score, tech debt index, innovation
                and the single most important finding.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-1 text-[0.7rem] text-violet-200/80">
              Built to be dropped directly into judging sheets or review docs.
            </CardContent>
          </Card>
          <Card className="border-emerald-500/40 bg-slate-950/60">
            <CardHeader>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
                <Workflow className="h-4 w-4" />
              </div>
              <CardTitle className="mt-4 text-sm text-slate-50">
                Token Saver intelligence
              </CardTitle>
              <CardDescription>
                Ignores lockfiles, assets and generated dumps. Focuses LLM
                attention on core logic and entry points.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-1 text-[0.7rem] text-emerald-200/80">
              AST-light mode extracts imports and function signatures from
              heavy files.
            </CardContent>
          </Card>
          <Card className="border-amber-500/40 bg-slate-950/60">
            <CardHeader>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-300">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <CardTitle className="mt-4 text-sm text-slate-50">
                Built for time pressure
              </CardTitle>
              <CardDescription>
                Designed for hackathons, code reviews and due diligence where
                you have minutes, not days.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-1 text-[0.7rem] text-amber-200/80">
              Judges get clear priorities: where to look first, what to praise,
              what to fix.
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default Features
