import { createInsertSchema, createUpdateSchema } from "drizzle-orm/zod"
import { z } from "zod/v4"
import { store } from "../schemas"
import { CURRENCY_CODES } from "../../common/currencies"

export const storeInsertSchema = createInsertSchema(store, {
  name: (schema) => schema.min(2).max(100),
  slug: (schema) =>
    schema
      .min(2)
      .max(60)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  logo: (schema) => schema.url().optional(),
  country: (schema) => schema.min(2).max(100),
  currency: () => z.enum(CURRENCY_CODES),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
})

export const storeUpdateSchema = createUpdateSchema(store, {
  name: (schema) => schema.min(2).max(100),
  slug: (schema) =>
    schema
      .min(2)
      .max(60)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  logo: (schema) => schema.url().optional(),
  country: (schema) => schema.min(2).max(100),
  currency: () => z.enum(CURRENCY_CODES),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
})

export type StoreInsert = z.infer<typeof storeInsertSchema>
export type StoreUpdate = z.infer<typeof storeUpdateSchema>