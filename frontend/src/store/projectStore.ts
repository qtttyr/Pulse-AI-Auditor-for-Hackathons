import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AnalysisStatus = "idle" | "loading" | "success" | "error";

export type AIVerdict = {
  score: number // Overall Pulse Score
  impact_score: number // AI-evaluated complexity/impact
  innovation: string
  tech_debt: string
  top_finding: string
  architecture_type: string
  detailed_feedback?: string
  gold_nugget?: {
    file: string
    explanation: string
    snippet: string
  }
  metrics?: {
    modularity: number
    scalability: number
    quality: number
    readability: number
    complexity: number
    performance: number
  }
};

export type GraphNode = {
  id: string;
  label?: string;
  group?: string;
  size?: number;
  techDebt?: number;
  innovationScore?: number;
  type?: string;
  position?: { x: number; y: number };
  parentId?: string;
  extent?: "parent" | string;
  style?: Record<string, unknown>;
  data?: Record<string, unknown>;
};

export type GraphLink = {
  id: string;
  source: string;
  target: string;
  weight?: number;
  style?: Record<string, unknown>;
};

export type GraphData = {
  nodes: GraphNode[];
  edges: GraphLink[];
};

export interface Project {
  id: string;
  name: string;
  repoUrl: string;
  status: AnalysisStatus;
  verdict?: AIVerdict;
  graph?: GraphData;
  errorMessage?: string;
  analysisMessage?: string;
  /** ID свернутых папок (folder/group nodes) - stored as array for persistence */
  collapsedFolders: string[];
  createdAt: number;
}

type GlobalStore = {
  projects: Record<string, Project>;
  activeProjectId: string | null;
  addProject: (repoUrl: string) => string;
  setActiveProject: (projectId: string | null) => void;
  updateProject: (
    projectId: string,
    updates: Partial<
      Omit<Project, "id" | "repoUrl" | "createdAt" | "collapsedFolders">
    >,
  ) => void;
  /** Тоггл свёрнутости папки внутри проекта */
  toggleFolder: (projectId: string, folderId: string) => void;
  deleteProject: (projectId: string) => void;
  getActiveProject: () => Project | null;
  clearStore: () => void;
};

function deriveProjectName(repoUrl: string): string {
  try {
    if (repoUrl.startsWith("http://") || repoUrl.startsWith("https://")) {
      const url = new URL(repoUrl);
      const segments = url.pathname.split("/").filter(Boolean);
      if (segments.length >= 2) {
        return `${segments[0]}/${segments[1].replace(/\.git$/i, "")}`;
      }
    }
    if (repoUrl.includes("@") && repoUrl.includes(":")) {
      const path = repoUrl.split(":")[1] || "";
      const segments = path.split("/").filter(Boolean);
      if (segments.length >= 2) {
        const repoName = segments[segments.length - 1].replace(/\.git$/i, "");
        const owner = segments[segments.length - 2];
        return `${owner}/${repoName}`;
      }
    }
  } catch {
    // ignore
  }
  return repoUrl;
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
    collapsedFolders: [],
    createdAt: Date.now(),
  };
}

export const useProjectStore = create<GlobalStore>()(
  persist(
    (set, get) => ({
      projects: {},
      activeProjectId: null,

      addProject: (repoUrl: string) => {
        const id =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

        const project = createEmptyProject(repoUrl, id);

        set((state) => ({
          projects: {
            ...state.projects,
            [id]: project,
          },
          activeProjectId: id,
        }));

        return id;
      },

      setActiveProject: (projectId: string | null) => {
        set(() => ({
          activeProjectId: projectId,
        }));
      },

      updateProject: (projectId, updates) => {
        set((state) => {
          const existing = state.projects[projectId];
          if (!existing) return state;

          const next: Project = {
            ...existing,
            ...updates,
          };

          return {
            ...state,
            projects: {
              ...state.projects,
              [projectId]: next,
            },
          };
        });
      },

      toggleFolder: (projectId, folderId) => {
        set((state) => {
          const existing = state.projects[projectId];
          if (!existing) return state;

          const currentCollapsed = existing.collapsedFolders || [];
          const isCollapsed = currentCollapsed.includes(folderId);

          const nextCollapsed = isCollapsed
            ? currentCollapsed.filter((id) => id !== folderId)
            : [...currentCollapsed, folderId];

          const next: Project = {
            ...existing,
            collapsedFolders: nextCollapsed,
          };

          return {
            ...state,
            projects: {
              ...state.projects,
              [projectId]: next,
            },
          };
        });
      },

      deleteProject: (projectId) => {
        set((state) => {
          if (!state.projects[projectId]) return state;
          const nextProjects = { ...state.projects };
          delete nextProjects[projectId];
          const isActive = state.activeProjectId === projectId;

          return {
            projects: nextProjects,
            activeProjectId: isActive
              ? (Object.keys(nextProjects)[0] ?? null)
              : state.activeProjectId,
          };
        });
      },

      getActiveProject: () => {
        const state = get();
        if (!state.activeProjectId) return null;
        return state.projects[state.activeProjectId] ?? null;
      },

      clearStore: () => {
        set({ projects: {}, activeProjectId: null });
      },
    }),
    {
      name: "pulse-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
