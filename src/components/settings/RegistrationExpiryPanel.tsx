"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarOff, CalendarClock, Save, Trash2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { formatCloseDateDisplay } from "@/lib/registration-window";
import { cn } from "@/lib/utils";

export function RegistrationExpiryPanel() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | undefined>();
  const [savedClosesOn, setSavedClosesOn] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [dateValue, setDateValue] = useState("");

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/registration-expiry");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSavedClosesOn(data.registrationClosesOn ?? null);
      setIsOpen(data.isRegistrationOpen ?? true);
      setDateValue(data.registrationClosesOn ?? "");
      setUpdatedAt(data.updatedAt);
    } catch {
      showToast("Failed to load registration deadline settings", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const isDirty = useMemo(() => {
    const draft = dateValue.trim() || null;
    return draft !== savedClosesOn;
  }, [dateValue, savedClosesOn]);

  const saveExpiry = async (closesOn: string | null) => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/registration-expiry", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration_closes_on: closesOn }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      setSavedClosesOn(data.registrationClosesOn ?? null);
      setIsOpen(data.isRegistrationOpen ?? true);
      setDateValue(data.registrationClosesOn ?? "");
      setUpdatedAt(data.updatedAt);
      showToast(
        closesOn
          ? "Registration deadline saved"
          : "Registration deadline cleared — form is open",
        "success"
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to save deadline",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const status = useMemo(() => {
    if (!savedClosesOn) {
      return {
        label: "Open — no deadline",
        tone: "open" as const,
        description:
          "Public registration is open. Set a last date below to close new registrations after that day.",
      };
    }
    if (isOpen) {
      return {
        label: `Open until ${formatCloseDateDisplay(savedClosesOn)}`,
        tone: "scheduled" as const,
        description: `Users can register until the end of ${formatCloseDateDisplay(savedClosesOn)} (IST). After that date, the form closes automatically.`,
      };
    }
    return {
      label: "Registration closed",
      tone: "closed" as const,
      description: `The deadline (${formatCloseDateDisplay(savedClosesOn)}) has passed. Clear the date or pick a future date to reopen registration.`,
    };
  }, [savedClosesOn, isOpen]);

  return (
    <Card
      elevated
      title="Registration Deadline"
      description="Control when the public registration form stops accepting new players."
    >
      {loading ? (
        <div className="h-28 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />
      ) : (
        <div className="space-y-5">
          <div
            className={cn(
              "flex items-start gap-3 rounded-xl border p-4",
              status.tone === "open" &&
                "border-emerald-500/25 bg-emerald-500/5",
              status.tone === "scheduled" &&
                "border-amber-500/25 bg-amber-500/5",
              status.tone === "closed" &&
                "border-red-500/25 bg-red-500/5"
            )}
          >
            {status.tone === "closed" ? (
              <CalendarOff className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            ) : (
              <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            )}
            <div>
              <p className="text-sm font-semibold">{status.label}</p>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                {status.description}
              </p>
            </div>
          </div>

          <div className="max-w-sm space-y-2">
            <label htmlFor="registration_closes_on" className="form-label">
              Last date for registration
            </label>
            <p className="form-hint">
              Leave empty to keep registration open indefinitely. Users cannot
              register after this date (inclusive until end of that day, IST).
            </p>
            <input
              id="registration_closes_on"
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="form-control w-full max-w-xs"
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-[hsl(var(--border))] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-[hsl(var(--muted-foreground))]">
              {updatedAt
                ? `Last updated: ${new Date(updatedAt).toLocaleString()}`
                : "Not saved yet"}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={fetchSettings}
                disabled={saving}
              >
                <RefreshCw className="h-4 w-4" />
                Reload
              </Button>
              {savedClosesOn && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={() => saveExpiry(null)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear Date
                </Button>
              )}
              <Button
                type="button"
                disabled={saving || !isDirty}
                onClick={() => saveExpiry(dateValue.trim() || null)}
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Deadline"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
