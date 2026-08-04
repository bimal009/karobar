import { z } from "zod/v4"

export const orderItemInputSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  price: z.coerce.number().nonnegative(),
})

export const orderInsertSchema = z.object({
  customerId: z.string().uuid().optional(),
  billerId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  paymentMethod: z.enum(["cash", "card", "wallet"]),
  items: z.array(orderItemInputSchema).min(1),
  subtotal: z.coerce.number().nonnegative(),
  discount: z.coerce.number().nonnegative().default(0),
  tax: z.coerce.number().nonnegative().default(0),
  total: z.coerce.number().nonnegative(),
})

export type OrderItemInput = z.infer<typeof orderItemInputSchema>
export type OrderInsertInput = z.infer<typeof orderInsertSchema>
