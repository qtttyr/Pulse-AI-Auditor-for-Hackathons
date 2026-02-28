// ── Colour palette ────────────────────────────────────────────────────────────
export const PALETTE = {
  folder: {
    bg: "rgba(14, 165, 233, 0.12)",
    border: "#0ea5e9",
    label: "#7dd3fc",
    selected: "rgba(14,165,233,0.22)",
  },
  file: {
    bg: "#1e293b",
    border: "#3b82f6",
    label: "#f1f5f9",
    hover: "#3b82f6",
    selected: "#0ea5e9",
  },
  edge: {
    normal: "rgba(30, 64, 175, 0.4)",
    agg: "rgba(124, 58, 237, 0.35)",
    highlight: "#60a5fa",
  },
  canvas: "#020617",
}

// ── Extension / language colour coding ───────────────────────────────────────
export const EXT_COLORS: Record<string, string> = {
  ts: "#60a5fa",
  tsx: "#22d3ee",
  js: "#facc15",
  jsx: "#fb923c",
  py: "#4ade80",
  css: "#c084fc",
  json: "#fbbf24",
  md: "#94a3b8",
  html: "#f87171",
  sh: "#34d399",
  yaml: "#f472b6",
  yml: "#f472b6",
  env: "#a3e635",
}

export function getExtColor(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? ""
  return EXT_COLORS[ext] ?? "#94a3b8"
}

export function getExt(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? ""
}

// ── Cytoscape stylesheet ──────────────────────────────────────────────────────
export const GRAPH_STYLESHEET = [
  {
    selector: "node",
    style: {
      "font-family": "Inter, system-ui, sans-serif",
      "font-weight": 600,
      "text-halign": "center",
      "text-valign": "center",
      color: PALETTE.file.label,
      "font-size": 11,
      "text-wrap": "ellipsis",
      "text-max-width": 130,
      "overlay-opacity": 0,
      "transition-property": "opacity",
      "transition-duration": 200,
    },
  },
  {
    selector: "node.folder",
    style: {
      shape: "round-rectangle",
      "background-color": PALETTE.folder.bg,
      "background-opacity": 0.4,
      "border-width": 2,
      "border-color": PALETTE.folder.border,
      padding: 60,
      color: PALETTE.folder.label,
      "font-size": 14,
      "font-weight": 800,
      "text-valign": "top",
      "text-margin-y": 25,
      "text-transform": "uppercase",
      "min-width": 220,
      "min-height": 140,
      label: "data(label)",
    },
  },
  {
    selector: "node.top-folder",
    style: {
      "border-width": 3,
      "border-style": "solid",
      "font-size": 18,
      "text-margin-y": 30,
    },
  },
  {
    selector: "node.sub-folder",
    style: {
      "border-style": "dashed",
      "border-color": "rgba(99, 102, 241, 0.6)",
      "background-color": "rgba(99, 102, 241, 0.08)",
    },
  },
  {
    selector: "node.file",
    style: {
      shape: "round-rectangle",
      width: 140,
      height: 40,
      "background-color": PALETTE.file.bg,
      "border-width": 2,
      "border-color": "data(color)",
      label: "data(label)",
      color: "#f8fafc",
      "font-size": 10,
    },
  },
  {
    selector: "node.highlighted",
    style: {
      "border-width": 4,
      "border-color": PALETTE.edge.highlight,
      "background-color": "#1e3a8a",
      "z-index": 999,
    },
  },
  {
    selector: "node.dimmed",
    style: { opacity: 0.15 },
  },
  {
    selector: "edge",
    style: {
      "curve-style": "bezier",
      "target-arrow-shape": "triangle",
      "arrow-scale": 1.2,
      width: 1.5,
      "line-color": PALETTE.edge.normal,
      "target-arrow-color": PALETTE.edge.normal,
      opacity: 0.5,
      "line-cap": "round",
    },
  },
  {
    selector: "edge.edge-agg",
    style: {
      "line-style": "dashed",
      "line-dash-pattern": [6, 4],
      "line-color": PALETTE.edge.agg,
      "target-arrow-color": PALETTE.edge.agg,
      opacity: 0.45,
      width: 2.5,
    },
  },
  {
    selector: "edge.highlighted",
    style: {
      "line-color": PALETTE.edge.highlight,
      "target-arrow-color": PALETTE.edge.highlight,
      opacity: 1,
      width: 3,
      "z-index": 99,
    },
  },
  {
    selector: "edge.dimmed",
    style: { opacity: 0.05 },
  },
]
