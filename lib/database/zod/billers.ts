import { createInsertSchema, createUpdateSchema } from "drizzle-orm/zod"
import { z } from "zod/v4"
import { biller } from "../schemas"

export const billerInsertSchema = createInsertSchema(biller, {
  name: (schema) => schema.min(2).max(100),
  email: (schema) => schema.email().optional(),
  phone: (schema) => schema.max(30).optional(),
  location: (schema) => schema.max(255).optional(),
  status: () => z.enum(["active", "inactive"]).optional(),
}).omit({
  id: true,
  storeId: true,
  createdAt: true,
  updatedAt: true,
})

export const billerUpdateSchema = createUpdateSchema(biller, {
  name: (schema) => schema.min(2).max(100),
  email: (schema) => schema.email().optional(),
  phone: (schema) => schema.max(30).optional(),
  location: (schema) => schema.max(255).optional(),
  status: () => z.enum(["active", "inactive"]).optional(),
}).omit({
  id: true,
  storeId: true,
  createdAt: true,
  updatedAt: true,
})

export type BillerInsert = z.infer<typeof billerInsertSchema>
export type BillerUpdate = z.infer<typeof billerUpdateSchema>
