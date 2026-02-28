import * as React from "react"

type ParsedRepo = {
  owner: string
  name: string
}

function parseGitHubUrl(value: string): ParsedRepo | null {
  try {
    // HTTP(S) git URLs
    if (value.startsWith("http://") || value.startsWith("https://")) {
      const url = new URL(value)
      const segments = url.pathname.split("/").filter(Boolean)
      if (segments.length < 2) return null
      const repoName = segments[1].replace(/\.git$/i, "")
      return {
        owner: segments[0] ?? "",
        name: repoName ?? "",
      }
    }

    // SSH-style: git@host:owner/repo(.git)
    if (value.includes("@") && value.includes(":")) {
      const path = value.split(":")[1] || ""
      const segments = path.split("/").filter(Boolean)
      if (segments.length < 2) return null
      const repoName = segments[segments.length - 1].replace(/\.git$/i, "")
      const owner = segments[segments.length - 2]
      return { owner, name: repoName }
    }

    return null
  } catch {
    return null
  }
}

export function useGitHub() {
  const [url, setUrl] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const updateUrl = React.useCallback((value: string) => {
    setUrl(value)
    setError(null)
  }, [])

  const validate = React.useCallback(() => {
    if (!url) {
      setError("Enter a Git repository URL.")
      return false
    }

    const parsed = parseGitHubUrl(url)
    if (!parsed) {
      setError("Use a valid Git repository URL, e.g. https://github.com/org/project or git@github.com:org/project.git")
      return false
    }

    return true
  }, [url])

  return {
    url,
    setUrl: updateUrl,
    error,
    validate,
    parsed: parseGitHubUrl(url),
  }
}

