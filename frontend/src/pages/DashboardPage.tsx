import CodeGraphFlow from "@/components/dashboard/CodeGraphFlow"
import MetricCards from "@/components/dashboard/MetricCards"
import AIReport from "@/components/dashboard/AIReport"
import { motion, AnimatePresence } from "framer-motion"
import { useProjectStore } from "@/store/projectStore"
import { ChevronUp, ChevronDown } from "lucide-react"
import React from "react"

function DashboardPage() {
  const { status } = useProjectStore()
  const [showDetails, setShowDetails] = React.useState(true)

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950">
      {/* Full-screen Graph Background */}
      <div className="absolute inset-0 z-0 flex">
        <CodeGraphFlow />
      </div>

      {/* Floating Header info */}
      <div className="absolute left-6 top-6 z-10 pointer-events-none">
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 backdrop-blur-xl"
        >
            <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-slate-400">Live Architecture Signal</span>
            </div>
        </motion.div>
      </div>

      {/* Bottom Detailed Info Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col pointer-events-none">
        <div className="mx-auto mb-2 pointer-events-auto">
            <button 
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-slate-300 hover:bg-slate-800 transition-all"
            >
                {showDetails ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                {showDetails ? "Hide Insights" : "Show Insights"}
            </button>
        </div>

        <AnimatePresence>
            {showDetails && (
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 20, stiffness: 100 }}
                    className="pointer-events-auto h-[45vh] w-full overflow-y-auto border-t border-slate-800 bg-slate-950/80 p-6 backdrop-blur-2xl shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                            <div className="lg:col-span-4">
                                <MetricCards />
                            </div>
                            <div className="lg:col-span-8">
                                <AIReport />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Loading Overlay */}
      {status === "loading" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="relative mx-auto mb-4 h-16 w-16">
                <div className="absolute inset-0 animate-spin rounded-full border-b-2 border-sky-500" />
                <div className="absolute inset-2 animate-spin rounded-full border-t-2 border-violet-500 direction-[reverse]" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-300">Synchronizing Matrix</p>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
