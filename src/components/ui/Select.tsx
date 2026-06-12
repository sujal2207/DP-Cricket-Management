"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formFieldSpacing } from "@/lib/ui-styles";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
}

export function Select({
  label,
  error,
  options,
  value = "",
  onChange,
  className,
  id,
  name,
  disabled,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleSelect = (optValue: string) => {
    onChange?.({
      target: { value: optValue, name: name ?? "" },
    } as React.ChangeEvent<HTMLSelectElement>);
    setOpen(false);
  };

  return (
    <div className={formFieldSpacing} ref={containerRef}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          id={id}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => !disabled && setOpen((prev) => !prev)}
          className={cn(
            "form-control flex items-center justify-between gap-2 text-left",
            error && "form-control-error",
            open && "form-control-open",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
        >
          <span className="truncate">{selected?.label}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))] transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>

        {open && (
          <ul role="listbox" className="dropdown-panel">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li key={opt.value || "__empty__"} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "dropdown-option",
                      isSelected
                        ? "dropdown-option-selected"
                        : "dropdown-option-active text-[hsl(var(--foreground))]/90"
                    )}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-brand-400" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
