import { z } from "zod/v4"

export const productInsertSchema = z.object({
  name: z.string().min(2).max(200),
  sku: z.string().min(1).max(50),
  barcode: z.string().max(50).optional(),
  image: z.string().url().optional(),
  categoryId: z.string().uuid(),
  subCategoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  unitId: z.string().uuid().optional(),
  warrantyId: z.string().uuid().optional(),
  price: z.coerce.number().nonnegative(),
  cost: z.coerce.number().nonnegative(),
  quantity: z.coerce.number().int().nonnegative().default(0),
  lowStockThreshold: z.coerce.number().int().nonnegative().default(0),
  expiryDate: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  customAttributeValues: z
    .array(z.object({ attributeId: z.string().uuid(), value: z.string().min(1) }))
    .optional(),
})

export const productUpdateSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  sku: z.string().min(1).max(50).optional(),
  barcode: z.string().max(50).optional(),
  image: z.string().url().optional(),
  categoryId: z.string().uuid().optional(),
  subCategoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  unitId: z.string().uuid().optional(),
  warrantyId: z.string().uuid().optional(),
  price: z.coerce.number().nonnegative().optional(),
  cost: z.coerce.number().nonnegative().optional(),
  quantity: z.coerce.number().int().nonnegative().optional(),
  lowStockThreshold: z.coerce.number().int().nonnegative().optional(),
  expiryDate: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  customAttributeValues: z
    .array(z.object({ attributeId: z.string().uuid(), value: z.string().min(1) }))
    .optional(),
})

export type ProductInsert = z.infer<typeof productInsertSchema>
export type ProductUpdate = z.infer<typeof productUpdateSchema>

/** Raw form field values before zod coerces price/cost/quantity/lowStockThreshold to numbers. */
export type ProductFormInput = z.input<typeof productInsertSchema>
