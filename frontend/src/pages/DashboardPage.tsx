import CodeGraphFlow from "@/components/dashboard/CodeGraphFlow"
import { useProjectStore } from "@/store/projectStore"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { InsightsPanel } from "@/components/dashboard/InsightsPanel"
import { LoadingOverlay } from "@/components/dashboard/LoadingOverlay"

function DashboardPage() {
  const store = useProjectStore()
  const project = store.getActiveProject()
  const status = project?.status ?? "idle"

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950">
      {/* Full-screen Graph Background */}
      <div className="absolute inset-0 z-0 flex">
        <CodeGraphFlow />
      </div>

      {/* Floating Header info */}
      <DashboardHeader />

      {/* AI Insights Bottom Panel */}
      <InsightsPanel />

      {/* Loading Overlay */}
      {status === "loading" && <LoadingOverlay />}
    </div>
  )
}

export default DashboardPage
