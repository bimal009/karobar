import { createUpdateSchema } from "drizzle-orm/zod"
import { z } from "zod/v4"
import { storeRole } from "../schemas"

export const roleInsertSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(255).optional(),
})

export const roleUpdateSchema = roleInsertSchema.partial()

export type RoleInsert = z.infer<typeof roleInsertSchema>
export type RoleUpdate = z.infer<typeof roleUpdateSchema>

export const permissionUpdateSchema = createUpdateSchema(storeRole).omit({
  id: true,
  storeId: true,
  name: true,
  description: true,
  isSystem: true,
  createdAt: true,
  updatedAt: true,
})

export type PermissionUpdate = z.infer<typeof permissionUpdateSchema>

export const PERMISSION_GROUPS: { title: string; keys: (keyof PermissionUpdate)[] }[] = [
  { title: "Overview", keys: ["canViewDashboard", "canUsePos"] },
  {
    title: "Branches",
    keys: ["canViewBranches", "canCreateBranches", "canEditBranches", "canDeleteBranches"],
  },
  {
    title: "Members",
    keys: ["canViewMembers", "canInviteMembers", "canEditMembers", "canDeleteMembers"],
  },
  {
    title: "Products",
    keys: ["canViewProducts", "canCreateProducts", "canEditProducts", "canDeleteProducts"],
  },
  {
    title: "Categories",
    keys: ["canViewCategories", "canCreateCategories", "canEditCategories", "canDeleteCategories"],
  },
  {
    title: "Sub Categories",
    keys: [
      "canViewSubCategories",
      "canCreateSubCategories",
      "canEditSubCategories",
      "canDeleteSubCategories",
    ],
  },
  { title: "Brands", keys: ["canViewBrands", "canCreateBrands", "canEditBrands", "canDeleteBrands"] },
  { title: "Units", keys: ["canViewUnits", "canCreateUnits", "canEditUnits", "canDeleteUnits"] },
  {
    title: "Variant Attributes",
    keys: [
      "canViewVariantAttributes",
      "canCreateVariantAttributes",
      "canEditVariantAttributes",
      "canDeleteVariantAttributes",
    ],
  },
  {
    title: "Custom Attributes",
    keys: [
      "canViewCustomAttributes",
      "canCreateCustomAttributes",
      "canEditCustomAttributes",
      "canDeleteCustomAttributes",
    ],
  },
  {
    title: "Warranties",
    keys: ["canViewWarranties", "canCreateWarranties", "canEditWarranties", "canDeleteWarranties"],
  },
  { title: "Stock Alerts", keys: ["canViewExpiredProducts", "canViewLowStocks"] },
  { title: "Stock", keys: ["canManageStock", "canAdjustStock", "canTransferStock"] },
  { title: "Printing", keys: ["canPrintBarcode", "canPrintQrCode"] },
  {
    title: "Customers",
    keys: ["canViewCustomers", "canCreateCustomers", "canEditCustomers", "canDeleteCustomers"],
  },
  {
    title: "Suppliers",
    keys: ["canViewSuppliers", "canCreateSuppliers", "canEditSuppliers", "canDeleteSuppliers"],
  },
  {
    title: "Warehouses",
    keys: ["canViewWarehouses", "canCreateWarehouses", "canEditWarehouses", "canDeleteWarehouses"],
  },
  {
    title: "Reports",
    keys: [
      "canViewSalesReport",
      "canViewPurchaseReport",
      "canViewInventoryReport",
      "canViewInvoiceReport",
      "canViewCustomerReport",
      "canViewSupplierReport",
      "canViewProductReport",
    ],
  },
  { title: "Settings", keys: ["canManageSettings"] },
]
