import ELK, { type ElkNode, type ElkExtendedEdge } from "elkjs/lib/elk.bundled.js"
import { type Node, type Edge, Position } from "@xyflow/react"

const elk = new ELK()

const ELK_OPTIONS: Record<string, string> = {
  "elk.algorithm": "layered",
  "elk.direction": "RIGHT",
  "elk.spacing.nodeNode": "80",
  "elk.spacing.edgeNode": "40",
  "elk.layered.spacing.nodeNodeBetweenLayers": "120",
  "elk.edgeRouting": "ORTHOGONAL",
  "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
}

/**
 * Lay out nodes as a FLAT list connected by edges.
 * We do NOT nest children inside parents in ELK — instead we rely on
 * the structural edges (parent→child) to create a visual tree.
 * This prevents the "sandwich" overlap that occurs when ELK computes
 * bounding boxes for parent nodes.
 */
export async function getLayoutedElements(
  nodes: Node[],
  edges: Edge[]
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  // Build a single flat list of ELK children
  const elkChildren: ElkNode[] = nodes.map((node) => ({
    id: node.id,
    width: node.type === "folder" ? 230 : 200,
    height: node.type === "folder" ? 65 : 55,
  }))

  // Convert to ELK edges
  const elkEdges: ElkExtendedEdge[] = edges.map((edge) => ({
    id: edge.id,
    sources: [edge.source],
    targets: [edge.target],
  }))

  const rootGraph: ElkNode = {
    id: "root",
    layoutOptions: ELK_OPTIONS,
    children: elkChildren,
    edges: elkEdges,
  }

  try {
    const result = await elk.layout(rootGraph)

    // Map ELK positions back onto React Flow nodes
    const posMap = new Map<string, { x: number; y: number }>()
    for (const child of result.children ?? []) {
      posMap.set(child.id, { x: child.x ?? 0, y: child.y ?? 0 })
    }

    const layoutedNodes: Node[] = nodes.map((node) => ({
      ...node,
      parentId: undefined, // Always flat for React Flow
      position: posMap.get(node.id) ?? { x: 0, y: 0 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }))

    return { nodes: layoutedNodes, edges }
  } catch (err) {
    console.error("ELK layout error:", err)
    // Fallback: stack vertically with spacing
    const fallbackNodes = nodes.map((node, i) => ({
      ...node,
      parentId: undefined,
      position: { x: 100, y: i * 100 },
    }))
    return { nodes: fallbackNodes, edges }
  }
}
