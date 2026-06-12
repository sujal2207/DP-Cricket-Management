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
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
        />
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
        <footer className="shrink-0 border-t border-[hsl(var(--border))]/60 bg-[hsl(var(--muted))]/15 px-4 py-3 lg:px-6">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
            <AppLogo
              size="xs"
              showFrame
              className="h-7 w-7 shrink-0 sm:h-8 sm:w-8"
            />
            <DeveloperCredit variant="dark" className="max-w-none flex-1 sm:max-w-2xl" />
          </div>
        </footer>
      </div>
    </div>
  );
}
