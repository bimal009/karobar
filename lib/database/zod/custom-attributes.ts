import { z } from "zod/v4"

export const customAttributeInsertSchema = z.object({
  name: z.string().min(2).max(100),
  values: z.array(z.string().min(1).max(50)).min(1, "Add at least one value"),
  status: z.enum(["active", "inactive"]).optional(),
})

export const customAttributeUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  values: z.array(z.string().min(1).max(50)).min(1, "Add at least one value").optional(),
  status: z.enum(["active", "inactive"]).optional(),
})

export type CustomAttributeInsert = z.infer<typeof customAttributeInsertSchema>
export type CustomAttributeUpdate = z.infer<typeof customAttributeUpdateSchema>
