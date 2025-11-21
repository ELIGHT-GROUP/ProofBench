"use client"
import { ProtectedRoute } from "@/components/shared/protected-route";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
      {children}
    </ProtectedRoute>
  );
};

export default AdminLayout