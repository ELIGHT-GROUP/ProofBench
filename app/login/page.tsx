'use client'

import { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Logo from '@/components/shared/Logo'
import Image from 'next/image'
import { FlickeringGrid } from '@/components/ui/shadcn-io/flickering-grid'

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-foreground border-t-transparent mx-auto"></div>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Gradient Background with Logo and Testimonial */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        {/* Animated gradient overlay */}
        <FlickeringGrid
          className="z-0 absolute inset-0 size-full"
          squareSize={8}
          gridGap={6}
          color="#ffaa00"
          maxOpacity={0.8}
          flickerChance={0.1}
        />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col justify-between w-full p-12">
          {/* Logo at top */}
          <Logo />

          {/* Testimonial at bottom */}
          <div className="">
            <svg className="w-10 h-10 text-primary-foreground/80 mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="text-primary-foreground text-lg leading-relaxed mb-4">
              "Bad programmers worry about the code. Good programmers worry about data structures and their relationships"
            </p>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold shadow-lg">
                LT
              </div>
              <div>
                <p className="text-primary-foreground font-semibold">Linus Torvalds</p>
                <p className="text-primary-foreground/70 text-sm">Linux Creator</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Right Section - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative">

        {/* Form Container */}
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-foreground mb-3">Hello!</h1>
            <p className="text-muted-foreground">Login to your account</p>
          </div>

          <div className="space-y-6">
            {/* Google Sign In Button */}
            <Button
              type="button"
              onClick={signInWithGoogle}
              variant={'outline'}
              className="w-full py-6 transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
            >
              <Image
                src="/google-icon-logo-svgrepo-com.svg"
                alt="Google Logo"
                width={18}
                height={18}
              />
              <span>Sign in with Google</span>
            </Button>

            {/* Terms */}
            <p className="text-center text-xs text-muted-foreground mt-6">
              By creating an account, you agree to our{' '}
              <a href="/terms" className="text-primary hover:text-primary/80 font-medium">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="/privacy" className="text-primary hover:text-primary/80 font-medium">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}