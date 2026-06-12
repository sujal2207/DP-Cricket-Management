"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Moon, Sun, Monitor, Shield, Database, Users } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { AdminUsersPanel } from "@/components/settings/AdminUsersPanel";
import { RegistrationBrandingPanel } from "@/components/settings/RegistrationBrandingPanel";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-3xl space-y-8">
        <div className="page-header">
          <div>
            <h2 className="page-title">Settings</h2>
            <p className="page-subtitle">
              Configure your application preferences
            </p>
          </div>
        </div>

        <Card elevated title="Appearance" description="Customize the look and feel">
          {mounted && (
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { value: "light", label: "Light", icon: Sun },
                { value: "dark", label: "Dark", icon: Moon },
                { value: "system", label: "System", icon: Monitor },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                    theme === value
                      ? "border-brand-500/70 bg-brand-500/10 ring-1 ring-brand-500/25"
                      : "border-[hsl(var(--border))] bg-[hsl(var(--input-bg))] hover:border-slate-500"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          )}
        </Card>

        <AdminUsersPanel />

        <RegistrationBrandingPanel />

        <Card elevated title="Application Info">
          <div className="space-y-4">
            <InfoRow icon={Shield} label="Application" value={APP_NAME} />
            <InfoRow icon={Database} label="Database" value="MongoDB Atlas" />
            <InfoRow
              icon={Users}
              label="Authentication"
              value="Main admin (.env) + managed admins"
            />
          </div>
        </Card>

        <Card elevated title="Data Management">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Export all cricketer registrations to Excel format from the Cricketers page.
          </p>
          <Button variant="outline" onClick={() => window.location.href = "/dashboard/cricketers"}>
            Go to Cricketers
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
        <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
