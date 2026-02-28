import { motion, AnimatePresence } from "framer-motion"
import { Layers, FileCode2, X, GitBranch } from "lucide-react"
import type { TooltipData } from "./useCytoscape"

// ── Node Tooltip ──────────────────────────────────────────────────────────────
export function GraphTooltip({
  tip,
  onClose,
}: {
  tip: TooltipData
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      <motion.div
        key="tooltip"
        initial={{ opacity: 0, scale: 0.92, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 8 }}
        transition={{ duration: 0.15 }}
        style={{ left: tip.x + 14, top: tip.y - 10 }}
        className="pointer-events-none absolute z-50 max-w-[220px] rounded-xl border border-slate-700/80 bg-slate-900/95 p-3 shadow-2xl shadow-black/60 backdrop-blur-xl"
      >
        <div className="flex items-start gap-2">
          <div
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
            style={{
              backgroundColor: tip.color ? `${tip.color}22` : "rgba(14,165,233,0.12)",
            }}
          >
            {tip.nodeType === "folder" ? (
              <Layers className="h-3 w-3 text-sky-400" />
            ) : (
              <FileCode2
                className="h-3 w-3"
                style={{ color: tip.color || "#38bdf8" }}
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.72rem] font-bold text-slate-100">{tip.label}</p>
            {tip.nodeType === "folder" ? (
              <p className="mt-0.5 text-[0.6rem] font-medium uppercase tracking-widest text-slate-500">
                {tip.childCount ?? 0} files · click to toggle
              </p>
            ) : (
              <p
                className="mt-0.5 text-[0.6rem] font-bold uppercase tracking-widest"
                style={{ color: tip.color || "#38bdf8" }}
              >
                .{tip.ext}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── File type legend ──────────────────────────────────────────────────────────
const LEGEND_ITEMS = [
  { color: "#3b82f6", label: ".ts" },
  { color: "#06b6d4", label: ".tsx" },
  { color: "#eab308", label: ".js" },
  { color: "#22c55e", label: ".py" },
  { color: "#a855f7", label: ".css" },
]

export function GraphLegend() {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[0.65rem] font-black uppercase tracking-[0.25em] text-slate-600 mb-1">
        Legend
      </p>
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }}
          />
          <span className="text-[0.6rem] font-mono font-bold text-slate-500 tracking-wider">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Stats bar ─────────────────────────────────────────────────────────────────
export function GraphStatsBar({
  nodeCount,
  edgeCount,
  folderCount,
}: {
  nodeCount: number
  edgeCount: number
  folderCount: number
}) {
  return (
    <div className="flex items-center gap-4 rounded-full border border-slate-800/60 bg-slate-950/80 px-5 py-2 backdrop-blur-xl shadow-xl">
      <div className="flex items-center gap-1.5">
        <FileCode2 className="h-3 w-3 text-sky-500" />
        <span className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-400">
          {nodeCount} Files
        </span>
      </div>
      <div className="h-3 w-px bg-slate-800" />
      <div className="flex items-center gap-1.5">
        <GitBranch className="h-3 w-3 text-violet-500" />
        <span className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-400">
          {edgeCount} Links
        </span>
      </div>
      <div className="h-3 w-px bg-slate-800" />
      <div className="flex items-center gap-1.5">
        <Layers className="h-3 w-3 text-emerald-500" />
        <span className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-400">
          {folderCount} Folders
        </span>
      </div>
    </div>
  )
}
