import { createInsertSchema, createUpdateSchema } from "drizzle-orm/zod"
import { z } from "zod/v4"
import { branch } from "../schemas"

export const branchInsertSchema = createInsertSchema(branch, {
  name: (schema) => schema.min(2).max(100),
  code: (schema) => schema.min(1).max(20),
  phone: (schema) => schema.max(30).optional(),
  email: (schema) => schema.email().optional(),
  address: (schema) => schema.max(255).optional(),
  city: (schema) => schema.max(100).optional(),
  state: (schema) => schema.max(100).optional(),
  country: (schema) => schema.max(100).optional(),
  postalCode: (schema) => schema.max(20).optional(),
  status: () => z.enum(["active", "inactive"]).optional(),
}).omit({
  id: true,
  storeId: true,
  createdAt: true,
  updatedAt: true,
})

export const branchUpdateSchema = createUpdateSchema(branch, {
  name: (schema) => schema.min(2).max(100),
  code: (schema) => schema.min(1).max(20),
  phone: (schema) => schema.max(30).optional(),
  email: (schema) => schema.email().optional(),
  address: (schema) => schema.max(255).optional(),
  city: (schema) => schema.max(100).optional(),
  state: (schema) => schema.max(100).optional(),
  country: (schema) => schema.max(100).optional(),
  postalCode: (schema) => schema.max(20).optional(),
  status: () => z.enum(["active", "inactive"]).optional(),
}).omit({
  id: true,
  storeId: true,
  createdAt: true,
  updatedAt: true,
})

export type BranchInsert = z.infer<typeof branchInsertSchema>
export type BranchUpdate = z.infer<typeof branchUpdateSchema>
