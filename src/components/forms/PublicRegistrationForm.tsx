"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  publicCricketerSchema,
  type PublicCricketerFormData,
} from "@/lib/validation";
import { CRICKET_CATEGORIES, MAX_CATEGORY_SELECTIONS, JERSEY_SIZES } from "@/lib/constants";
import { gu } from "@/lib/translations/publicRegistrationGu";
import { Button } from "@/components/ui/Button";
import { PublicFormCard } from "@/components/forms/public/PublicFormCard";
import {
  PublicFormInput,
  stripToDigits,
  stripJerseyNumber,
  blockNonNumericKey,
} from "@/components/forms/public/PublicFormInput";
import { PublicFormTextarea } from "@/components/forms/public/PublicFormTextarea";
import { PublicFormSelect } from "@/components/forms/public/PublicFormSelect";
import { PublicCheckboxGroup } from "@/components/forms/public/PublicCheckboxGroup";
import { cn } from "@/lib/utils";
import {
  RegistrationSuccess,
  type RegistrationResult,
} from "@/components/forms/RegistrationSuccess";
import { useToast } from "@/components/providers/ToastProvider";

const defaultValues = {
  first_name: "",
  middle_name: "",
  last_name: "",
  address: "",
  contact_number_1: "",
  contact_number_2: "",
  jersey_size: "",
  jersey_number: "",
  jersey_name: "",
  cricket_categories: [],
  interested_in_captaincy: false,
} as unknown as PublicCricketerFormData;

const jerseySizeOptions = JERSEY_SIZES.map((size) => ({
  value: size,
  label: size,
}));

export function PublicRegistrationForm() {
  const { showToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [csrfToken, setCsrfToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const [categoryError, setCategoryError] = useState("");

  const categoryOptions = useMemo(
    () =>
      CRICKET_CATEGORIES.map((cat) => ({
        value: cat,
        label: gu.categories[cat],
      })),
    []
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<PublicCricketerFormData>({
    resolver: zodResolver(publicCricketerSchema),
    defaultValues,
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const selectedCategories = watch("cricket_categories") || [];

  useEffect(() => {
    fetch("/api/public/csrf")
      .then((r) => r.json())
      .then((d) => setCsrfToken(d.token))
      .catch(() => {});
  }, []);

  const scrollToFirstError = () => {
    requestAnimationFrame(() => {
      const firstError = formRef.current?.querySelector(
        '[aria-invalid="true"], .text-red-600'
      );
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const toggleCategory = (category: (typeof CRICKET_CATEGORIES)[number]) => {
    const current = selectedCategories;
    if (current.includes(category)) {
      setValue(
        "cricket_categories",
        current.filter((c) => c !== category),
        { shouldValidate: true }
      );
      setCategoryError("");
    } else if (current.length < MAX_CATEGORY_SELECTIONS) {
      setValue("cricket_categories", [...current, category], {
        shouldValidate: true,
      });
      setCategoryError("");
    } else {
      setCategoryError(gu.form.maxCategoryError(MAX_CATEGORY_SELECTIONS));
    }
  };

  const onInvalid = () => {
    showToast(gu.errors.validationFailed, "error");
    scrollToFirstError();
  };

  const onSubmit = async (data: PublicCricketerFormData) => {
    if (submitting || !csrfToken) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/public/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        const msg = json.error || gu.errors.submissionFailed;
        showToast(msg, "error");
        setCategoryError(json.details?.fieldErrors?.cricket_categories?.[0] || "");
        scrollToFirstError();
        return;
      }

      setResult(json.data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      showToast(gu.errors.unexpected, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    reset(defaultValues);
    setResult(null);
    setCategoryError("");
    fetch("/api/public/csrf")
      .then((r) => r.json())
      .then((d) => setCsrfToken(d.token));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (result) {
    return <RegistrationSuccess data={result} onReset={handleReset} />;
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="space-y-5 sm:space-y-6"
      noValidate
    >
      <PublicFormCard title={gu.form.personalInfo}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <PublicFormInput
            label={gu.form.firstName}
            required
            autoComplete="given-name"
            aria-invalid={!!errors.first_name}
            {...register("first_name")}
            error={errors.first_name?.message}
          />
          <PublicFormInput
            label={gu.form.middleName}
            required
            autoComplete="additional-name"
            aria-invalid={!!errors.middle_name}
            {...register("middle_name")}
            error={errors.middle_name?.message}
          />
          <PublicFormInput
            label={gu.form.lastName}
            required
            autoComplete="family-name"
            aria-invalid={!!errors.last_name}
            className="sm:col-span-2 lg:col-span-1"
            {...register("last_name")}
            error={errors.last_name?.message}
          />
        </div>
        <div className="mt-4">
          <PublicFormTextarea
            label={gu.form.fullAddress}
            required
            rows={3}
            aria-invalid={!!errors.address}
            {...register("address")}
            error={errors.address?.message}
          />
        </div>
      </PublicFormCard>

      <PublicFormCard title={gu.form.contactInfo}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="contact_number_1"
            control={control}
            render={({ field }) => (
              <PublicFormInput
                label={gu.form.contact1}
                required
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="tel"
                placeholder={gu.form.contact1Placeholder}
                maxLength={10}
                aria-invalid={!!errors.contact_number_1}
                value={field.value}
                onKeyDown={blockNonNumericKey}
                onChange={(e) => {
                  field.onChange(stripToDigits(e.target.value, 10));
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const text = e.clipboardData.getData("text");
                  field.onChange(stripToDigits(text, 10));
                }}
                error={errors.contact_number_1?.message}
                hint={gu.form.contact1Placeholder}
              />
            )}
          />
          <Controller
            name="contact_number_2"
            control={control}
            render={({ field }) => (
              <PublicFormInput
                label={gu.form.contact2}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="tel"
                placeholder={gu.form.contact2Placeholder}
                maxLength={10}
                aria-invalid={!!errors.contact_number_2}
                value={field.value || ""}
                onKeyDown={blockNonNumericKey}
                onChange={(e) => {
                  field.onChange(stripToDigits(e.target.value, 10));
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const text = e.clipboardData.getData("text");
                  field.onChange(stripToDigits(text, 10));
                }}
                error={errors.contact_number_2?.message}
              />
            )}
          />
        </div>
      </PublicFormCard>

      <PublicFormCard title={gu.form.jerseyTitle}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="jersey_size"
            control={control}
            render={({ field }) => (
              <PublicFormSelect
                label={gu.form.jerseySize}
                required
                placeholder={gu.form.jerseySizePlaceholder}
                options={jerseySizeOptions}
                aria-invalid={!!errors.jersey_size}
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                name={field.name}
                error={errors.jersey_size?.message}
              />
            )}
          />
          <Controller
            name="jersey_number"
            control={control}
            render={({ field }) => (
              <PublicFormInput
                label={gu.form.jerseyNumber}
                required
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={gu.form.jerseyNumberPlaceholder}
                maxLength={2}
                aria-invalid={!!errors.jersey_number}
                value={field.value === undefined || field.value === null ? "" : String(field.value)}
                onKeyDown={blockNonNumericKey}
                onChange={(e) => {
                  field.onChange(stripJerseyNumber(e.target.value));
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  field.onChange(stripJerseyNumber(e.clipboardData.getData("text")));
                }}
                onBlur={field.onBlur}
                name={field.name}
                error={errors.jersey_number?.message}
                hint={gu.form.jerseyNumberPlaceholder}
              />
            )}
          />
        </div>
        <div className="mt-4">
          <PublicFormInput
            label={gu.form.jerseyName}
            required
            autoComplete="nickname"
            placeholder={gu.form.jerseyNamePlaceholder}
            aria-invalid={!!errors.jersey_name}
            {...register("jersey_name")}
            error={errors.jersey_name?.message}
          />
        </div>
      </PublicFormCard>

      <PublicFormCard title={gu.form.categoryTitle}>
        <PublicCheckboxGroup
          label={gu.form.categoryLabel}
          description={gu.form.categoryDescription(MAX_CATEGORY_SELECTIONS)}
          options={categoryOptions}
          selected={selectedCategories}
          onToggle={(opt) => toggleCategory(opt as (typeof CRICKET_CATEGORIES)[number])}
          maxSelections={MAX_CATEGORY_SELECTIONS}
          selectedLabel={gu.form.categorySelected}
          error={categoryError || errors.cricket_categories?.message}
        />
      </PublicFormCard>

      <PublicFormCard title={gu.form.capacityTitle}>
        <Controller
          name="interested_in_captaincy"
          control={control}
          render={({ field }) => (
            <label
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border p-4 shadow-sm transition-all",
                field.value
                  ? "border-brand-500 bg-brand-50/80 ring-1 ring-brand-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm font-medium text-slate-800">{gu.form.captaincy}</span>
            </label>
          )}
        />
      </PublicFormCard>

      <div className="flex flex-col items-center gap-3 pt-2">
        <Button
          type="submit"
          size="lg"
          loading={submitting}
          disabled={!csrfToken}
          className="w-full min-w-0 sm:w-auto sm:min-w-[280px]"
        >
          {gu.form.submit}
        </Button>
        {!csrfToken && !submitting && (
          <p className="text-xs text-slate-500">{gu.form.loading}</p>
        )}
      </div>
    </form>
  );
}
