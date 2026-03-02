import { motion } from "framer-motion"

export function DashboardHeader() {
  return (
    <div className="absolute left-6 top-6 z-10 pointer-events-none">
      <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 backdrop-blur-xl"
      >
          <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          </div>
      </motion.div>
    </div>
  )
}
