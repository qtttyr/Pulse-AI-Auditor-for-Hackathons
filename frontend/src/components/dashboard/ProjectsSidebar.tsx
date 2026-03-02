import { useMemo } from "react"
import { FolderGit2, Loader2, Trash2 } from "lucide-react"
import { useProjectStore, type Project } from "@/store/projectStore"

function statusLabel(project: Project): string {
  switch (project.status) {
    case "loading":
      return "Analyzing..."
    case "success":
      return "Ready"
    case "error":
      return "Error"
    default:
      return "Idle"
  }
}

export function ProjectsSidebar() {
  const store = useProjectStore()

  const projects = store.projects
  const activeId = store.activeProjectId

  const ordered = useMemo(
    () =>
      Object.values(projects).sort((a, b) => {
        return b.createdAt - a.createdAt
      }),
    [projects],
  )

  if (ordered.length === 0) {
    return (
      <aside className="relative z-40 flex w-64 shrink-0 flex-col border-r border-slate-800/40 bg-slate-950/90 backdrop-blur-3xl shadow-2xl">
        <div className="flex flex-1 flex-col p-6 gap-4">
          <div className="flex items-center gap-2">
            <FolderGit2 className="h-4 w-4 text-slate-500" />
            <h3 className="text-[0.65rem] font-black uppercase tracking-[0.25em] text-slate-500">
              Projects
            </h3>
          </div>
          <p className="text-[0.7rem] text-slate-600">
            Run an analysis to see it appear here.
          </p>
        </div>
      </aside>
    )
  }

  return (
    <aside className="relative z-40 flex w-64 shrink-0 flex-col border-r border-slate-800/40 bg-slate-950/90 backdrop-blur-3xl shadow-2xl">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <FolderGit2 className="h-4 w-4 text-sky-500" />
          <h3 className="text-[0.65rem] font-black uppercase tracking-[0.25em] text-slate-100">
            Projects
          </h3>
        </div>
        <span className="text-[0.6rem] text-slate-500 font-bold uppercase tracking-widest">
          {ordered.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4 custom-scrollbar">
        <div className="flex flex-col gap-1.5">
          {ordered.map((project) => {
            const isActive = project.id === activeId
            const isLoading = project.status === "loading"
            return (
              <button
                key={project.id}
                type="button"
                onClick={() => store.setActiveProject(project.id)}
                className={`group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-all ${
                  isActive
                    ? "border border-sky-500/60 bg-sky-500/10 shadow-[0_0_25px_rgba(56,189,248,0.25)]"
                    : "border border-slate-800 bg-slate-900/40 hover:border-sky-500/40 hover:bg-slate-900/70"
                }`}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900/80 border border-slate-700 group-hover:border-sky-500/60">
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-400" />
                  ) : (
                    <FolderGit2
                      className={`h-3.5 w-3.5 ${
                        isActive ? "text-sky-400" : "text-slate-500 group-hover:text-sky-300"
                      }`}
                    />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[0.7rem] font-semibold text-slate-100">
                    {project.name}
                  </span>
                  <span className="text-[0.6rem] font-medium uppercase tracking-widest text-slate-500">
                    {statusLabel(project)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    store.deleteProject(project.id)
                  }}
                  className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-800 bg-slate-900/70 text-slate-600 hover:border-rose-500/60 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

