import { z } from "zod";

export const itemEditorSchema = z.object({
  itemName: z
    .string()
    .trim()
    .min(1, "Item name is required")
    .max(50, "Item name cannot exceed 50 characters"),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters"),

  saleRate: z
    .number()
    .min(0, "Sale rate must be greater than or equal to 0")
    .max(999999.99, "Sale rate is too large")
    .refine(
      (val) => Number(val.toFixed(2)) === val,
      "Sale rate can have a maximum of 2 decimal places"
    ),

  discountPct: z
    .number()
    .min(0, "Discount percentage must be greater than or equal to 0")
    .max(100, "Discount percentage cannot exceed 100"),
});

export type ItemEditorFormData = z.infer<typeof itemEditorSchema>;
