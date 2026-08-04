import { z } from "zod/v4"

export const subCategoryInsertSchema = z.object({
  name: z.string().min(2).max(100),
  categoryId: z.string().uuid(),
  status: z.enum(["active", "inactive"]).optional(),
})

export const subCategoryUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  categoryId: z.string().uuid().optional(),
  status: z.enum(["active", "inactive"]).optional(),
})

export type SubCategoryInsert = z.infer<typeof subCategoryInsertSchema>
export type SubCategoryUpdate = z.infer<typeof subCategoryUpdateSchema>
