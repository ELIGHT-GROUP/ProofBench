import { UserRole } from "@/lib/supabase/profiles";

import { Shield, ShieldCheck, User, LucideIcon } from "lucide-react";

export interface RoleConfig {
  label: string;
  icon: LucideIcon;
  className: string;
}

export const roleConfig: Record<UserRole, RoleConfig> = {
  superadmin: {
    label: "Super Admin",
    icon: ShieldCheck,
    className: "bg-purple-500 text-white hover:bg-purple-600",
  },
  admin: {
    label: "Admin",
    icon: Shield,
    className: "bg-blue-500 text-white hover:bg-blue-600",
  },
  student: {
    label: "Student",
    icon: User,
    className: "bg-green-500 text-white hover:bg-green-600",
  },
};
