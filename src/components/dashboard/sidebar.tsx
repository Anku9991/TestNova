"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BookOpen, BarChart3, Trophy,
  User, Settings, Zap, CreditCard, LogOut, Menu, X,
  ChevronLeft, ChevronRight, Bookmark, Shield, Users, HelpCircle, BrainCircuit, MessageSquare
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";

const studentNav = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/student/dashboard" },
  { icon: BookOpen, label: "My Tests", href: "/student/tests" },
  { icon: Trophy, label: "Results", href: "/student/results" },
  { icon: BrainCircuit, label: "AI Planner", href: "/student/ai-planner" },
  { icon: BarChart3, label: "Performance", href: "/student/performance" },
  { icon: Bookmark, label: "Bookmarks", href: "/student/bookmarks" },
  { icon: CreditCard, label: "Subscription", href: "/student/subscription" },
  { icon: MessageSquare, label: "Support", href: "/student/support" },
  { icon: User, label: "Profile", href: "/student/profile" },
];

const adminNav = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: BookOpen, label: "Exams", href: "/admin/exams" },
  { icon: HelpCircle, label: "Questions", href: "/admin/questions" },
  { icon: MessageSquare, label: "Support", href: "/admin/support" },
  { icon: BarChart3, label: "Reports", href: "/admin/reports" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

const superAdminNav = [
  { icon: LayoutDashboard, label: "Overview", href: "/super-admin/dashboard" },
  { icon: BarChart3, label: "Revenue", href: "/super-admin/revenue" },
  { icon: CreditCard, label: "Subscriptions", href: "/super-admin/subscriptions" },
  { icon: Shield, label: "Audit Logs", href: "/super-admin/audit-logs" },
  { icon: Settings, label: "Settings", href: "/super-admin/settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { userProfile } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = userProfile?.role || "student";
  const navItems =
    role === "super_admin"
      ? superAdminNav
      : role === "admin" || role === "teacher"
      ? adminNav
      : studentNav;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully");
      router.push("/");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-border ${collapsed ? "justify-center" : ""}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-secondary-400" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-lg">
            Test<span className="text-primary-500">Nova</span>
          </span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              className={`sidebar-link ${isActive ? "active" : ""} ${collapsed ? "justify-center px-3" : ""}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-3 border-t border-border space-y-1">
        <button
          onClick={handleLogout}
          className={`sidebar-link w-full text-red-500 hover:bg-red-500/10 hover:text-red-500 ${collapsed ? "justify-center px-3" : ""}`}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        {/* User Avatar */}
        {!collapsed && userProfile && (
          <div className="flex items-center gap-3 px-4 py-3 mt-1 rounded-xl bg-muted/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-800 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {getInitials(userProfile.name || "User")}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{userProfile.name}</div>
              <div className="text-xs text-muted-foreground capitalize">{role.replace("_", " ")}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-card border-r border-border z-30 transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors shadow-sm"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile: Topbar trigger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14 bg-card/95 backdrop-blur border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center">
            <Zap className="w-4 h-4 text-secondary-400" />
          </div>
          <span className="font-display font-bold text-base">TestNova</span>
        </Link>
        <button onClick={() => setMobileOpen(true)} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border z-50"
            >
              <div className="flex justify-end p-3">
                <button onClick={() => setMobileOpen(false)} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
