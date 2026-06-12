import { cn } from "@/lib/utils";

interface PublicFormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function PublicFormTextarea({
  label,
  error,
  className,
  id,
  required,
  ...props
}: PublicFormTextareaProps) {
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
      <textarea
        id={inputId}
        required={required}
        className={cn(
          "min-h-[110px] w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition-colors",
          "focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15",
          error && "border-red-400 focus:border-red-500 focus:ring-red-500/15",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
