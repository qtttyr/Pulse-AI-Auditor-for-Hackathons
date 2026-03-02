import axios from "axios"
import * as React from "react"

import { type AIVerdict, type GraphData, useProjectStore } from "@/store/projectStore"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

export function usePulseAI() {
  const projectStore = useProjectStore()

  const analyzeRepository = React.useCallback(
    async (repoUrl: string) => {
      if (!repoUrl) {
        // Ошибку показываем на текущем активном проекте (если он есть)
        const active = projectStore.getActiveProject()
        if (active) {
          projectStore.updateProject(active.id, {
            status: "error",
            errorMessage: "Enter a repository URL to start the analysis.",
          })
        }
        return
      }

      // Создаём новый проект и делаем его активным
      const projectId = projectStore.addProject(repoUrl)
      
      // Cycle through helpful messages
      const messages = [
        "Connecting to Pulse Engine...",
        "Cloning repository (this may take 15-30s)...",
        "Tracing import dependencies...",
        "Building X-Ray graph structure...",
        "Running AI Architectural synthesis...",
        "Polishing the dashboard view...",
        "Almost there! Readying the visualization..."
      ]
      
      let msgIndex = 0
      const msgInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % messages.length
        projectStore.updateProject(projectId, {
          analysisMessage: messages[msgIndex],
        })
      }, 5000)

      try {
        const response = await axios.post(`${API_BASE_URL}/analyze`, {
          repo_url: repoUrl,
        }, {
            timeout: 180000 // 3 minute timeout
        })

        clearInterval(msgInterval)
        const { nodes, edges, verdict } = response.data
        projectStore.updateProject(projectId, {
          status: "success",
          verdict: verdict as AIVerdict,
          graph: { nodes, edges } as GraphData,
          errorMessage: undefined,
          analysisMessage: undefined,
        })
      } catch (error: unknown) {
        clearInterval(msgInterval)
        console.error("Analysis failed:", error)
        let message = "Failed to analyze repository. Make sure the backend is running."
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
                message = "The analysis is taking longer than expected. The repository might be too large."
            } else if (error.response?.data?.detail) {
              message = error.response.data.detail
            }
        }
        projectStore.updateProject(projectId, {
          status: "error",
          errorMessage: message,
        })
      }
    },
    [projectStore]
  )

  return {
    projectStore,
    analyzeRepository,
  }
}
