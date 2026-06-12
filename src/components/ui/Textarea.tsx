import { cn } from "@/lib/utils";
import { formControlClass, formFieldSpacing } from "@/lib/ui-styles";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id || props.name;

  return (
    <div className={formFieldSpacing}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {props.required && <span className="ml-0.5 text-red-400">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          formControlClass(error, className),
          "min-h-[100px] resize-y py-2.5 leading-relaxed"
        )}
        {...props}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
