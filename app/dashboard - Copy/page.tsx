'use client'

import { ProtectedRoute } from '@/components/shared/protected-route'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome to your ProofBench dashboard
            </p>
          </div>

          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              Select a section from the sidebar to get started
            </p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}