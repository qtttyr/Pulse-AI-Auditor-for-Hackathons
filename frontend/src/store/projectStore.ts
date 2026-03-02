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
  parentId?: string
  extent?: "parent" | string
  style?: Record<string, unknown>
  data?: Record<string, any>
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

export interface Project {
  id: string
  name: string
  repoUrl: string
  status: AnalysisStatus
  verdict?: AIVerdict
  graph?: GraphData
  errorMessage?: string
  analysisMessage?: string
  /** ID свернутых папок (folder/group nodes) */
  collapsedFolders: Set<string>
  createdAt: number
}

type GlobalStore = {
  projects: Record<string, Project>
  activeProjectId: string | null
  addProject: (repoUrl: string) => string
  setActiveProject: (projectId: string) => void
  updateProject: (projectId: string, updates: Partial<Omit<Project, "id" | "repoUrl" | "createdAt" | "collapsedFolders">>) => void
  /** Тоггл свёрнутости папки внутри проекта */
  toggleFolder: (projectId: string, folderId: string) => void
  deleteProject: (projectId: string) => void
  getActiveProject: () => Project | null
}

function deriveProjectName(repoUrl: string): string {
  try {
    if (repoUrl.startsWith("http://") || repoUrl.startsWith("https://")) {
      const url = new URL(repoUrl)
      const segments = url.pathname.split("/").filter(Boolean)
      if (segments.length >= 2) {
        return `${segments[0]}/${segments[1].replace(/\.git$/i, "")}`
      }
    }
    if (repoUrl.includes("@") && repoUrl.includes(":")) {
      const path = repoUrl.split(":")[1] || ""
      const segments = path.split("/").filter(Boolean)
      if (segments.length >= 2) {
        const repoName = segments[segments.length - 1].replace(/\.git$/i, "")
        const owner = segments[segments.length - 2]
        return `${owner}/${repoName}`
      }
    }
  } catch {
    // ignore
  }
  return repoUrl
}

function createEmptyProject(repoUrl: string, id: string): Project {
  return {
    id,
    name: deriveProjectName(repoUrl),
    repoUrl,
    status: "loading",
    verdict: undefined,
    graph: undefined,
    errorMessage: undefined,
    analysisMessage: "Connecting to Pulse Engine...",
    collapsedFolders: new Set<string>(),
    createdAt: Date.now(),
  }
}

export const useProjectStore = create<GlobalStore>((set, get) => ({
  projects: {},
  activeProjectId: null,

  addProject: (repoUrl: string) => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`

    const project = createEmptyProject(repoUrl, id)

    set((state) => ({
      projects: {
        ...state.projects,
        [id] : project,
      },
      activeProjectId: id,
    }))

    return id
  },

  setActiveProject: (projectId: string) => {
    set(() => ({
      activeProjectId: projectId,
    }))
  },

  updateProject: (projectId, updates) => {
    set((state) => {
      const existing = state.projects[projectId]
      if (!existing) return state

      const next: Project = {
        ...existing,
        ...updates,
      }

      return {
        ...state,
        projects: {
          ...state.projects,
          [projectId]: next,
        },
      }
    })
  },

  toggleFolder: (projectId, folderId) => {
    set((state) => {
      const existing = state.projects[projectId]
      if (!existing) return state

      const nextCollapsed = new Set(existing.collapsedFolders)
      if (nextCollapsed.has(folderId)) {
        nextCollapsed.delete(folderId)
      } else {
        nextCollapsed.add(folderId)
      }

      const next: Project = {
        ...existing,
        collapsedFolders: nextCollapsed,
      }

      return {
        ...state,
        projects: {
          ...state.projects,
          [projectId]: next,
        },
      }
    })
  },

  deleteProject: (projectId) => {
    set((state) => {
      if (!state.projects[projectId]) return state
      const { [projectId]: _removed, ...rest } = state.projects
      const isActive = state.activeProjectId === projectId

      return {
        projects: rest,
        activeProjectId: isActive ? Object.keys(rest)[0] ?? null : state.activeProjectId,
      }
    })
  },

  getActiveProject: () => {
    const state = get()
    if (!state.activeProjectId) return null
    return state.projects[state.activeProjectId] ?? null
  },
}))

