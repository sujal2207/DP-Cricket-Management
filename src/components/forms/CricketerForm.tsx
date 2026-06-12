"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cricketerSchema, type CricketerFormData } from "@/lib/validation";
import { CRICKET_CATEGORIES, MAX_CATEGORY_SELECTIONS } from "@/lib/constants";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckboxGroup } from "@/components/ui/CheckboxGroup";
import { useToast } from "@/components/providers/ToastProvider";
import { useState } from "react";

interface CricketerFormProps {
  initialData?: CricketerFormData & { _id?: string };
  onSuccess?: () => void;
  mode?: "create" | "edit";
}

const defaultValues: CricketerFormData = {
  first_name: "",
  middle_name: "",
  last_name: "",
  address: "",
  contact_number_1: "",
  contact_number_2: "",
  cricket_categories: [],
};

export function CricketerForm({
  initialData,
  onSuccess,
  mode = "create",
}: CricketerFormProps) {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CricketerFormData>({
    resolver: zodResolver(cricketerSchema),
    defaultValues: initialData || defaultValues,
  });

  const selectedCategories = watch("cricket_categories") || [];

  const toggleCategory = (category: (typeof CRICKET_CATEGORIES)[number]) => {
    const current = selectedCategories;
    if (current.includes(category)) {
      setValue(
        "cricket_categories",
        current.filter((c) => c !== category),
        { shouldValidate: true }
      );
    } else if (current.length < MAX_CATEGORY_SELECTIONS) {
      setValue("cricket_categories", [...current, category], {
        shouldValidate: true,
      });
    } else {
      showToast(
        `You can select a maximum of ${MAX_CATEGORY_SELECTIONS} categories`,
        "error"
      );
    }
  };

  const onSubmit = async (data: CricketerFormData) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const url =
        mode === "edit" && initialData?._id
          ? `/api/cricketers/${initialData._id}`
          : "/api/cricketers";
      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        const msg =
          result.error ||
          result.details?.fieldErrors?.cricket_categories?.[0] ||
          "Submission failed";
        showToast(msg, "error");
        return;
      }

      showToast(
        mode === "edit"
          ? "Cricketer updated successfully"
          : "Cricketer registered successfully",
        "success"
      );
      onSuccess?.();
    } catch {
      showToast("An unexpected error occurred", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card title="Personal Information" description="Enter the player's personal details">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="First Name"
            required
            {...register("first_name")}
            error={errors.first_name?.message}
          />
          <Input
            label="Middle Name"
            required
            {...register("middle_name")}
            error={errors.middle_name?.message}
          />
          <Input
            label="Last Name"
            required
            {...register("last_name")}
            error={errors.last_name?.message}
          />
        </div>
        <div className="mt-4">
          <Textarea
            label="Full Address"
            required
            rows={3}
            {...register("address")}
            error={errors.address?.message}
          />
        </div>
      </Card>

      <Card title="Contact Information" description="Primary and optional secondary contact">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Contact Number 1"
            required
            type="tel"
            placeholder="e.g. 9876543210"
            {...register("contact_number_1")}
            error={errors.contact_number_1?.message}
          />
          <Input
            label="Contact Number 2"
            type="tel"
            placeholder="Optional"
            {...register("contact_number_2")}
            error={errors.contact_number_2?.message}
          />
        </div>
      </Card>

      <Card
        title="Cricket Category Selection"
        description={`Select 1 to ${MAX_CATEGORY_SELECTIONS} categories`}
      >
        <CheckboxGroup
          label="Cricket Categories"
          options={CRICKET_CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
          selected={selectedCategories}
          onToggle={(cat) => toggleCategory(cat as (typeof CRICKET_CATEGORIES)[number])}
          maxSelections={MAX_CATEGORY_SELECTIONS}
          error={errors.cricket_categories?.message}
        />
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" loading={submitting} size="lg">
          {mode === "edit" ? "Update Cricketer" : "Register Cricketer"}
        </Button>
      </div>
    </form>
  );
}
