"use client"

import { useAuth } from "@/contexts/auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"



export default function DashboardPage() {
  const { profile } = useAuth()

  const router = useRouter()
  useEffect(() => {
    router.push("/dashboard/courses")
  }, [router])


  return (
    <>
      {JSON.stringify(profile)}
    </>
  )
}