import GithubConnect from "@/components/onboard/GithubConnect"

type OnboardPageProps = {
  onBackToLanding: () => void
  onAnalysisComplete: () => void
}

function OnboardPage({ onBackToLanding, onAnalysisComplete }: OnboardPageProps) {
  return (
    <GithubConnect
      onBackToLanding={onBackToLanding}
      onAnalysisComplete={onAnalysisComplete}
    />
  )
}

export default OnboardPage
