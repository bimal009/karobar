import { z } from "zod/v4"

export const supplierInsertSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  phone: z.string().max(30).optional(),
  location: z.string().max(255).optional(),
  totalDue: z.coerce.number().nonnegative().default(0),
  status: z.enum(["active", "inactive"]).optional(),
})

export const supplierUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(30).optional(),
  location: z.string().max(255).optional(),
  totalDue: z.coerce.number().nonnegative().optional(),
  status: z.enum(["active", "inactive"]).optional(),
})

export type SupplierInsert = z.infer<typeof supplierInsertSchema>
export type SupplierUpdate = z.infer<typeof supplierUpdateSchema>

/** Raw form field values before zod coerces totalDue to a number. */
export type SupplierFormInput = z.input<typeof supplierInsertSchema>
