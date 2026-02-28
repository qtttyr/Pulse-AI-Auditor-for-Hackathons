import dagre from "dagre"
import { type Node, type Edge, Position } from "@xyflow/react"

const NODE_WIDTH = 240
const NODE_HEIGHT = 80
const FOLDER_WIDTH = 320
const FOLDER_HEIGHT = 180

/**
 * Calculates a hierarchical layout for React Flow nodes using dagre.
 */
export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = "TB") => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  
  const isHorizontal = direction === "LR"
  dagreGraph.setGraph({ 
    rankdir: direction,
    nodesep: 150,
    ranksep: 250,
    marginx: 100,
    marginy: 100
  })

  // ── Step 1: Add nodes to dagre ──────────────────────────────────────────────
  nodes.forEach((node) => {
    const isFolder = node.type === "folder"
    const width = isFolder ? FOLDER_WIDTH : NODE_WIDTH
    const height = isFolder ? FOLDER_HEIGHT : NODE_HEIGHT
    dagreGraph.setNode(node.id, { width, height })
  })

  // ── Step 2: Add edges to dagre ──────────────────────────────────────────────
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  // ── Step 3: Run layout ──────────────────────────────────────────────────────
  dagre.layout(dagreGraph)

  // ── Step 4: Map positions back ──────────────────────────────────────────────
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    const isFolder = node.type === "folder"
    const width = isFolder ? FOLDER_WIDTH : NODE_WIDTH
    const height = isFolder ? FOLDER_HEIGHT : NODE_HEIGHT

    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}
