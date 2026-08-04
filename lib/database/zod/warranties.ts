import { z } from "zod/v4"

export const warrantyInsertSchema = z.object({
  name: z.string().min(2).max(100),
  duration: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
  status: z.enum(["active", "inactive"]).optional(),
})

export const warrantyUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  duration: z.string().min(1).max(50).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(["active", "inactive"]).optional(),
})

export type WarrantyInsert = z.infer<typeof warrantyInsertSchema>
export type WarrantyUpdate = z.infer<typeof warrantyUpdateSchema>
