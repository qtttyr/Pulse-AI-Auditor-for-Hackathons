import Hero from "@/components/landing/Hero"
import HowItWorks from "@/components/landing/HowItWorks"

type LandingPageProps = {
  onStartAudit: () => void
}

function LandingPage({ onStartAudit }: LandingPageProps) {
  return (
    <>
      <Hero onStartAudit={onStartAudit} />
      <HowItWorks />
    </>
  )
}

export default LandingPage
