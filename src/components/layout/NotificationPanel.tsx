"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Trash2, X, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  _id: string;
  message: string;
  cricketer_name: string;
  read: boolean;
  created_at: string;
}

export function NotificationPanel() {
  const { showToast } = useToast();
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.data || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const markAllRead = async () => {
    if (unreadCount === 0) return;
    await fetch("/api/notifications", { method: "PATCH" });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleToggle = async () => {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen) {
      await markAllRead();
    }
  };

  const handleDeleteOne = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      showToast("Notification removed", "success");
    } catch {
      showToast("Failed to remove notification", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    setClearing(true);
    try {
      const res = await fetch("/api/notifications", { method: "DELETE" });
      if (!res.ok) throw new Error("Clear failed");
      setNotifications([]);
      setUnreadCount(0);
      showToast("All notifications cleared", "success");
    } catch {
      showToast("Failed to clear notifications", "error");
    } finally {
      setClearing(false);
    }
  };

  const handleNotificationClick = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-[hsl(var(--background))]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] surface-card shadow-2xl shadow-black/40 sm:w-96">
          <div className="flex items-center justify-between gap-3 border-b border-[hsl(var(--border))] px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Notifications</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {notifications.length} total
              </p>
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  loading={clearing}
                  className="text-xs text-[hsl(var(--muted-foreground))] hover:text-red-400"
                  title="Clear all notifications"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Clear all</span>
                </Button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                aria-label="Close notifications"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <CheckCheck className="h-8 w-8 text-[hsl(var(--muted-foreground))]/50" />
                <p className="text-sm font-medium">All caught up</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  No notifications right now
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[hsl(var(--border))]/70">
                {notifications.map((n) => (
                  <li key={n._id}>
                    <Link
                      href="/dashboard/cricketers"
                      onClick={() => handleNotificationClick(n._id)}
                      className={cn(
                        "group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[hsl(var(--muted))]/40",
                        !n.read && "bg-brand-500/5"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                          n.read
                            ? "bg-transparent"
                            : "bg-brand-500 ring-2 ring-brand-500/30"
                        )}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-snug font-gujarati">{n.message}</p>
                        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                          {n.cricketer_name}
                        </p>
                        <p className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]/80">
                          {formatDate(n.created_at)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteOne(n._id, e)}
                        disabled={loading}
                        className="shrink-0 rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                        aria-label="Remove notification"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
