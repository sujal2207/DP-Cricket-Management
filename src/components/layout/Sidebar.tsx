"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { AppLogo } from "@/components/ui/AppLogo";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/cricketers", label: "Cricketers", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--sidebar))] transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-[hsl(var(--border))] px-4">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
            <AppLogo size="xs" showFrame priority />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight">DP Cricket</p>
              <p className="truncate text-[10px] leading-tight text-[hsl(var(--muted-foreground))]">
                Tournament CMS
              </p>
            </div>
          </Link>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-[hsl(var(--muted))] lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[hsl(var(--border))] p-4">
          <div className="mb-3 flex justify-center">
            <AppLogo size="xs" showFrame />
          </div>
          <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
            {APP_NAME}
          </p>
        </div>
      </aside>
    </>
  );
}
