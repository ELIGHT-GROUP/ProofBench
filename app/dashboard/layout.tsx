"use client"

import { DashboardLayout } from "@/components/dashboard";
import { ProtectedRoute } from "@/components/shared/protected-route";

const DashLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashLayout