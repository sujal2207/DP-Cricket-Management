import { z } from "zod";
import {
  CRICKET_CATEGORIES,
  MAX_CATEGORY_SELECTIONS,
  CAPTAINCY_INTEREST,
  JERSEY_SIZES,
  JERSEY_NUMBER_MIN,
  JERSEY_NUMBER_MAX,
  AGE_MIN,
  AGE_MAX,
} from "./constants";
import { gu } from "./translations/publicRegistrationGu";
import { sanitizeString } from "./sanitize";

const mobileRegex = /^(\+?[1-9]\d{6,14}|\d{10})$/;
const indianMobileRegex = /^\d{10}$/;
const digitsOnlyRegex = /^\d+$/;
const nameRegex = /^[\u0A80-\u0AFFa-zA-Z\s]{2,}$/;
const jerseyNameRegex = /^[\u0A80-\u0AFFa-zA-Z\s.'-]{2,30}$/;

const sanitizedString = z.string().transform(sanitizeString);

const jerseySizeSchema = z.enum(JERSEY_SIZES, {
  errorMap: () => ({ message: "Jersey size is required" }),
});

const jerseyNumberSchema = z.coerce
  .number({
    invalid_type_error: "Jersey number is required",
  })
  .int("Jersey number must be a whole number")
  .min(JERSEY_NUMBER_MIN, `Jersey number must be between ${JERSEY_NUMBER_MIN} and ${JERSEY_NUMBER_MAX}`)
  .max(JERSEY_NUMBER_MAX, `Jersey number must be between ${JERSEY_NUMBER_MIN} and ${JERSEY_NUMBER_MAX}`);

const jerseyNameSchema = sanitizedString.pipe(
  z
    .string()
    .min(2, "Jersey name must be at least 2 characters")
    .max(30, "Jersey name must be at most 30 characters")
    .regex(
      jerseyNameRegex,
      "Jersey name may only contain letters, spaces, and common name characters"
    )
);

const publicJerseySizeSchema = z.enum(JERSEY_SIZES, {
  errorMap: () => ({ message: gu.errors.jerseySizeRequired }),
});

const publicJerseyNumberSchema = z.coerce
  .number({
    invalid_type_error: gu.errors.jerseyNumberRequired,
  })
  .int(gu.errors.jerseyNumberInvalid)
  .min(JERSEY_NUMBER_MIN, gu.errors.jerseyNumberRange)
  .max(JERSEY_NUMBER_MAX, gu.errors.jerseyNumberRange);

const publicJerseyNameSchema = sanitizedString.pipe(
  z
    .string()
    .min(2, gu.errors.jerseyNameMin)
    .max(30)
    .regex(jerseyNameRegex, gu.errors.jerseyNameInvalid)
);

const ageSchema = z.coerce
  .number({
    invalid_type_error: "Age is required",
  })
  .int("Age must be a whole number")
  .min(AGE_MIN, `Age must be between ${AGE_MIN} and ${AGE_MAX}`)
  .max(AGE_MAX, `Age must be between ${AGE_MIN} and ${AGE_MAX}`);

const publicAgeSchema = z.coerce
  .number({
    invalid_type_error: gu.errors.ageRequired,
  })
  .int(gu.errors.ageInvalid)
  .min(AGE_MIN, gu.errors.ageRange)
  .max(AGE_MAX, gu.errors.ageRange);

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const cricketerSchema = z
  .object({
    first_name: sanitizedString.pipe(
      z.string().min(1, "First name is required").max(100)
    ),
    middle_name: sanitizedString.pipe(
      z.string().min(1, "Middle name is required").max(100)
    ),
    last_name: sanitizedString.pipe(
      z.string().min(1, "Last name is required").max(100)
    ),
    address: sanitizedString.pipe(
      z.string().min(1, "Full address is required").max(500)
    ),
    age: ageSchema,
    contact_number_1: z
      .string()
      .min(1, "Contact number 1 is required")
      .regex(mobileRegex, "Enter a valid mobile number (7-15 digits)"),
    contact_number_2: z
      .string()
      .regex(mobileRegex, "Enter a valid mobile number (7-15 digits)")
      .optional()
      .or(z.literal("")),
    jersey_size: jerseySizeSchema,
    jersey_number: jerseyNumberSchema,
    jersey_name: jerseyNameSchema,
    cricket_categories: z
      .array(z.enum(CRICKET_CATEGORIES))
      .min(1, "Select at least one cricket category")
      .max(
        MAX_CATEGORY_SELECTIONS,
        `You can select a maximum of ${MAX_CATEGORY_SELECTIONS} categories`
      ),
  })
  .refine(
    (data) => {
      if (!data.contact_number_2) return true;
      return data.contact_number_1 !== data.contact_number_2;
    },
    {
      message: "Contact numbers must be different",
      path: ["contact_number_2"],
    }
  );

export const publicCricketerSchema = z
  .object({
    first_name: sanitizedString.pipe(
      z
        .string()
        .min(2, gu.errors.firstNameMin)
        .max(100)
        .regex(nameRegex, gu.errors.nameInvalid)
    ),
    middle_name: sanitizedString.pipe(
      z
        .string()
        .min(2, gu.errors.middleNameMin)
        .max(100)
        .regex(nameRegex, gu.errors.nameInvalid)
    ),
    last_name: sanitizedString.pipe(
      z
        .string()
        .min(2, gu.errors.lastNameMin)
        .max(100)
        .regex(nameRegex, gu.errors.nameInvalid)
    ),
    address: sanitizedString.pipe(
      z
        .string()
        .min(10, gu.errors.addressMin)
        .max(500)
    ),
    age: publicAgeSchema,
    contact_number_1: sanitizedString.pipe(
      z
        .string()
        .min(1, gu.errors.mobileRequired)
        .regex(digitsOnlyRegex, gu.errors.mobileNumericOnly)
        .regex(indianMobileRegex, gu.errors.mobileInvalid)
    ),
    contact_number_2: z
      .union([
        z.literal(""),
        sanitizedString.pipe(
          z
            .string()
            .regex(digitsOnlyRegex, gu.errors.mobileNumericOnly)
            .regex(indianMobileRegex, gu.errors.mobileInvalid)
        ),
      ])
      .optional()
      .transform((v) => v ?? ""),
    jersey_size: publicJerseySizeSchema,
    jersey_number: publicJerseyNumberSchema,
    jersey_name: publicJerseyNameSchema,
    cricket_categories: z
      .array(z.enum(CRICKET_CATEGORIES))
      .min(1, gu.errors.categoryMin)
      .max(
        MAX_CATEGORY_SELECTIONS,
        gu.errors.categoryMax(MAX_CATEGORY_SELECTIONS)
      ),
    interested_in_captaincy: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (!data.contact_number_2) return true;
      return data.contact_number_1 !== data.contact_number_2;
    },
    {
      message: gu.errors.contactDifferent,
      path: ["contact_number_2"],
    }
  );

export const receiptRequestSchema = z.object({
  id: z.string().trim().min(1),
  contact_number_1: z
    .string()
    .trim()
    .regex(indianMobileRegex, gu.errors.mobileInvalid),
});

export type CricketerFormData = z.infer<typeof cricketerSchema>;
export type PublicCricketerFormData = z.infer<typeof publicCricketerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ReceiptRequestData = z.infer<typeof receiptRequestSchema>;

export function formatFullName(
  first: string,
  middle: string,
  last: string
): string {
  return [first, middle, last].filter(Boolean).join(" ");
}
