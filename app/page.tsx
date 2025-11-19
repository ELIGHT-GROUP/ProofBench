'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/contexts/auth"

const LandingPage = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Welcome to ProofBench
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your platform for learning and testing. Get started today!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-3">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="lg" className="text-lg px-8 py-3">
                Get Started
              </Button>
            </Link>
          )}
          
          <Link href="/about-us">
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              Learn More
            </Button>
          </Link>
        </div>
      </div>
      
      <footer className="mt-auto py-8 text-center text-gray-500">
        <nav className="space-x-6">
          <Link href="/about-us" className="hover:text-gray-700">About Us</Link>
          <Link href="/terms" className="hover:text-gray-700">Terms</Link>
        </nav>
      </footer>
    </div>
  )
}

export default LandingPage