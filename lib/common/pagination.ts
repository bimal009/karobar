import { asc, desc, type Column } from "drizzle-orm"
import { z } from "zod"

export const MetaSchema = z
  .object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1).max(100),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  })
  .strict()

export type Meta = z.infer<typeof MetaSchema>

export const SortOrderSchema = z.enum(["asc", "desc"])

export type SortOrder = z.infer<typeof SortOrderSchema>

export const PaginationQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z
      .string()
      .trim()
      .min(1)
      .max(255)
      .optional()
      .transform((value) => (value === "" ? undefined : value)),
    sortBy: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .optional()
      .transform((value) => (value === "" ? undefined : value)),
    sortOrder: SortOrderSchema.default("desc"),
  })
  .strict()

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>

/**
 * Maps a client-supplied `sortBy` string to a whitelisted drizzle column so sort
 * input can never reach the query builder as anything but a known column.
 */
export function resolveSortColumn<T extends Record<string, Column>>(
  sortableColumns: T,
  sortBy: string | undefined,
  fallback: keyof T,
  sortOrder: SortOrder
) {
  const key = sortBy && sortBy in sortableColumns ? (sortBy as keyof T) : fallback
  const column = sortableColumns[key]
  return sortOrder === "asc" ? asc(column) : desc(column)
}
