'use client'

import { ProtectedRoute } from '@/components/shared/protected-route'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

export default function DashboardPage() {


  return (
    <ProtectedRoute>
      <DashboardLayout>
        <></>
      </DashboardLayout>
    </ProtectedRoute>
  )
}