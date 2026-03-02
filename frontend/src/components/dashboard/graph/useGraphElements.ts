import { useState, useEffect, useMemo } from "react"
import { type Node, type Edge, MarkerType } from "@xyflow/react"
import { getExtColor, getExt } from "./graphConstants"
import { getLayoutedElements } from "./flowLayout"
import type { GraphData } from "@/store/projectStore"

export function useGraphElements(
  graph: GraphData | undefined, 
  expandedFolders: Set<string>, 
  toggleFolder: (id: string) => void
) {
  const [elements, setElements] = useState<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] })

  // 1. Synchronously prepare raw React Flow elements
  const rawElements = useMemo(() => {
    if (!graph) return { nodes: [], edges: [] }

    const visibleNodeIds = new Set<string>()
    const nodesInStore = graph.nodes
    const edgesInStore = graph.edges

    // Sort parents first
    const sortedNodes = [...nodesInStore].sort((a, b) => {
      const aDepth = a.id.split("/").length
      const bDepth = b.id.split("/").length
      if (aDepth !== bDepth) return aDepth - bDepth
      return a.id.localeCompare(b.id)
    })

    const rfNodes: Node[] = []
    const structuralEdges: Edge[] = []
    
    sortedNodes.forEach((n) => {
      const isFolder = n.type === "group" || n.type === "folder"
      
      // A node is visible if it has no parent, OR its parent is both visible and expanded
      let isVisible = !n.parentId 
      if (n.parentId) {
        isVisible = visibleNodeIds.has(n.parentId) && expandedFolders.has(n.parentId)
      }

      if (isVisible) {
        visibleNodeIds.add(n.id)
        const label = n.data?.label || n.label || n.id.split("/").pop() || ""
        const color = isFolder ? "transparent" : getExtColor(label)
        const ext = isFolder ? "" : getExt(label)
        const childCount = nodesInStore.filter(node => node.parentId === n.id).length

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
          position: { x: 0, y: 0 },
          parentId: n.parentId,
        } as Node)

        // Inject a structural edge if it has a parent
        if (n.parentId && visibleNodeIds.has(n.parentId)) {
          structuralEdges.push({
            id: `struct-${n.parentId}-${n.id}`,
            source: n.parentId,
            target: n.id,
            type: "custom", // This will use our clean SmoothStep edge
            animated: false,
          })
        }
      }
    })

    const rfEdges: Edge[] = [
      ...structuralEdges,
      ...edgesInStore.filter(e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target))
    ].map((e) => ({
        ...e,
        type: "custom",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#cbd5e1" },
      }))

    return { nodes: rfNodes, edges: rfEdges }
  }, [graph, expandedFolders, toggleFolder])

  // 2. Asynchronously run layout when raw elements change
  useEffect(() => {
    let isMounted = true

    if (rawElements.nodes.length === 0) {
      // Use a microtask to avoid synchronous setState in effect body
      Promise.resolve().then(() => {
        if (isMounted) setElements({ nodes: [], edges: [] })
      })
      return () => { isMounted = false }
    }

    getLayoutedElements(rawElements.nodes, rawElements.edges).then((layouted) => {
      if (isMounted) {
        setElements(layouted)
      }
    })

    return () => { isMounted = false }
  }, [rawElements])

  return elements
}
