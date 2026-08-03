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
  })
  .strict()

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>
