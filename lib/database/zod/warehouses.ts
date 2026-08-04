import { createInsertSchema, createUpdateSchema } from "drizzle-orm/zod"
import { z } from "zod/v4"
import { warehouse } from "../schemas"

export const warehouseInsertSchema = createInsertSchema(warehouse, {
  name: (schema) => schema.min(2).max(100),
  email: (schema) => schema.email().optional(),
  phone: (schema) => schema.max(30).optional(),
  contactPerson: (schema) => schema.max(100).optional(),
  location: (schema) => schema.max(255).optional(),
  status: () => z.enum(["active", "inactive"]).optional(),
}).omit({
  id: true,
  storeId: true,
  createdAt: true,
  updatedAt: true,
})

export const warehouseUpdateSchema = createUpdateSchema(warehouse, {
  name: (schema) => schema.min(2).max(100),
  email: (schema) => schema.email().optional(),
  phone: (schema) => schema.max(30).optional(),
  contactPerson: (schema) => schema.max(100).optional(),
  location: (schema) => schema.max(255).optional(),
  status: () => z.enum(["active", "inactive"]).optional(),
}).omit({
  id: true,
  storeId: true,
  createdAt: true,
  updatedAt: true,
})

export type WarehouseInsert = z.infer<typeof warehouseInsertSchema>
export type WarehouseUpdate = z.infer<typeof warehouseUpdateSchema>
