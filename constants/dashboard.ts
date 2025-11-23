import {
  LucideIcon,
  FileText,
  Home,
  User,
  Users,
  Settings,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { UserRole } from "@/lib/supabase/profiles";

export interface DashboardMenuItem {
  title: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  requiredRoles?: UserRole[];
}

export const menuItems: DashboardMenuItem[] = [
  // {
  //   title: "Dashboard",
  //   href: "/dashboard",
  //   icon: Home,
  // },
  {
    title: "Courses",
    href: "/dashboard/courses",
    icon: GraduationCap,
  },
  // {
  //   title: "Test",
  //   href: "/dashboard/test",
  //   icon: FileText,
  // },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
];

export const adminMenuItems: DashboardMenuItem[] = [
  {
    title: "Manage Courses",
    href: "/dashboard/admin/courses",
    icon: BookOpen,
    adminOnly: true,
    requiredRoles: ["superadmin", "admin"],
  },
  {
    title: "User Management",
    href: "/dashboard/admin/users",
    icon: Users,
    adminOnly: true,
    requiredRoles: ["superadmin", "admin"],
  },
];
