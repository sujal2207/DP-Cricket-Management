"use client";

import { Filter, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CricketersFilterBarProps {
  children: React.ReactNode;
  activeFilterCount: number;
  onClear: () => void;
}

export function CricketersFilterBar({
  children,
  activeFilterCount,
  onClear,
}: CricketersFilterBarProps) {
  return (
    <div className="filter-panel">
      <div className="mb-5 flex flex-col gap-4 border-b border-[hsl(var(--border))]/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-400 ring-1 ring-brand-500/25">
            <Filter className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold tracking-tight">Search & Filters</h4>
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-400 ring-1 ring-brand-500/25">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
              Refine results by name, contact, category, and more
            </p>
          </div>
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="w-full shrink-0 sm:w-auto"
          >
            <X className="h-3.5 w-3.5" />
            Reset filters
          </Button>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {children}
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filters apply automatically as you type or select
      </div>
    </div>
  );
}
