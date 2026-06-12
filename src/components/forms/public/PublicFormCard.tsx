import { cn } from "@/lib/utils";

interface PublicFormCardProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export function PublicFormCard({
  children,
  title,
  description,
  className,
}: PublicFormCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50",
        className
      )}
    >
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-slate-900 sm:text-lg">{title}</h2>
        {description && (
          <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
        )}
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  );
}
