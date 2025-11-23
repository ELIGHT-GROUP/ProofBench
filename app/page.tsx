'use client'

import Logo from "@/components/shared/Logo"
import { FlickeringGrid } from "@/components/ui/shadcn-io/flickering-grid"
import { Navbar03 } from "@/components/ui/shadcn-io/navbar-03"
//import { Navlinks } from "@/constants/navlinks"
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
          maxOpacity={0.6}
          flickerChance={0.05}
        />

        {/* Layer 2: Foreground Content Layer */}
        <div className="max-w-7xl bg-background mx-auto w-full min-h-screen relative z-10">
          <Navbar03 className="absolute top-0 left-0 right-0 z-50" logo={<Logo />} navigationLinks={[]} onCtaClick={() => router.push('/login')} />

          {/* Hero Section */}
          <div className="flex flex-col items-center justify-center px-6 pt-32 pb-20 w-full min-h-screen">

            {/* Main Headline - Brutalist Style */}
            <div className="text-center mb-8 max-w-5xl">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.95] tracking-tight">
                <span className="block mb-4">A PLATFORM BUILT</span>
                <span className="inline-block bg-foreground text-background px-6 py-2">
                  TO EMPOWER LEARNING
                </span>
              </h1>
            </div>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-foreground/70 text-center max-w-2xl mb-12 leading-relaxed">
              A powerful environment for structured learning, assessments, and progress tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage