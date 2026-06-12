import { z } from "zod";

export const addAdminSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password is too long"),
});

export type AddAdminFormData = z.infer<typeof addAdminSchema>;
