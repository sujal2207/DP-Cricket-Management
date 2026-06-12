import { cn } from "@/lib/utils";

interface PublicFormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function PublicFormInput({
  label,
  error,
  hint,
  className,
  id,
  required,
  ...props
}: PublicFormInputProps) {
  const inputId = id || props.name;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-slate-800"
      >
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <input
        id={inputId}
        required={required}
        className={cn(
          "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition-colors",
          "focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15",
          error && "border-red-400 focus:border-red-500 focus:ring-red-500/15",
          className
        )}
        {...props}
      />
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

export function stripToDigits(value: string, maxLength = 10): string {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

export function blockNonNumericKey(e: React.KeyboardEvent<HTMLInputElement>) {
  if (
    e.ctrlKey ||
    e.metaKey ||
    e.key === "Backspace" ||
    e.key === "Delete" ||
    e.key === "Tab" ||
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight" ||
    e.key === "Home" ||
    e.key === "End"
  ) {
    return;
  }
  if (!/^\d$/.test(e.key)) {
    e.preventDefault();
  }
}
