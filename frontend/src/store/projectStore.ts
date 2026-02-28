import { create } from "zustand"

export type AnalysisStatus = "idle" | "loading" | "success" | "error"

export type AIVerdict = {
  score: number
  innovation: string
  tech_debt: string
  top_finding: string
  architecture_type: string
}

export type GraphNode = {
  id: string
  label?: string
  group?: string
  size?: number
  techDebt?: number
  innovationScore?: number
  type?: string
  position?: { x: number; y: number }
  parentNode?: string
  extent?: "parent" | string
  style?: Record<string, unknown>
}

export type GraphLink = {
  id: string
  source: string
  target: string
  weight?: number
  style?: Record<string, unknown>
}

export type GraphData = {
  nodes: GraphNode[]
  edges: GraphLink[]
}

type ProjectState = {
  repoUrl: string
  status: AnalysisStatus
  verdict?: AIVerdict
  graph?: GraphData
  errorMessage?: string
  analysisMessage?: string
  setRepoUrl: (url: string) => void
  startAnalysis: (url: string) => void
  setAnalysisMessage: (message: string) => void
  setResult: (payload: { verdict: AIVerdict; graph: GraphData }) => void
  setError: (message: string) => void
  reset: () => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  repoUrl: "",
  status: "idle",
  verdict: undefined,
  graph: undefined,
  errorMessage: undefined,
  analysisMessage: undefined,
  setRepoUrl: (url) =>
    set(() => ({
      repoUrl: url,
    })),
  startAnalysis: (url) =>
    set(() => ({
      repoUrl: url,
      status: "loading",
      verdict: undefined,
      graph: undefined,
      errorMessage: undefined,
      analysisMessage: "Connecting to Pulse Engine...",
    })),
  setAnalysisMessage: (message) =>
    set(() => ({
      analysisMessage: message,
    })),
  setResult: (payload) =>
    set(() => ({
      status: "success",
      verdict: payload.verdict,
      graph: payload.graph,
      errorMessage: undefined,
      analysisMessage: undefined,
    })),
  setError: (message) =>
    set(() => ({
      status: "error",
      errorMessage: message,
    })),
  reset: () =>
    set(() => ({
      repoUrl: "",
      status: "idle",
      verdict: undefined,
      graph: undefined,
      errorMessage: undefined,
    })),
}))

