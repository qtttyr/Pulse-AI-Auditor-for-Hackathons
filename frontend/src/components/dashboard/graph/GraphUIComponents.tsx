import { Layers, FileCode2, GitBranch } from "lucide-react"

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
