import { z } from "zod";
import { normalizeGujaratiText } from "@/lib/gujarati-normalize";

const gujaratiField = (schema: z.ZodString) =>
  z.string().transform(normalizeGujaratiText).pipe(schema);

export const registrationBrandingSchema = z.object({
  organization_name_gu: gujaratiField(
    z.string().min(2, "Organization name is required").max(200)
  ),
  tournament_year: z
    .string()
    .regex(/^\d{4}$/, "Enter a valid 4-digit year"),
  tournament_title_gu: gujaratiField(
    z.string().min(10, "Tournament title is required").max(500)
  ),
  tournament_short_gu: gujaratiField(
    z.string().min(5, "Short tournament name is required").max(300)
  ),
  form_subtitle_gu: gujaratiField(
    z.string().min(5, "Form subtitle is required").max(300)
  ),
  hero_description_gu: gujaratiField(
    z.string().min(10, "Hero description is required").max(1000)
  ),
  availability_notice_gu: gujaratiField(
    z.string().min(10, "Availability notice is required").max(1000)
  ),
  fee_notice_gu: gujaratiField(
    z.string().min(10, "Fee notice is required").max(1000)
  ),
});

export type RegistrationBrandingInput = z.infer<typeof registrationBrandingSchema>;
