import { z } from "zod";
import { normalizeCloseDate } from "@/lib/registration-window";

export const registrationExpirySchema = z.object({
  registration_closes_on: z
    .union([z.literal(""), z.null(), z.string()])
    .transform((value) => normalizeCloseDate(value ?? null))
    .refine(
      (value) => value === null || /^\d{4}-\d{2}-\d{2}$/.test(value),
      "Enter a valid date (YYYY-MM-DD)"
    ),
});

export type RegistrationExpiryInput = z.infer<typeof registrationExpirySchema>;
