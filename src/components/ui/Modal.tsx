"use client";

import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative flex max-h-[92vh] w-full flex-col rounded-t-2xl border border-[hsl(var(--border))] bg-[hsl(var(--elevated))] shadow-2xl shadow-black/50 sm:max-h-[90vh] sm:rounded-2xl",
          sizes[size]
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[hsl(var(--border))] px-4 py-4 sm:px-6">
          <h2 className="min-w-0 pr-2 text-base font-semibold tracking-tight sm:text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
