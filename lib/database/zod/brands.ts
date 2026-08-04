import { z } from "zod/v4"

export const brandInsertSchema = z.object({
  name: z.string().min(2).max(100),
  status: z.enum(["active", "inactive"]).optional(),
})

export const brandUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  status: z.enum(["active", "inactive"]).optional(),
})

export type BrandInsert = z.infer<typeof brandInsertSchema>
export type BrandUpdate = z.infer<typeof brandUpdateSchema>
