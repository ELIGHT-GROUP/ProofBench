"use client"

import { useAuth } from "@/contexts/auth"



export default function DashboardPage() {
  const { profile } = useAuth()


  return (

    <>
      { JSON.stringify(profile) }
    </>

  )
}