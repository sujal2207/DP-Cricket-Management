import { cn } from "@/lib/utils";

export const formFieldSpacing = "space-y-1.5";

export function formControlClass(error?: string, className?: string) {
  return cn("form-control", error && "form-control-error", className);
}

export function checkboxCardClass(isSelected: boolean, isDisabled?: boolean) {
  return cn(
    "checkbox-card",
    isSelected && "checkbox-card-selected",
    isDisabled && "checkbox-card-disabled"
  );
}
