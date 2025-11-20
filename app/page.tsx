'use client'

import Logo from "@/components/shared/Logo"
import { FlickeringGrid } from "@/components/ui/shadcn-io/flickering-grid"
import { Navbar03 } from "@/components/ui/shadcn-io/navbar-03"
import { Navlinks } from "@/constants/navlinks"
import { useRouter } from "next/navigation"

const LandingPage = () => {

  const router = useRouter()


  return (
    <div>
      <div className="relative min-h-screen w-full overflow-hidden flex justify-center items-center">
        {/* Layer 1: Background Component */}
        <FlickeringGrid
          className="z-0 absolute inset-0 size-full"
          squareSize={10}
          gridGap={6}
          color="#ffaa00"
          maxOpacity={0.5}
          flickerChance={0.1}
        />

        {/* Layer 2: Foreground Content Layer - ready for text and other components */}
        <div className="max-w-6xl w-full min-h-screen relative z-10 bg-background">
          <Navbar03 logo={<Logo />} navigationLinks={Navlinks} onCtaClick={() => router.push('/login')} />
        </div>
      </div>
    </div>
  )
}

export default LandingPage