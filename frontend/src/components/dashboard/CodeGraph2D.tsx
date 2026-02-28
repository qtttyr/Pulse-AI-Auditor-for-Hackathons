import { useMemo, useState, useCallback, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from "reactflow";
import type { NodeProps, Connection } from "reactflow";
import "reactflow/dist/style.css";
import { motion } from "framer-motion";
import { 
  Folder, 
  Layers, 
  FileCode, 
} from "lucide-react";

import { useProjectStore } from "@/store/projectStore";

// Custom Node for Folders (Clusters)
const FolderNode = ({ data }: NodeProps) => {
  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        data.toggle?.();
      }}
      className={`relative group p-6 rounded-3xl border transition-all cursor-pointer min-w-[250px] min-h-[180px]
      ${data.isExpanded 
        ? 'border-sky-500/40 bg-sky-500/5 backdrop-blur-md shadow-2xl shadow-sky-500/5' 
        : 'border-sky-500/80 bg-sky-500/20 shadow-[0_0_30px_rgba(56,189,248,0.15)] hover:border-sky-400'}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <Folder className={`h-5 w-5 ${data.isExpanded ? 'text-sky-400' : 'text-sky-300'}`} />
        <span className="text-[0.75rem] font-black uppercase tracking-[0.15em] text-slate-100">{data.label}</span>
      </div>
      
      <div className="absolute top-6 right-6 text-[0.55rem] font-bold text-slate-500 tracking-widest uppercase opacity-40 group-hover:opacity-100 transition-opacity">
        {data.isExpanded ? 'Collapse' : 'Expand'}
      </div>

      {!data.isExpanded && (
        <div className="mt-8 flex flex-wrap gap-1.5 opacity-50">
            <div className="h-2 w-12 rounded-full bg-sky-500/40" />
            <div className="h-2 w-8 rounded-full bg-sky-500/40" />
            <div className="h-2 w-16 rounded-full bg-sky-500/40" />
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  group: FolderNode,
};

const rfStyle = {
  backgroundColor: "transparent",
};

function CodeGraph2D() {
  const { graph } = useProjectStore();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  
  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  }, []);

  const initialNodes = useMemo(() => {
    if (!graph) return [];
    
    // Sort so groups are rendered behind files
    const sortedNodes = [...graph.nodes].sort((a, b) => {
      if (a.type === 'group' && b.type !== 'group') return -1;
      if (a.type !== 'group' && b.type === 'group') return 1;
      return 0;
    });

    return sortedNodes.map((n) => {
      const isVisible = !n.parentNode || expandedFolders.has(n.parentNode);
      
      return {
        id: n.id,
        type: n.type || 'default',
        data: { 
          label: n.label || n.id,
          isExpanded: expandedFolders.has(n.id),
          toggle: () => toggleFolder(n.id)
        },
        position: n.position || { x: 0, y: 0 },
        parentNode: n.parentNode,
        hidden: !isVisible,
        zIndex: n.type === 'group' ? 1 : 10,
        style: n.type === 'group' ? {
            ...n.style,
            backgroundColor: expandedFolders.has(n.id) ? 'rgba(56, 189, 248, 0.05)' : 'rgba(56, 189, 248, 0.15)',
            border: expandedFolders.has(n.id) ? '1px dashed rgba(56, 189, 248, 0.3)' : '2px solid rgba(56, 189, 248, 0.6)',
        } : {
            ...n.style,
        }
      };
    });
  }, [graph, expandedFolders, toggleFolder]);

  const initialEdges = useMemo(() => {
    if (!graph) return [];
    return graph.edges.map(e => {
        const sourceNode = graph.nodes.find(n => n.id === e.source);
        const targetNode = graph.nodes.find(n => n.id === e.target);
        
        const isVisible = (!sourceNode?.parentNode || expandedFolders.has(sourceNode.parentNode)) &&
                          (!targetNode?.parentNode || expandedFolders.has(targetNode.parentNode));

        const style: Record<string, unknown> = { stroke: '#38bdf8', strokeWidth: 1.5, opacity: 0.5, ...(e.style as Record<string, unknown> ?? {}) };
        const markerColor = typeof style.stroke === 'string' ? style.stroke : '#38bdf8';
        return {
            id: e.id,
            source: e.source,
            target: e.target,
            animated: true,
            hidden: !isVisible,
            style,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: markerColor,
            },
        };
    });
  }, [graph, expandedFolders]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className="w-full h-full relative group">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        style={rfStyle}
        fitView
      >
        <Background color="#0f172a" gap={30} size={1} />
        <Controls showInteractive={false} className="bg-slate-900 border-slate-800 fill-slate-400" />
        <MiniMap 
            nodeColor={(n) => n.type === 'group' ? 'rgba(56,189,248,0.1)' : '#38bdf8'}
            maskColor="rgba(3, 7, 18, 0.8)"
            className="bg-slate-900 border-slate-800"
        />
        
        <Panel position="top-left">
          <div className="flex flex-col gap-3">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 backdrop-blur-xl shadow-2xl"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-100">X-Ray Engine</h3>
                <p className="text-[0.65rem] text-slate-500 font-bold tracking-tight">Recursive Architecture Mapping</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-2 px-1">
                <div className={`h-2 w-2 rounded-full ${expandedFolders.size > 0 ? 'bg-sky-400 shadow-[0_0_12px_#38bdf8]' : 'bg-slate-700'}`} />
                <span className="text-[0.65rem] font-black uppercase tracking-widest text-slate-500">
                    {expandedFolders.size > 0 ? `${expandedFolders.size} nodes active` : 'Holistic Overview'}
                </span>
            </div>
          </div>
        </Panel>

        <Panel position="top-right">
            <div className="flex gap-2">
                <button 
                    onClick={() => {
                        if (expandedFolders.size > 0) setExpandedFolders(new Set());
                        else {
                            const allGroups = graph?.nodes.filter(n => n.type === 'group').map(n => n.id) || [];
                            setExpandedFolders(new Set(allGroups));
                        }
                    }}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-2 text-[0.65rem] font-black uppercase tracking-widest transition-all duration-300
                    ${expandedFolders.size > 0 ? 'border-sky-500 bg-sky-500/10 text-sky-400 shadow-lg shadow-sky-500/5' : 'border-slate-800 bg-slate-950/80 text-slate-500 hover:text-slate-300'}`}
                >
                    <FileCode className="h-4 w-4" />
                    {expandedFolders.size > 0 ? 'Collapse System' : 'Expand All'}
                </button>
            </div>
        </Panel>
      </ReactFlow>

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.05),transparent_70%)]" />
    </div>
  );
}

export default CodeGraph2D;
