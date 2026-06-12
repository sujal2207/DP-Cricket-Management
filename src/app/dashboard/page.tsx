"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Target,
  CircleDot,
  Shield,
  HandMetal,
  UserPlus,
  ExternalLink,
  Activity,
  PieChart as PieChartIcon,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { CategoryChart } from "@/components/charts/CategoryChart";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { PUBLIC_REGISTRATION_PATH } from "@/lib/constants";

interface Stats {
  totalPlayers: number;
  totalBatters: number;
  totalBowlers: number;
  totalAllRounders: number;
  totalWicketKeepers: number;
  categoryDistribution: { category: string; count: number }[];
}

interface AuditEntry {
  _id: string;
  cricketer_name: string;
  action: string;
  performed_by: string;
  created_at: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, auditRes] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/audit"),
        ]);
        const statsData = await statsRes.json();
        const auditData = await auditRes.json();
        setStats(statsData);
        setAuditLogs(auditData.data || []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <DashboardLayout title="Cricketer Management System">
      <div className="space-y-8">
        <div className="page-header">
          <div>
            <h2 className="page-title">Dashboard</h2>
            <p className="page-subtitle">Overview of registered cricket players</p>
          </div>
          <Link
            href={PUBLIC_REGISTRATION_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-2 focus:ring-offset-[hsl(var(--background))]"
          >
            <UserPlus className="h-4 w-4" />
            Open Registration Form
            <ExternalLink className="h-3.5 w-3.5 opacity-80" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard
            title="Total Players"
            value={stats?.totalPlayers ?? 0}
            icon={Users}
            color="green"
            loading={loading}
          />
          <StatCard
            title="Batters"
            value={stats?.totalBatters ?? 0}
            icon={Target}
            color="blue"
            loading={loading}
          />
          <StatCard
            title="Bowlers"
            value={stats?.totalBowlers ?? 0}
            icon={CircleDot}
            color="purple"
            loading={loading}
          />
          <StatCard
            title="All Rounders"
            value={stats?.totalAllRounders ?? 0}
            icon={HandMetal}
            color="orange"
            loading={loading}
          />
          <StatCard
            title="Wicket Keepers"
            value={stats?.totalWicketKeepers ?? 0}
            icon={Shield}
            color="red"
            loading={loading}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-5">
          <Card
            elevated
            className="xl:col-span-3"
            title="Category Distribution"
            description="Player breakdown by cricket category"
            action={
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400 ring-1 ring-brand-500/20">
                <PieChartIcon className="h-4 w-4" />
              </div>
            }
          >
            <CategoryChart data={stats?.categoryDistribution ?? []} loading={loading} />
          </Card>

          <Card
            elevated
            className="xl:col-span-2"
            title="Recent Activity"
            description="Latest registration changes"
            action={
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                <Activity className="h-4 w-4" />
              </div>
            }
          >
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-xl bg-[hsl(var(--muted))]/60"
                  />
                ))}
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <Activity className="h-8 w-8 text-[hsl(var(--muted-foreground))]/40" />
                <p className="text-sm font-medium">No activity yet</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Changes will appear here
                </p>
              </div>
            ) : (
              <div className="max-h-[340px] space-y-2 overflow-y-auto scrollbar-thin pr-1">
                {auditLogs.map((log) => (
                  <div key={log._id} className="activity-item">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{log.cricketer_name}</p>
                      <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                        by {log.performed_by}
                      </p>
                      <p className="mt-0.5 text-[10px] text-[hsl(var(--muted-foreground))]/80">
                        {formatDate(log.created_at)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        log.action === "CREATE"
                          ? "success"
                          : log.action === "DELETE"
                            ? "warning"
                            : "info"
                      }
                    >
                      {log.action}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
