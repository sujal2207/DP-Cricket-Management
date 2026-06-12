import { cn } from "@/lib/utils";
import { formControlClass, formFieldSpacing } from "@/lib/ui-styles";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id || props.name;

  return (
    <div className={formFieldSpacing}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {props.required && <span className="ml-0.5 normal-case text-red-400">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={formControlClass(error, className)}
        {...props}
      />
      {hint && !error && <p className="form-hint">{hint}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
