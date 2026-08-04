import { createInsertSchema, createUpdateSchema } from "drizzle-orm/zod"
import { z } from "zod/v4"
import { customer } from "../schemas"

export const customerInsertSchema = createInsertSchema(customer, {
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

export const customerUpdateSchema = createUpdateSchema(customer, {
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

export type CustomerInsert = z.infer<typeof customerInsertSchema>
export type CustomerUpdate = z.infer<typeof customerUpdateSchema>
