import { DashboardSidebar } from "@/components/dashboard/sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | ExamNexa",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      {/* Main content — offset for sidebar on desktop, offset for topbar on mobile */}
      <main className="lg:ml-64 pt-14 lg:pt-0 transition-all duration-300">
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
