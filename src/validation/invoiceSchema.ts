import { z } from "zod";

export const invoiceLineSchema = z.object({
  rowNo: z.number().optional(),
  itemID: z.number().min(1, "Item is required"),
  description: z.string().trim().min(1, "Description is required").max(500, "Description cannot exceed 500 characters"),
  quantity: z.number().min(1, "Quantity must be greater than 0"),
  rate: z
    .number()
    .min(0, "Rate must be greater than or equal to 0")
    .refine(
      (val) => Number(val.toFixed(2)) === val,
      "Rate can have a maximum of 2 decimal places"
    ),
  discountPct: z
    .number()
    .min(0, "Discount must be greater than or equal to 0")
    .max(100, "Discount cannot exceed 100")
    .default(0),
});

export const invoiceEditorSchema = z.object({
  invoiceNo: z
    .number()
    .min(1, "Invoice number is required"),

  invoiceDate: z
    .string()
    .refine(
      (val) => !isNaN(Date.parse(val)),
      "Invoice date must be a valid date"
    ),

  customerName: z
    .string()
    .trim()
    .min(1, "Customer name is required")
    .max(50, "Customer name cannot exceed 50 characters"),

  address: z
    .string()
    .trim()
    .max(500, "Address cannot exceed 500 characters"),

  city: z
    .string()
    .trim()
    .max(50, "City cannot exceed 50 characters"),

  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters"),

  lines: z
    .array(invoiceLineSchema)
    .min(1, "Invoice must have at least one line")
    .refine(
      (lines) => lines.some((line) => (line.quantity || 0) > 0),
      "Invoice must have at least one line with quantity > 0"
    ),

  taxPercentage: z
    .number()
    .min(0, "Tax percentage must be greater than or equal to 0")
    .max(100, "Tax percentage cannot exceed 100"),

  taxAmount: z
    .number()
    .min(0, "Tax amount must be greater than or equal to 0"),
});

export type InvoiceLineFormData = z.infer<typeof invoiceLineSchema>;
export type InvoiceEditorFormData = z.infer<typeof invoiceEditorSchema>;
