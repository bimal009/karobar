import { createUpdateSchema } from "drizzle-orm/zod"
import { z } from "zod/v4"
import { plan } from "../schemas"

export const planInsertSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(255).optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

export const planUpdateSchema = planInsertSchema.partial()

export type PlanInsert = z.infer<typeof planInsertSchema>
export type PlanUpdate = z.infer<typeof planUpdateSchema>

export const planFeatureUpdateSchema = createUpdateSchema(plan).omit({
  id: true,
  name: true,
  description: true,
  isDefault: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
})

export type PlanFeatureUpdate = z.infer<typeof planFeatureUpdateSchema>

export const PLAN_FEATURE_GROUPS: { title: string; keys: (keyof PlanFeatureUpdate)[] }[] = [
  { title: "Branches", keys: ["canUseMultiBranch"] },
  { title: "POS", keys: ["canUsePos"] },
  { title: "Inventory", keys: ["canManageInventory"] },
  { title: "Suppliers", keys: ["canUseSuppliers"] },
  { title: "Warehouses", keys: ["canUseWarehouses"] },
  { title: "Customers", keys: ["canUseCustomers"] },
  { title: "Warranties", keys: ["canUseWarranties"] },
  { title: "Attributes", keys: ["canUseVariantAttributes", "canUseCustomAttributes"] },
  { title: "Printing", keys: ["canPrintBarcodes"] },
  { title: "Reports", keys: ["canViewReports"] },
  { title: "Team", keys: ["canInviteMembers"] },
  { title: "Integrations", keys: ["canUseApiAccess", "canExportData"] },
]
