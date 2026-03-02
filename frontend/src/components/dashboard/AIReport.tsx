import { motion } from "framer-motion"
import { Brain, Globe2, AlertTriangle, Lightbulb, Sparkles } from "lucide-react"
import { useProjectStore } from "@/store/projectStore"

function AIReport() {
  const store = useProjectStore()
  const project = store.getActiveProject()
  const verdict = project?.verdict
  const status = project?.status ?? "idle"

  const isLoading = status === "loading"

  if (!verdict && !isLoading) return null

  const cards = [
    {
      icon: Globe2,
      label: "Architecture",
      value: verdict?.architecture_type,
      color: "sky",
      gradient: "from-sky-500/20 to-sky-500/5",
      border: "border-sky-500/30",
      iconBg: "bg-sky-500/10",
      iconColor: "text-sky-400",
    },
    {
      icon: Lightbulb,
      label: "Innovation",
      value: verdict?.innovation,
      color: "emerald",
      gradient: "from-emerald-500/20 to-emerald-500/5",
      border: "border-emerald-500/30",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
    },
    {
      icon: AlertTriangle,
      label: "Tech Debt",
      value: verdict?.tech_debt,
      color: "violet",
      gradient: "from-violet-500/20 to-violet-500/5",
      border: "border-violet-500/30",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-400",
    },
  ]

  return (
    <div className="space-y-5">
      {/* ── Score Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl border border-sky-500/20 bg-linear-to-br from-sky-500/10 via-slate-900/60 to-slate-900/40 p-6 backdrop-blur-xl"
      >
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-px w-full bg-linear-to-r from-transparent via-sky-500/40 to-transparent" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/20 shadow-[0_0_30px_rgba(56,189,248,0.15)]">
              <Brain className="h-7 w-7 text-sky-400" />
            </div>
            <div>
              <h3 className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-sky-400/80 mb-1">
                Pulse Score
              </h3>
              {isLoading ? (
                <div className="h-10 w-20 rounded-lg bg-slate-800/60 animate-pulse" />
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white tabular-nums leading-none">
                    {verdict?.score ?? 0}
                  </span>
                  <span className="text-sm font-bold text-slate-500">/100</span>
                </div>
              )}
            </div>
          </div>

          {!isLoading && verdict?.top_finding && (
            <div className="max-w-xs hidden lg:block">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-3 w-3 text-sky-400" />
                <span className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-sky-400/60">Top Finding</span>
              </div>
              <p className="text-[0.75rem] leading-relaxed text-slate-300 italic line-clamp-2">
                "{verdict.top_finding}"
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Metric Cards Row ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className={`group relative overflow-hidden rounded-xl border ${card.border} bg-linear-to-br ${card.gradient} p-4 backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-lg cursor-default`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.iconBg}`}>
                <card.icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
              <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-300 transition-colors">
                {card.label}
              </span>
            </div>
            {isLoading ? (
              <div className="h-5 w-3/4 rounded bg-slate-800/60 animate-pulse" />
            ) : (
              <p className="text-[0.82rem] font-bold text-white leading-snug truncate">
                {card.value || "N/A"}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* ── Top Finding (mobile / expanded) ── */}
      {!isLoading && verdict?.top_finding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-4 lg:hidden"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-sky-400" />
            <span className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-sky-400/60">The Verdict</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed italic">
            "{verdict.top_finding}"
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default AIReport
