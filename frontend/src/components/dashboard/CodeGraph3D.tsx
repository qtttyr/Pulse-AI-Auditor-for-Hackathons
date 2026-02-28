import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import ForceGraph3D, {
  type ForceGraphMethods,
  type GraphData as FGGraphData,
  type NodeObject as FGNodeObject,
  type LinkObject as FGLinkObject,
} from "react-force-graph-3d"

import {
  useProjectStore,
  type GraphNode,
  type GraphLink,
} from "@/store/projectStore"

type GraphNodeObject = FGNodeObject<GraphNode>
type GraphLinkObject = FGLinkObject<GraphNode, GraphLink>
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"

function CodeGraph3D() {
  const { graph, status } = useProjectStore()
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const graphRef = React.useRef<
    ForceGraphMethods<GraphNodeObject, GraphLinkObject> | undefined
  >(undefined)
  const [dimensions, setDimensions] = React.useState<{
    width: number
    height: number
  } | null>(null)

  const isLoading = status === "loading"
  const hasGraph = !!graph && graph.nodes.length > 0

  React.useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const update = () => {
      if (!containerRef.current) {
        return
      }
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      })
    }

    update()
    window.addEventListener("resize", update)

    return () => {
      window.removeEventListener("resize", update)
    }
  }, [])

  React.useEffect(() => {
    if (!hasGraph || !graphRef.current) {
      return
    }

    graphRef.current.zoomToFit(400, 40)
  }, [hasGraph])

  return (
    <Card className="border-slate-800/60 bg-slate-950/40 backdrop-blur-xl overflow-hidden relative group">
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-sky-500/10 to-transparent" />
      
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-sm font-bold tracking-widest text-slate-100 uppercase">
            Dependency Map
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
            <span className="text-[0.65rem] text-slate-500 font-medium tracking-tight">3D Spatial Matrix</span>
          </div>
        </div>
        <div className="h-8 w-8 rounded-full border border-slate-800 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Search className="h-4 w-4 text-slate-500" />
        </div>
      </CardHeader>

      <CardContent>
        <div
          ref={containerRef}
          className="h-[420px] w-full rounded-2xl border border-slate-900/80 bg-slate-950/90 relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {!hasGraph && !isLoading && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-sky-500/10 blur-3xl rounded-full" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40">
                    <div className="grid grid-cols-2 gap-1.5 p-4">
                      <div className="h-3 w-3 rounded-sm bg-slate-700" />
                      <div className="h-3 w-3 rounded-sm bg-sky-500/40" />
                      <div className="h-3 w-3 rounded-sm bg-violet-500/40" />
                      <div className="h-3 w-3 rounded-sm bg-slate-700" />
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-slate-300 mb-2">No Analysis Running</h3>
                <p className="max-w-[280px] text-[0.75rem] leading-relaxed text-slate-500">
                  Execute project audit to generate a spatial dependency field. 
                  Node size reflects structural weight.
                </p>
              </motion.div>
            )}

            {isLoading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/50 backdrop-blur-sm"
              >
                <div className="space-y-6 text-center">
                  <div className="relative mx-auto h-24 w-24">
                    <motion.div 
                      className="absolute inset-0 rounded-full border-t-2 border-sky-500/40"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div 
                      className="absolute inset-3 rounded-full border-b-2 border-violet-500/40"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.8)]" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Scanning AST</p>
                    <p className="text-[0.65rem] text-slate-500 italic">Constructing dependency matrix...</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {hasGraph && dimensions && (
            <ForceGraph3D<GraphNode, GraphLink>
              ref={graphRef}
              width={dimensions.width}
              height={dimensions.height}
              graphData={graph as unknown as FGGraphData<GraphNode, GraphLink>}
              backgroundColor="rgba(3,7,18,1)"
              showNavInfo={false}
              nodeLabel={(node: GraphNodeObject) => node.label ?? node.id}
              nodeVal={(node: GraphNodeObject) => (node.size ?? 6) * 1.5}
              nodeColor={(node: GraphNodeObject) => {
                if (typeof node.techDebt === "number" && node.techDebt > 0) {
                  if (node.techDebt > 70) return "#f87171"
                  if (node.techDebt > 40) return "#fb923c"
                }
                const colorMap: Record<string, string> = {
                  analysis: "#38bdf8",
                  backend: "#818cf8",
                  ui: "#2dd4bf"
                }
                return colorMap[node.group ?? ""] || "#94a3b8"
              }}
              linkColor={() => "rgba(148,163,184,0.15)"}
              linkOpacity={0.3}
              linkWidth={(link: GraphLinkObject) => (link.weight ?? 1) * 0.5}
              onNodeClick={(node: GraphNodeObject) => {
                const distance = 80;
                const distRatio = 1 + distance/Math.hypot(node.x??0, node.y??0, node.z??0);
                if (graphRef.current) {
                  graphRef.current.cameraPosition(
                    { x: (node.x??0) * distRatio, y: (node.y??0) * distRatio, z: (node.z??0) * distRatio },
                    node as unknown as FGNodeObject,
                    3000
                  );
                }
              }}
            />
          )}
        </div>
      </CardContent>
      
      <div className="absolute bottom-6 left-10 flex items-center gap-6 px-4 py-2 rounded-full border border-slate-800 bg-slate-900/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-sky-400" />
          <span className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-tighter">UI Layer</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-indigo-400" />
          <span className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-tighter">Backend</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-rose-400" />
          <span className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-tighter">Debt Hotspot</span>
        </div>
      </div>
    </Card>
  )
}

export default CodeGraph3D
