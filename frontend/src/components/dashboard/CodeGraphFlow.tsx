import { useMemo, useEffect, useState, useCallback } from "react"
import { 
  ReactFlow,
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState, 
  type Node, 
  type Edge, 
  type EdgeProps, 
  BaseEdge, 
  getBezierPath, 
  ConnectionLineType,
  MarkerType,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { useProjectStore } from "@/store/projectStore"
import { getExtColor, getExt } from "./graph/graphConstants"
import { getLayoutedElements } from "./graph/flowLayout"
import { FileNode, FolderNode } from "./graph/FlowNodes"
import { FolderTree } from "./graph/FolderTree"
import { GraphLegend, GraphStatsBar } from "./graph/GraphUIComponents"
import { motion } from "framer-motion"
import { FileCode2, LayoutDashboard } from "lucide-react"

// ── Custom Edge ─────────────────────────────────────────────────────────────
const CustomEdge = ({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd }: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, stroke: "rgba(56, 189, 248, 0.45)", strokeWidth: 1.5 }} />
      <BaseEdge 
        path={edgePath} 
        style={{ 
          ...style, 
          stroke: "rgba(56, 189, 248, 0.2)", 
          strokeWidth: 4, 
          filter: "blur(4px)" 
        }} 
      />
    </>
  )
}

const nodeTypes = {
  file: FileNode,
  folder: FolderNode,
}

const edgeTypes = {
  custom: CustomEdge,
}

function CodeGraphFlow() {
  const { graph } = useProjectStore()
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  // ── Toggle Logic ──────────────────────────────────────────────────────────
  const toggleFolder = useCallback((id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // ── Prepare React Flow Elements ─────────────────────────────────────────────
  const initialElements = useMemo(() => {
    if (!graph) return { nodes: [], edges: [] }

    const visibleNodeIds = new Set<string>()
    const nodesInStore = graph.nodes
    const edgesInStore = graph.edges

    // 1. Identify which folder/nodes are visible
    // A node is visible if:
    // - It has no parent
    // - OR its parent is both visible AND expanded
    
    // Sort nodes to process top-down (folders without parentNode first)
    const sortedNodes = [...nodesInStore].sort((a,b) => {
      if (!a.parentNode && b.parentNode) return -1
      if (a.parentNode && !b.parentNode) return 1
      return 0
    })

    const rfNodes: Node[] = []
    
    sortedNodes.forEach((n) => {
      const isFolder = n.type === "group"
      
      // Top-level folders are always visible
      let isVisible = !n.parentNode
      
      // If it has a parent, check if parent is visible AND expanded
      if (n.parentNode) {
         isVisible = visibleNodeIds.has(n.parentNode) && expandedFolders.has(n.parentNode)
      }

      if (isVisible) {
        visibleNodeIds.add(n.id)
        
        // @ts-expect-error - backend data mapping
        const label = n.data?.label || n.label || n.id.split("/").pop() || ""
        const color = isFolder ? "transparent" : getExtColor(label)
        const ext = isFolder ? "" : getExt(label)
        
        const childCount = nodesInStore.filter(node => node.parentNode === n.id).length

        rfNodes.push({
          id: n.id,
          type: isFolder ? "folder" : "file",
          data: { 
            label, 
            color, 
            ext, 
            isExpanded: expandedFolders.has(n.id),
            childCount,
            onToggle: () => toggleFolder(n.id)
          },
          position: { x: 0, y: 0 }, // Dagre will override this
        })
      }
    })

    // 2. Filter edges to only connect visible nodes
    const rfEdges: Edge[] = edgesInStore
      .filter(e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target))
      .map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: "custom",
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: "#38bdf8" },
      }))

    return getLayoutedElements(rfNodes, rfEdges)
  }, [graph, expandedFolders, toggleFolder])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialElements.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialElements.edges)

  // Sync elements when graph or state changes
  useEffect(() => {
    setNodes(initialElements.nodes)
    setEdges(initialElements.edges)
  }, [initialElements, setNodes, setEdges])

  const stats = {
    nodes: nodes.filter(n => n.type === "file").length,
    edges: edges.length,
    folders: nodes.filter(n => n.type === "folder").length
  }

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[#020617] selection:bg-sky-500/30">
      {/* ── Sidebar: Folders & Controls ── */}
      <aside className="relative z-20 flex w-72 shrink-0 flex-col border-r border-slate-800/40 bg-[#020617]/95 backdrop-blur-3xl shadow-2xl">
        <div className="flex flex-1 flex-col p-6 overflow-hidden">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4 text-sky-500" />
                <h3 className="text-[0.65rem] font-black uppercase tracking-[0.25em] text-slate-100">
                    Radar Explorer
                </h3>
            </div>
          </div>

          <div className="flex-1 overflow-hidden custom-scrollbar">
            {graph && (
              <FolderTree
                nodes={graph.nodes}
                collapsed={new Set()}
                onToggle={toggleFolder} 
                onFocus={() => {}}
              />
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800/40">
            <GraphLegend />
          </div>
        </div>
      </aside>

      {/* ── Main Canvas (React Flow) ── */}
      <main className="relative flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes as any}
          connectionLineType={ConnectionLineType.Bezier}
          fitView
          colorMode="dark"
          minZoom={0.05}
          maxZoom={1.5}
        >
          <Background color="#1e293b" gap={60} size={1} />
          <Controls className="bg-slate-950! border-slate-800! fill-slate-400! [&_button]:border-slate-800! hover:[&_button]:bg-slate-900! rounded-xl!" />
        </ReactFlow>

        {/* Ambient Overlay Effects */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.03)_0%,transparent_70%)]" />

        {/* HUD: Stats */}
        {nodes.length > 0 && (
          <div className="absolute bottom-10 left-1/2 z-30 -translate-x-1/2 pointer-events-none">
            <div className="pointer-events-auto">
              <GraphStatsBar
                nodeCount={stats.nodes}
                edgeCount={stats.edges}
                folderCount={stats.folders}
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-10 z-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center rounded-3xl border border-dashed border-slate-800 bg-slate-950/20 p-12 backdrop-blur-xl"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-slate-900/40 text-sky-500/30 border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <FileCode2 className="h-10 w-10" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-[0.4em] text-slate-100 mb-2 leading-none">
                  Awaiting Architecture
              </h2>
              <p className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-500 italic opacity-80">
                Synchronizing with Remote Repository Pulse
              </p>
            </motion.div>
          </div>
        )}

        {/* Info HUD */}
        <div className="absolute top-6 right-6 z-30 pointer-events-auto">
            <div className="flex h-10 items-center gap-3 rounded-2xl border border-slate-800/60 bg-slate-950/80 px-4 backdrop-blur-xl shadow-xl">
                 <div className="flex h-2 w-2 items-center justify-center">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                 </div>
                 <span className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">
                     Dagre Engine Active
                 </span>
            </div>
        </div>
      </main>
    </div>
  )
}

export default CodeGraphFlow
