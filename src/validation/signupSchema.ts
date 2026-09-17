import { z } from "zod";

export const signupSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(50, "First name cannot exceed 50 characters"),

  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name cannot exceed 50 characters"),

  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password cannot exceed 20 characters"),

  companyName: z
    .string()
    .trim()
    .min(1, "Company name is required")
    .max(100, "Company name cannot exceed 100 characters"),

  address: z
    .string()
    .trim()
    .min(1, "Address is required")
    .max(500, "Address cannot exceed 500 characters"),

  city: z
    .string()
    .trim()
    .min(1, "City is required")
    .max(50, "City cannot exceed 50 characters"),

  zip: z
    .string()
    .refine(
      (value) => value.length === 6,
      "Zip code must be 6 digits"
    ),

  industry: z
    .string()
    .trim()
    .max(50, "Industry cannot exceed 50 characters")
    .optional(),

  currencySymbol: z
    .string()
    .trim()
    .min(1, "Currency symbol is required")
    .max(5, "Currency symbol cannot exceed 5 characters"),
});

export type SignupFormData = z.infer<typeof signupSchema>;