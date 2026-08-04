import { z } from "zod/v4"

export const categoryInsertSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
  status: z.enum(["active", "inactive"]).optional(),
})

export const categoryUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(100).optional(),
  status: z.enum(["active", "inactive"]).optional(),
})

export type CategoryInsert = z.infer<typeof categoryInsertSchema>
export type CategoryUpdate = z.infer<typeof categoryUpdateSchema>
