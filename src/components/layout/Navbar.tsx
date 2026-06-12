"use client";

import { Menu, Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { NotificationPanel } from "@/components/layout/NotificationPanel";
import { useToast } from "@/components/providers/ToastProvider";
import { APP_NAME } from "@/lib/constants";
import { AppLogo } from "@/components/ui/AppLogo";

interface NavbarProps {
  onMenuClick: () => void;
  title?: string;
}

export function Navbar({ onMenuClick, title }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      showToast("Logged out successfully", "success");
      router.push("/login");
      router.refresh();
    } catch {
      showToast("Failed to logout", "error");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/90 px-4 backdrop-blur-md lg:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          onClick={onMenuClick}
          className="shrink-0 rounded-lg p-2 transition-colors hover:bg-[hsl(var(--muted))] lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <AppLogo size="xs" showFrame className="hidden shrink-0 sm:block" />
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold tracking-tight sm:text-lg">
            {title || APP_NAME}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <NotificationPanel />

        {mounted && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={handleLogout} loading={loggingOut}>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
