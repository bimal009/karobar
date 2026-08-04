import { createInsertSchema, createUpdateSchema } from "drizzle-orm/zod"
import { z } from "zod/v4"
import { storeLocation } from "../schemas"

export const storeLocationInsertSchema = createInsertSchema(storeLocation, {
  name: (schema) => schema.min(2).max(100),
  email: (schema) => schema.email().optional(),
  phone: (schema) => schema.max(30).optional(),
  manager: (schema) => schema.max(100).optional(),
  location: (schema) => schema.max(255).optional(),
  status: () => z.enum(["active", "inactive"]).optional(),
}).omit({
  id: true,
  storeId: true,
  createdAt: true,
  updatedAt: true,
})

export const storeLocationUpdateSchema = createUpdateSchema(storeLocation, {
  name: (schema) => schema.min(2).max(100),
  email: (schema) => schema.email().optional(),
  phone: (schema) => schema.max(30).optional(),
  manager: (schema) => schema.max(100).optional(),
  location: (schema) => schema.max(255).optional(),
  status: () => z.enum(["active", "inactive"]).optional(),
}).omit({
  id: true,
  storeId: true,
  createdAt: true,
  updatedAt: true,
})

export type StoreLocationInsert = z.infer<typeof storeLocationInsertSchema>
export type StoreLocationUpdate = z.infer<typeof storeLocationUpdateSchema>
