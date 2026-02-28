import { motion } from "framer-motion"
import { AlertTriangle, Compass, Globe2, ScrollText, CheckCircle2 } from "lucide-react"

import { useProjectStore } from "@/store/projectStore"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function AIReport() {
  const { verdict, status } = useProjectStore()

  const isLoading = status === "loading"
  const isEmpty = !verdict && status === "idle"

  if (isEmpty) {
    return (
      <Card className="border-slate-800/60 bg-slate-950/40 backdrop-blur-xl">
        <CardHeader className="pb-3 text-center">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-100">
            AI Analysis Report
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 italic">
            Waiting for repository link to scan...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 py-8">
          <div className="flex flex-col items-center justify-center space-y-3 opacity-20">
            <ScrollText className="h-10 w-10 text-slate-400" />
            <div className="h-1.5 w-32 rounded-full bg-slate-800" />
            <div className="h-1.5 w-24 rounded-full bg-slate-800" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-800/60 bg-slate-950/40 backdrop-blur-xl overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <ScrollText className="h-24 w-24 text-slate-400" />
      </div>
      
      <CardHeader className="pb-5 relative">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <CardTitle className="text-sm font-bold tracking-widest text-slate-100 uppercase">
            AI Narrative Report
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-slate-500">
          Synthesized from structural analysis and LLM signals.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8 relative">
        <motion.div 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.1 }}
          className="grid gap-6 sm:grid-cols-2"
        >
          <div className="space-y-4">
            <div className="group">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-7 w-7 rounded-lg bg-sky-500/10 flex items-center justify-center">
                  <Globe2 className="h-4 w-4 text-sky-400" />
                </div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Architecture</span>
              </div>
              <div className="pl-9">
                {isLoading ? (
                  <Skeleton className="h-4 w-full rounded bg-slate-900" />
                ) : (
                  <p className="text-[0.85rem] leading-relaxed text-slate-400 font-medium">
                    {verdict?.architecture_type || "N/A"}
                  </p>
                )}
              </div>
            </div>

            <div className="group">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Compass className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Design Signal</span>
              </div>
              <div className="pl-9">
                {isLoading ? (
                  <Skeleton className="h-4 w-5/6 rounded bg-slate-900" />
                ) : (
                  <p className="text-[0.85rem] leading-relaxed text-slate-400 font-medium">
                    {verdict?.innovation || "N/A"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="group">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-7 w-7 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                </div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Risk Factors</span>
              </div>
              <div className="pl-9">
                {isLoading ? (
                  <Skeleton className="h-4 w-full rounded bg-slate-900" />
                ) : (
                  <p className="text-[0.85rem] leading-relaxed text-slate-400 font-medium">
                    {verdict?.tech_debt || "N/A"}
                  </p>
                )}
              </div>
            </div>

            <div className="group">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <ScrollText className="h-4 w-4 text-amber-400" />
                </div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Top Finding</span>
              </div>
              <div className="pl-9">
                {isLoading ? (
                  <Skeleton className="h-4 w-5/6 rounded bg-slate-900" />
                ) : (
                  <p className="text-[0.85rem] leading-relaxed text-slate-400 font-medium">
                    {verdict?.top_finding || "N/A"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {!isLoading && !isEmpty && verdict?.top_finding && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 mt-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-2 w-2 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
              <span className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-[0.2em]">The Verdict</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed italic">
              "{verdict.top_finding}"
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

export default AIReport
