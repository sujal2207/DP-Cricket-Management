"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, Save, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import {
  registrationBrandingSchema,
  type RegistrationBrandingInput,
} from "@/lib/registration-branding-validation";
import {
  buildBrandingFormDefaults,
  type RegistrationBrandingData,
} from "@/lib/registration-branding-types";

function BrandingTextarea({
  label,
  hint,
  error,
  rows = 3,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {hint && <p className="form-hint mb-2">{hint}</p>}
      <textarea
        {...props}
        rows={rows}
        className="form-control min-h-[88px] resize-y py-3 leading-relaxed"
      />
      {error && <p className="form-error mt-1.5">{error}</p>}
    </div>
  );
}

export function RegistrationBrandingPanel() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<RegistrationBrandingInput>({
    resolver: zodResolver(registrationBrandingSchema),
  });

  const applyBranding = useCallback(
    (data: RegistrationBrandingData) => {
      reset(buildBrandingFormDefaults(data));
      setUpdatedAt(data.updatedAt);
    },
    [reset]
  );

  const fetchBranding = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/registration-branding");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      applyBranding(data);
    } catch {
      showToast("Failed to load registration branding", "error");
    } finally {
      setLoading(false);
    }
  }, [applyBranding, showToast]);

  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  const onSubmit = async (formData: RegistrationBrandingInput) => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/registration-branding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      applyBranding(data);
      showToast("Registration form text updated successfully", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to save branding",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      elevated
      title="Public Registration Form (Gujarati)"
      description="Manage tournament title, notices, and footer text shown on the public registration page. Changes are saved to the database."
    >
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-brand-500/20 bg-brand-500/5 p-4">
        <Globe className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Edit Gujarati text carefully. Use correct spelling{" "}
          <span className="font-medium text-[hsl(var(--foreground))]">
            ટુર્નામેન્ટ
          </span>{" "}
          everywhere. The registration form loads these values from the database.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-[hsl(var(--muted))]"
            />
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Organization Name (Gujarati)"
              error={errors.organization_name_gu?.message}
              {...register("organization_name_gu")}
            />
            <Input
              label="Tournament Year"
              error={errors.tournament_year?.message}
              {...register("tournament_year")}
            />
          </div>

          <BrandingTextarea
            label="Hero Title (Main Heading)"
            hint="Example: ઢuંઢIYા પીપળIYા દ્વારા આયોજિત ઢuંઢIYા પીપળIYા ક્રિકેટ ટuર્નામેن્ટ 2026"
            rows={3}
            error={errors.tournament_title_gu?.message}
            {...register("tournament_title_gu")}
          />

          <BrandingTextarea
            label="Short Tournament Name"
            hint="Used in hero badge and page title"
            rows={2}
            error={errors.tournament_short_gu?.message}
            {...register("tournament_short_gu")}
          />

          <BrandingTextarea
            label="Form Subtitle (Header)"
            hint="Shown below organization name in the page header"
            rows={2}
            error={errors.form_subtitle_gu?.message}
            {...register("form_subtitle_gu")}
          />

          <BrandingTextarea
            label="Hero Description"
            hint="Short instruction text below the main heading"
            rows={3}
            error={errors.hero_description_gu?.message}
            {...register("hero_description_gu")}
          />

          <BrandingTextarea
            label="Availability Notice (Footer)"
            rows={3}
            error={errors.availability_notice_gu?.message}
            {...register("availability_notice_gu")}
          />

          <BrandingTextarea
            label="Tournament Fee Notice (Footer)"
            rows={3}
            error={errors.fee_notice_gu?.message}
            {...register("fee_notice_gu")}
          />

          <div className="flex flex-col gap-3 border-t border-[hsl(var(--border))] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-[hsl(var(--muted-foreground))]">
              {updatedAt
                ? `Last updated: ${new Date(updatedAt).toLocaleString()}`
                : "Not saved yet"}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={fetchBranding}
                disabled={saving}
              >
                <RefreshCw className="h-4 w-4" />
                Reload
              </Button>
              <Button type="submit" disabled={saving || !isDirty}>
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Card>
  );
}
