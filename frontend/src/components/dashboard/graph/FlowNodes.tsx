import { memo } from "react"
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react"
import { FileCode2, Layers, ChevronDown, ChevronRight } from "lucide-react"

// ── File Node (Individual File) ──────────────────────────────────────────────
export const FileNode = memo(({ data }: NodeProps<Node<{ label: string; color: string; ext: string }>>) => {
  return (
    <div className="relative group min-w-[200px] rounded-2xl border border-sky-500/20 bg-slate-950/90 p-4 shadow-2xl transition-all hover:scale-105 hover:border-sky-500/50 hover:shadow-[0_0_20px_rgba(56,189,248,0.25)]">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 rounded-2xl bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.06)_0%,transparent_100%)]" />
      
      <div className="flex items-center gap-3">
        <div 
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-inner transition-transform group-hover:rotate-12"
          style={{ backgroundColor: `${data.color}20`, border: `1px solid ${data.color}40` }}
        >
          <FileCode2 className="h-5 w-5" style={{ color: data.color }} />
        </div>
        
        <div className="flex flex-col overflow-hidden leading-tight">
          <span className="truncate text-[0.75rem] font-black uppercase tracking-widest text-slate-100">
            {data.label}
          </span>
          <span className="text-[0.6rem] font-bold tracking-[0.25em] text-slate-500 uppercase">
            {data.ext || "file"}
          </span>
        </div>
      </div>

      {/* Connection Handles */}
      <Handle type="target" position={Position.Top} className="h-2! w-2! border-slate-800! bg-sky-500!" />
      <Handle type="source" position={Position.Bottom} className="h-2! w-2! border-slate-800! bg-sky-500!" />
    </div>
  )
})

// ── Folder Node (Grouping) ──────────────────────────────────────────────────
export const FolderNode = memo(({ data }: NodeProps<Node<{ label: string; isExpanded: boolean; childCount: number; onToggle: () => void }>>) => {
  return (
    <div 
      className={`relative min-w-[260px] rounded-3xl border-2 transition-all duration-300 shadow-2xl
        ${data.isExpanded 
          ? "border-sky-500/40 bg-slate-900/10 backdrop-blur-md min-h-[160px]" 
          : "border-slate-800 bg-slate-950/90 hover:border-sky-500/40 hover:bg-slate-900 group"
        }`}
    >
      <div className={`flex flex-col p-6 h-full ${!data.isExpanded ? "cursor-pointer" : ""}`} onClick={() => !data.isExpanded && data.onToggle()}>
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-xl transition-colors ${data.isExpanded ? "bg-sky-500/20 text-sky-400" : "bg-slate-800 text-slate-500 group-hover:bg-sky-500/10 group-hover:text-sky-400"}`}>
            <Layers className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[0.8rem] font-black uppercase tracking-[0.2em] text-slate-100 leading-none mb-1">
                {data.label}
            </span>
            <span className="text-[0.6rem] font-bold text-slate-500 tracking-widest uppercase">
                {data.childCount} Object{data.childCount !== 1 ? 's' : ''}
            </span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); data.onToggle(); }}
            className="ml-auto p-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 hover:text-sky-400 transition-all shadow-lg"
          >
            {data.isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
        
        {!data.isExpanded && (
          <div className="mt-2 text-[0.55rem] font-bold text-slate-600 uppercase tracking-[0.2em]">
            Click to expand architecture
          </div>
        )}
      </div>

      {/* Invisible handles for routing */}
      <Handle type="target" position={Position.Top} className="opacity-0!" />
      <Handle type="source" position={Position.Bottom} className="opacity-0!" />
    </div>
  )
})

FileNode.displayName = "FileNode"
FolderNode.displayName = "FolderNode"
