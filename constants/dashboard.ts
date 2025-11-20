import {
  LucideIcon,
  FileText,
  Home,
  User,
  Users,
  Settings,
} from "lucide-react";
import { UserRole } from "@/lib/supabase/types";

export interface DashboardMenuItem {
  title: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  requiredRoles?: UserRole[];
}

export const menuItems: DashboardMenuItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Test",
    href: "/dashboard/test",
    icon: FileText,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
];

export const adminMenuItems: DashboardMenuItem[] = [
  {
    title: "User Management",
    href: "/dashboard/users",
    icon: Users,
    adminOnly: true,
    requiredRoles: ["superadmin", "admin"],
  },
];
