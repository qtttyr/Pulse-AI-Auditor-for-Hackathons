import type { ElementDefinition } from "cytoscape"
import type { GraphNode, GraphLink } from "@/store/projectStore"
import { getExtColor, getExt } from "./graphConstants"

/**
 * Converts raw graph data from the store into Cytoscape ElementDefinition[].
 * Handles folder collapse/expand visibility logic and includes positions if provided by backend.
 */
export function buildElements(
  nodes: GraphNode[],
  edges: GraphLink[],
  collapsed: Set<string>
): ElementDefinition[] {
  const els: ElementDefinition[] = []
  const folderIds = new Set(nodes.filter((n) => n.type === "group").map((n) => n.id))
  
  const topFolders = nodes.filter((n) => n.type === "group" && !n.parentNode)
  const subFolders = nodes.filter((n) => n.type === "group" && !!n.parentNode)
  const visibleNodeIds = new Set<string>()

  // ── Top-level folders ──────────────────────────────────────────────────────
  for (const f of topFolders) {
    // @ts-expect-error - backend data mapping
    const label = f.data?.label || f.label || f.id.split("/").pop() || f.id
    const childCount = nodes.filter(
      (n) => n.parentNode === f.id && n.type !== "group"
    ).length
    
    els.push({
      data: { id: f.id, label, nodeType: "folder", depth: 0, childCount },
      classes: "folder top-folder",
      position: f.position ? { x: f.position.x, y: f.position.y } : undefined,
    })
    visibleNodeIds.add(f.id)
  }

  // ── Sub-folders ────────────────────────────────────────────────────────────
  for (const f of subFolders) {
    const parentCollapsed = f.parentNode ? collapsed.has(f.parentNode) : false
    if (parentCollapsed) continue
    
    // @ts-expect-error - backend data mapping
    const label = f.data?.label || f.label || f.id.split("/").pop() || f.id
    const childCount = nodes.filter(
      (n) => n.parentNode === f.id && n.type !== "group"
    ).length
    
    els.push({
      data: {
        id: f.id,
        label,
        nodeType: "folder",
        parent: f.parentNode,
        depth: 1,
        childCount,
      },
      classes: "folder sub-folder",
      position: f.position ? { x: f.position.x, y: f.position.y } : undefined,
    })
    visibleNodeIds.add(f.id)
  }

  // ── File nodes ──────────────────────────────────────────────────────────────
  for (const n of nodes) {
    if (folderIds.has(n.id)) continue

    // Visibility logic
    let tempParent: string | null = n.parentNode ?? null
    let hiddenByAncestor = false
    while (tempParent) {
      if (collapsed.has(tempParent)) {
        hiddenByAncestor = true
        break
      }
      const parentNodeObj = nodes.find(prev => prev.id === tempParent)
      tempParent = parentNodeObj?.parentNode ?? null
    }
    if (hiddenByAncestor) continue

    // Nearest visible parent
    let nearestVisibleParent: string | null = n.parentNode ?? null
    while (nearestVisibleParent && !visibleNodeIds.has(nearestVisibleParent)) {
      const pNode = nodes.find(fn => fn.id === nearestVisibleParent)
      nearestVisibleParent = pNode?.parentNode ?? null
    }

    // @ts-expect-error - backend might send it inside data
    const filename = n.data?.label || n.label || n.id.split("/").pop() || n.id
    const color = getExtColor(filename)
    const ext = getExt(filename)

    els.push({
      data: {
        id: n.id,
        label: filename,
        nodeType: "file",
        ext,
        color,
        parent: nearestVisibleParent || undefined,
      },
      classes: `file ext-${ext}`,
      position: n.position ? { x: n.position.x, y: n.position.y } : undefined,
    })
    visibleNodeIds.add(n.id)
  }

  // ── Edges ───────────────────────────────────────────────────────────────────
  for (const e of edges) {
    if (!visibleNodeIds.has(e.source) || !visibleNodeIds.has(e.target)) continue
    if (e.source === e.target) continue
    
    const isAgg = e.id.startsWith("agg-")
    const weight = e.weight || (e.style?.strokeWidth as number) || (isAgg ? 3 : 1.5)
    
    els.push({
      data: {
        id: e.id,
        source: e.source,
        target: e.target,
        weight,
        edgeType: isAgg ? "agg" : "file",
      },
      classes: isAgg ? "edge-agg" : "edge-file",
    })
  }

  return els
}

/**
 * Dagre layout configuration for hierarchical structure.
 */
export const DAGRE_LAYOUT: Record<string, unknown> = {
  name: "dagre",
  nodeSep: 100,
  rankSep: 200,
  rankDir: "TB",
  padding: 100,
  fit: true,
  animate: false,
}
