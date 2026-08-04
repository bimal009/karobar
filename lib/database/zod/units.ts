import { z } from "zod/v4"

export const unitInsertSchema = z.object({
  name: z.string().min(2).max(100),
  shortName: z.string().min(1).max(20),
  status: z.enum(["active", "inactive"]).optional(),
})

export const unitUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  shortName: z.string().min(1).max(20).optional(),
  status: z.enum(["active", "inactive"]).optional(),
})

export type UnitInsert = z.infer<typeof unitInsertSchema>
export type UnitUpdate = z.infer<typeof unitUpdateSchema>
