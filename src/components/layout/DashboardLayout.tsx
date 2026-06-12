"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { DeveloperCredit } from "./DeveloperCredit";
import { AppLogo } from "@/components/ui/AppLogo";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[hsl(var(--background))]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
        />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
        <footer className="shrink-0 border-t border-[hsl(var(--border))]/60 bg-[hsl(var(--muted))]/20 px-4 py-6 lg:px-6">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5">
            <AppLogo size="xs" showFrame />
            <DeveloperCredit variant="dark" />
          </div>
        </footer>
      </div>
    </div>
  );
}
