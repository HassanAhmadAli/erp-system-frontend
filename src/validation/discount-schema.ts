import { z } from "zod"

export const discountSchema = z
  .object({
    name: z.string().min(2),

    type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    scope: z.enum(["GLOBAL", "CATEGORY", "PRODUCT", "CUSTOMER"]),

    value: z.string().min(1), // IMPORTANT

    // Scope-specific targets (validated against scope below)
    categoryId: z.string().optional(),
    productId: z.string().optional(),

    maxInvoiceValue: z.string().optional(),
    maxUses: z.string().optional(),

    startDate: z.string(),
    endDate: z.string().optional(),

    isActive: z.boolean().default(true),
  })
  .refine((data) => data.scope !== "CATEGORY" || !!data.categoryId, {
    message: "يرجى اختيار التصنيف",
    path: ["categoryId"],
  })
  .refine((data) => data.scope !== "PRODUCT" || !!data.productId, {
    message: "يرجى اختيار المنتج",
    path: ["productId"],
  })
