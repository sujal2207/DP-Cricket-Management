"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface CategoryChartProps {
  data: { category: string; count: number }[];
  loading?: boolean;
}

const COLORS = ["#22c55e", "#3b82f6", "#a855f7", "#f97316", "#64748b"];

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { category: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--elevated))] px-3 py-2 shadow-xl shadow-black/30">
      <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
        {item.payload.category}
      </p>
      <p className="text-lg font-bold tabular-nums">{item.value} players</p>
    </div>
  );
}

export function CategoryChart({ data, loading }: CategoryChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (loading) {
    return (
      <div className="flex h-[320px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex h-[320px] flex-col items-center justify-center gap-2 text-center">
        <div className="h-16 w-16 rounded-full border-2 border-dashed border-[hsl(var(--border))]" />
        <p className="text-sm font-medium">No category data yet</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Register players to see distribution
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={4}
              dataKey="count"
              nameKey="category"
              animationBegin={0}
              animationDuration={800}
              stroke="transparent"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  className="outline-none transition-opacity hover:opacity-90"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold tabular-nums">{total}</p>
          <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            Total
          </p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {data.map((item, index) => {
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div
              key={item.category}
              className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))]/80 bg-[hsl(var(--input-bg))]/50 px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white/10"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="truncate text-sm font-medium">{item.category}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2 tabular-nums">
                <span className="text-sm font-bold">{item.count}</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
