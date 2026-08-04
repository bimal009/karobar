import { z } from "zod/v4"

export const stockAdjustmentSchema = z.object({
  branchId: z.string().uuid(),
  productId: z.string().uuid(),
  quantityChange: z.coerce.number().int(),
  reason: z.string().max(255).optional(),
})

export const stockTransferSchema = z.object({
  productId: z.string().uuid(),
  fromBranchId: z.string().uuid(),
  toBranchId: z.string().uuid(),
  quantity: z.coerce.number().int().positive(),
  reason: z.string().max(255).optional(),
})

export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>
export type StockTransferInput = z.infer<typeof stockTransferSchema>

/** Raw form field values before zod coerces quantityChange to a number. */
export type StockAdjustmentFormInput = z.input<typeof stockAdjustmentSchema>
/** Raw form field values before zod coerces quantity to a number. */
export type StockTransferFormInput = z.input<typeof stockTransferSchema>
