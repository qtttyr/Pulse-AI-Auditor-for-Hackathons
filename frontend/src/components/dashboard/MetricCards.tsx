import { motion } from "framer-motion"
import { Gauge, Lightbulb, Zap } from "lucide-react"

import { useProjectStore } from "@/store/projectStore"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

function MetricCards() {
  const { verdict, status } = useProjectStore()

  const isLoading = status === "loading"
  const isEmpty = !verdict && status === "idle"

  if (isEmpty) {
    return (
      <Card className="border-slate-800/60 bg-slate-950/40 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-100 italic">
            Project health overview
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Metrics will appear here after analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Skeleton className="h-20 flex-1 rounded-2xl bg-slate-900/50" />
          <Skeleton className="h-20 flex-1 rounded-2xl bg-slate-900/50" />
          <Skeleton className="h-20 flex-1 rounded-2xl bg-slate-900/50" />
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
    >
      <Card className="border-slate-800/60 bg-slate-950/40 backdrop-blur-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-sky-500/20 to-transparent" />
        
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold tracking-wider text-slate-100 uppercase">
            Health Overview
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Structural signals & AI verdict
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-3">
          <motion.div variants={item} className="group relative overflow-hidden rounded-2xl border border-sky-500/20 bg-slate-900/40 p-5 transition-all hover:bg-slate-900/60">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-sky-500/5 blur-2xl group-hover:bg-sky-500/10 transition-colors" />
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500 group-hover:text-sky-400 transition-colors">Pulse Score</span>
              <Gauge className="h-4 w-4 text-sky-400" />
            </div>
            
            <div className="flex items-baseline gap-1">
              {isLoading ? (
                <Skeleton className="h-8 w-12 rounded-lg bg-slate-800" />
              ) : (
                <span className="text-3xl font-bold text-slate-50 tabular-nums leading-none">
                  {verdict?.score ?? 0}
                </span>
              )}
              <span className="text-[0.7rem] font-medium text-slate-600">/100</span>
            </div>
            
            <p className="mt-3 text-[0.65rem] leading-tight text-slate-400">
              Architecture & maintainability index.
            </p>
          </motion.div>

          <motion.div variants={item} className="group relative overflow-hidden rounded-2xl border border-violet-500/20 bg-slate-900/40 p-5 transition-all hover:bg-slate-900/60">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-violet-500/5 blur-2xl group-hover:bg-violet-500/10 transition-colors" />
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500 group-hover:text-violet-400 transition-colors">Tech Debt</span>
              <Zap className="h-4 w-4 text-violet-400" />
            </div>
            
            <div className="flex items-baseline gap-1">
              {isLoading ? (
                <Skeleton className="h-8 w-20 rounded-lg bg-slate-800" />
              ) : (
                <span className="text-lg font-bold text-slate-50 leading-none truncate max-w-full">
                  {verdict?.tech_debt ?? "Unknown"}
                </span>
              )}
            </div>
            
            <p className="mt-3 text-[0.65rem] leading-tight text-slate-400">
              Unstable APIs & hotspots.
            </p>
          </motion.div>

          <motion.div variants={item} className="group relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-slate-900/40 p-5 transition-all hover:bg-slate-900/60">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-emerald-500/5 blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500 group-hover:text-emerald-400 transition-colors">Innovation</span>
              <Lightbulb className="h-4 w-4 text-emerald-400" />
            </div>
            
            <div className="flex items-baseline gap-1">
              {isLoading ? (
                <Skeleton className="h-8 w-20 rounded-lg bg-slate-800" />
              ) : (
                <span className="text-lg font-bold text-slate-50 leading-none truncate max-w-full">
                  {verdict?.innovation ?? "Unknown"}
                </span>
              )}
            </div>
            
            <p className="mt-3 text-[0.65rem] leading-tight text-slate-400">
              Novel design & logic bets.
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default MetricCards
