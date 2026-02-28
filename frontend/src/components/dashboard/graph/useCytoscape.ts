import React, { useEffect, useRef, useCallback, useState } from "react"
import cytoscape, { type Core, type NodeSingular, type ElementDefinition } from "cytoscape"
import dagre from "cytoscape-dagre"
import { GRAPH_STYLESHEET } from "./graphConstants"
import { DAGRE_LAYOUT } from "./graphElements"

// Register dagre exactly once
type CyWithMark = typeof cytoscape & { __dagreRegistered__?: boolean }
const CyRef = cytoscape as CyWithMark
if (!CyRef.__dagreRegistered__) {
  cytoscape.use(dagre)
  CyRef.__dagreRegistered__ = true
}

export interface TooltipData {
  x: number
  y: number
  label: string
  nodeType: string
  ext?: string
  color?: string
  childCount?: number
}

interface UseCytoscapeOptions {
  onFolderTap: (id: string) => void
}

interface UseCytoscapeReturn {
  containerRef: React.RefObject<HTMLDivElement | null>
  tooltip: TooltipData | null
  clearTooltip: () => void
  nodeCount: number
  edgeCount: number
  zoomIn: () => void
  zoomOut: () => void
  fitView: () => void
  focusNode: (id: string) => void
  loadElements: (elements: ElementDefinition[]) => void
}

export function useCytoscape({ onFolderTap }: UseCytoscapeOptions): UseCytoscapeReturn {
  const cyRef = useRef<Core | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [nodeCount, setNodeCount] = useState(0)
  const [edgeCount, setEdgeCount] = useState(0)

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (cyRef.current || !containerRef.current) return

    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      style: GRAPH_STYLESHEET as any,
      minZoom: 0.02,
      maxZoom: 5,
      boxSelectionEnabled: false,
    })
    cyRef.current = cy

    // Tap folder → toggle
    cy.on("tap", "node.folder", (evt) => {
      onFolderTap(evt.target.id())
    })

    // Hover → tooltip + highlight
    cy.on("mouseover", "node", (evt) => {
      if (!containerRef.current) return
      const node = evt.target as NodeSingular
      const pos = node.renderedPosition()
      const data = node.data()

      setTooltip({
        x: pos.x,
        y: pos.y,
        label: data.label,
        nodeType: data.nodeType,
        ext: data.ext,
        color: data.color,
        childCount: data.childCount,
      })

      if (data.nodeType === "file") {
        cy.elements().addClass("dimmed")
        node.removeClass("dimmed").addClass("highlighted")
        const connectedEdges = node.connectedEdges()
        connectedEdges.removeClass("dimmed").addClass("highlighted")
        connectedEdges.connectedNodes().removeClass("dimmed").addClass("highlighted")
      }
    })

    cy.on("mouseout", "node", () => {
      setTooltip(null)
      cy.elements().removeClass("dimmed highlighted")
    })

    // Double tap file -> focus & highlight
    cy.on("dbltap", "node.file", (evt) => {
      focusNode(evt.target.id())
    })

    // Tap canvas → deselect
    cy.on("tap", (evt) => {
      if (evt.target === cy) {
        cy.elements().removeClass("dimmed highlighted")
        setTooltip(null)
      }
    })

    return () => {
      cy.destroy()
      cyRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Load elements & re-layout ───────────────────────────────────────────────
  const loadElements = useCallback((elements: ElementDefinition[]) => {
    const cy = cyRef.current
    if (!cy) return

    cy.batch(() => {
      cy.elements().remove()
      if (elements.length > 0) cy.add(elements)
    })

    if (elements.length === 0) {
      setNodeCount(0)
      setEdgeCount(0)
      return
    }

    setNodeCount(cy.nodes(".file").length)
    setEdgeCount(cy.edges().length)

    // Ensure container size is updated before layout
    cy.resize()

    // Run layout in next frame to ensure DOM is ready
    requestAnimationFrame(() => {
        cy.layout(DAGRE_LAYOUT as unknown as cytoscape.LayoutOptions).run()
        cy.fit(undefined, 80)
    })
  }, [])

  // ── Controls ────────────────────────────────────────────────────────────────
  const zoomIn = useCallback(() => {
    cyRef.current?.zoom(cyRef.current.zoom() * 1.3)
  }, [])

  const zoomOut = useCallback(() => {
    cyRef.current?.zoom(cyRef.current.zoom() / 1.3)
  }, [])

  const fitView = useCallback(() => {
    cyRef.current?.fit(undefined, 80)
  }, [])

  const focusNode = useCallback((id: string) => {
    const cy = cyRef.current
    if (!cy) return
    const node = cy.getElementById(id)
    if (node.length === 0) return
    cy.animate(
      { center: { eles: node }, zoom: 1.8 },
      { duration: 400, easing: "ease-in-out-cubic" }
    )
    cy.elements().removeClass("dimmed highlighted")
    node.addClass("highlighted")
    node.connectedEdges().addClass("highlighted")
  }, [])

  const clearTooltip = useCallback(() => setTooltip(null), [])

  return {
    containerRef,
    tooltip,
    clearTooltip,
    nodeCount,
    edgeCount,
    zoomIn,
    zoomOut,
    fitView,
    focusNode,
    loadElements,
  }
}
