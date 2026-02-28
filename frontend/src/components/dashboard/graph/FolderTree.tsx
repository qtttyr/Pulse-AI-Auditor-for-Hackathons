import { ChevronDown, ChevronRight, Layers } from "lucide-react"
import type { GraphNode } from "@/store/projectStore"
import { getExtColor } from "./graphConstants"

interface FolderTreeProps {
  nodes: GraphNode[]
  collapsed: Set<string>
  onToggle: (id: string) => void
  onFocus: (id: string) => void
}

function FileItem({
  child,
  onFocus,
}: {
  child: GraphNode
  onFocus: (id: string) => void
}) {
  // @ts-expect-error - backend data mapping
  const fname = child.data?.label || child.label || child.id.split("/").pop() || ""
  const color = getExtColor(fname)
  return (
    <button
      onClick={() => onFocus(child.id)}
      className="group flex w-full items-center gap-1.5 rounded px-1.5 py-0.5 text-left transition-colors hover:bg-slate-800/60"
    >
      <div className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <span className="truncate text-[0.58rem] font-medium text-slate-600 group-hover:text-slate-300">
        {fname}
      </span>
    </button>
  )
}

function FolderItem({
  folder,
  nodes,
  collapsed,
  onToggle,
  onFocus,
}: {
  folder: GraphNode
  nodes: GraphNode[]
  collapsed: Set<string>
  onToggle: (id: string) => void
  onFocus: (id: string) => void
}) {
  const isCollapsed = collapsed.has(folder.id)
  const children = nodes.filter((n) => n.parentNode === folder.id && n.type !== "group")
  const subFolders = nodes.filter((n) => n.parentNode === folder.id && n.type === "group")
  const totalChildren = children.length + subFolders.length

  return (
    <div className="select-none">
      <button
        onClick={() => onToggle(folder.id)}
        onDoubleClick={() => onFocus(folder.id)}
        className="group flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-sky-500/10"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3 shrink-0 text-slate-600 group-hover:text-sky-400" />
        ) : (
          <ChevronDown className="h-3 w-3 shrink-0 text-sky-500" />
        )}
        <Layers className="h-3 w-3 shrink-0 text-sky-500/70" />
        <span className="truncate text-[0.65rem] font-bold uppercase tracking-widest text-slate-300 group-hover:text-sky-300">
          {/* @ts-expect-error - backend data mapping */}
          {folder.data?.label || folder.label || folder.id.split("/").pop()}
        </span>
        <span className="ml-auto shrink-0 text-[0.55rem] font-bold text-slate-600">
          {totalChildren}
        </span>
      </button>

      {!isCollapsed && (
        <div className="ml-4 border-l border-slate-800 pl-2">
          {subFolders.map((sf) => (
            <button
              key={sf.id}
              onClick={() => onFocus(sf.id)}
              className="group flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left transition-colors hover:bg-violet-500/10"
            >
              <Layers className="h-2.5 w-2.5 shrink-0 text-violet-500/60" />
              <span className="truncate text-[0.6rem] font-semibold text-slate-500 group-hover:text-violet-300">
                {/* @ts-expect-error - backend data mapping */}
                {sf.data?.label || sf.label || sf.id.split("/").pop()}
              </span>
            </button>
          ))}
          {children.slice(0, 8).map((child) => (
            <FileItem key={child.id} child={child} onFocus={onFocus} />
          ))}
          {children.length > 8 && (
            <p className="pl-2 text-[0.55rem] text-slate-700">+{children.length - 8} more</p>
          )}
        </div>
      )}
    </div>
  )
}

export function FolderTree({ nodes, collapsed, onToggle, onFocus }: FolderTreeProps) {
  const topFolders = nodes
    .filter((n) => n.type === "group" && !n.parentNode)
    .sort((a, b) => (a.id > b.id ? 1 : -1))

  return (
    <div className="flex flex-col gap-0.5 overflow-y-auto max-h-[500px] pr-1 custom-scrollbar">
      {topFolders.map((folder) => (
        <FolderItem
          key={folder.id}
          folder={folder}
          nodes={nodes}
          collapsed={collapsed}
          onToggle={onToggle}
          onFocus={onFocus}
        />
      ))}
    </div>
  )
}
