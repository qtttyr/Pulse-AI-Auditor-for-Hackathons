import { memo } from "react"
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react"
import { FileCode2, FolderOpen, ChevronRight } from "lucide-react"

// ── File Node (Clean Reference Style) ──────────────────────────────────────────
export const FileNode = memo(({ data, selected }: NodeProps<Node<{ label: string; color: string; ext: string }>>) => {
  return (
    <div className={`
      relative px-4 py-2.5 min-w-[140px]
      bg-white border-2 rounded-xl shadow-sm
      transition-all duration-300 group
      ${selected ? 'border-sky-500 ring-4 ring-sky-500/10 scale-105' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}
    `}>
      {/* Connector line for the tree look */}
      <div className="absolute -left-[20px] top-1/2 h-[2px] w-[20px] bg-slate-200 group-hover:bg-slate-300" />
      
      <div className="flex items-center gap-3">
        <div 
          className="flex h-8 w-8 items-center justify-center rounded-lg shadow-inner"
          style={{ backgroundColor: `${data.color}15`, color: data.color }}
        >
          <FileCode2 className="h-4 w-4" />
        </div>
        
        <div className="flex flex-col">
          <span className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-0.5">
            {data.ext || 'FILE'}
          </span>
          <span className="text-[0.8rem] font-bold text-slate-700 truncate max-w-[120px]">
            {data.label}
          </span>
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="opacity-0!" />
      <Handle type="source" position={Position.Right} className="opacity-0!" />
    </div>
  )
})

// ── Folder Node (Clean Reference Style) ────────────────────────────────────────
export const FolderNode = memo(({ data, selected }: NodeProps<Node<{ 
  label: string; 
  isExpanded: boolean; 
  childCount: number; 
  onToggle: () => void 
}>>) => {
  return (
    <div 
      onClick={(e) => { e.stopPropagation(); data.onToggle(); }}
      className={`
        relative px-5 py-3 min-w-[180px] cursor-pointer
        bg-white border-2 rounded-2xl shadow-sm
        transition-all duration-300 group
        ${selected ? 'border-sky-500 ring-4 ring-sky-500/10' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-500 transition-colors">
            {data.isExpanded ? <FolderOpen className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </div>
          
          <div className="flex flex-col">
            <span className="text-[0.6rem] font-black text-slate-300 uppercase tracking-[0.2em] leading-none mb-1">
              {data.isExpanded ? 'MODULE EXPLORER' : 'PACKAGE'}
            </span>
            <span className="text-[0.9rem] font-black text-slate-800 tracking-tight">
              {data.label}
            </span>
          </div>
        </div>

        <div className="flex items-center ml-4 px-2 py-1 rounded-full bg-slate-50 border border-slate-100 group-hover:bg-sky-50 group-hover:border-sky-100 transition-colors">
          <span className="text-[0.65rem] font-bold text-slate-400 group-hover:text-sky-600">
            {data.childCount}
          </span>
        </div>
      </div>

      {/* Connection Indicator */}
      {data.isExpanded && (
        <div className="absolute -right-[15px] top-1/2 h-[2px] w-[15px] bg-slate-200" />
      )}

      <Handle type="target" position={Position.Left} className="opacity-0!" />
      <Handle type="source" position={Position.Right} className="opacity-0!" />
    </div>
  )
})
