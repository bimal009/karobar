import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { store } from "./stores";
import { relations } from "drizzle-orm/_relations";
import { storeMember } from "./members";


export const storeRole = pgTable(
  "store_roles",
  {
    id: uuid().defaultRandom().primaryKey(),

    storeId: uuid("store_id")
      .notNull()
      .references(() => store.id, {
        onDelete: "cascade",
      }),

    name: text("name").notNull(),

    description: text("description"),

    isSystem: boolean("is_system")
      .notNull()
      .default(false),

    // Dashboard
    canViewDashboard: boolean("can_view_dashboard").default(false).notNull(),

    // POS
    canUsePos: boolean("can_use_pos").default(false).notNull(),

    // Branches
    canViewBranches: boolean("can_view_branches").default(false).notNull(),
    canCreateBranches: boolean("can_create_branches").default(false).notNull(),
    canEditBranches: boolean("can_edit_branches").default(false).notNull(),
    canDeleteBranches: boolean("can_delete_branches").default(false).notNull(),

    // Members
    canViewMembers: boolean("can_view_members").default(false).notNull(),
    canInviteMembers: boolean("can_invite_members").default(false).notNull(),
    canEditMembers: boolean("can_edit_members").default(false).notNull(),
    canDeleteMembers: boolean("can_delete_members").default(false).notNull(),

    // Products
    canViewProducts: boolean("can_view_products").default(false).notNull(),
    canCreateProducts: boolean("can_create_products").default(false).notNull(),
    canEditProducts: boolean("can_edit_products").default(false).notNull(),
    canDeleteProducts: boolean("can_delete_products").default(false).notNull(),

    // Categories
    canViewCategories: boolean("can_view_categories").default(false).notNull(),
    canCreateCategories: boolean("can_create_categories").default(false).notNull(),
    canEditCategories: boolean("can_edit_categories").default(false).notNull(),
    canDeleteCategories: boolean("can_delete_categories").default(false).notNull(),

    // Sub Categories
    canViewSubCategories: boolean("can_view_sub_categories").default(false).notNull(),
    canCreateSubCategories: boolean("can_create_sub_categories").default(false).notNull(),
    canEditSubCategories: boolean("can_edit_sub_categories").default(false).notNull(),
    canDeleteSubCategories: boolean("can_delete_sub_categories").default(false).notNull(),

    // Brands
    canViewBrands: boolean("can_view_brands").default(false).notNull(),
    canCreateBrands: boolean("can_create_brands").default(false).notNull(),
    canEditBrands: boolean("can_edit_brands").default(false).notNull(),
    canDeleteBrands: boolean("can_delete_brands").default(false).notNull(),

    // Units
    canViewUnits: boolean("can_view_units").default(false).notNull(),
    canCreateUnits: boolean("can_create_units").default(false).notNull(),
    canEditUnits: boolean("can_edit_units").default(false).notNull(),
    canDeleteUnits: boolean("can_delete_units").default(false).notNull(),

    // Variant Attributes
    canViewVariantAttributes: boolean("can_view_variant_attributes").default(false).notNull(),
    canCreateVariantAttributes: boolean("can_create_variant_attributes").default(false).notNull(),
    canEditVariantAttributes: boolean("can_edit_variant_attributes").default(false).notNull(),
    canDeleteVariantAttributes: boolean("can_delete_variant_attributes").default(false).notNull(),

    // Custom Attributes
    canViewCustomAttributes: boolean("can_view_custom_attributes").default(false).notNull(),
    canCreateCustomAttributes: boolean("can_create_custom_attributes").default(false).notNull(),
    canEditCustomAttributes: boolean("can_edit_custom_attributes").default(false).notNull(),
    canDeleteCustomAttributes: boolean("can_delete_custom_attributes").default(false).notNull(),

    // Warranties
    canViewWarranties: boolean("can_view_warranties").default(false).notNull(),
    canCreateWarranties: boolean("can_create_warranties").default(false).notNull(),
    canEditWarranties: boolean("can_edit_warranties").default(false).notNull(),
    canDeleteWarranties: boolean("can_delete_warranties").default(false).notNull(),

    canViewExpiredProducts: boolean("can_view_expired_products").default(false).notNull(),
    canViewLowStocks: boolean("can_view_low_stocks").default(false).notNull(),

    canManageStock: boolean("can_manage_stock").default(false).notNull(),
    canAdjustStock: boolean("can_adjust_stock").default(false).notNull(),
    canTransferStock: boolean("can_transfer_stock").default(false).notNull(),

    canPrintBarcode: boolean("can_print_barcode").default(false).notNull(),
    canPrintQrCode: boolean("can_print_qr_code").default(false).notNull(),

    canViewCustomers: boolean("can_view_customers").default(false).notNull(),
    canCreateCustomers: boolean("can_create_customers").default(false).notNull(),
    canEditCustomers: boolean("can_edit_customers").default(false).notNull(),
    canDeleteCustomers: boolean("can_delete_customers").default(false).notNull(),

    canViewSuppliers: boolean("can_view_suppliers").default(false).notNull(),
    canCreateSuppliers: boolean("can_create_suppliers").default(false).notNull(),
    canEditSuppliers: boolean("can_edit_suppliers").default(false).notNull(),
    canDeleteSuppliers: boolean("can_delete_suppliers").default(false).notNull(),

    canViewWarehouses: boolean("can_view_warehouses").default(false).notNull(),
    canCreateWarehouses: boolean("can_create_warehouses").default(false).notNull(),
    canEditWarehouses: boolean("can_edit_warehouses").default(false).notNull(),
    canDeleteWarehouses: boolean("can_delete_warehouses").default(false).notNull(),

    canViewSalesReport: boolean("can_view_sales_report").default(false).notNull(),
    canViewPurchaseReport: boolean("can_view_purchase_report").default(false).notNull(),
    canViewInventoryReport: boolean("can_view_inventory_report").default(false).notNull(),
    canViewInvoiceReport: boolean("can_view_invoice_report").default(false).notNull(),
    canViewCustomerReport: boolean("can_view_customer_report").default(false).notNull(),
    canViewSupplierReport: boolean("can_view_supplier_report").default(false).notNull(),
    canViewProductReport: boolean("can_view_product_report").default(false).notNull(),

    canManageSettings: boolean("can_manage_settings").default(false).notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
(table) => [
  uniqueIndex("store_role_name_unique").on(
    table.storeId,
    table.name
  ),

  index("store_role_store_idx").on(table.storeId),
  index("store_role_system_idx").on(table.isSystem),
]
);

export const storeRoleRelations = relations(
  storeRole,
  ({ one, many }) => ({
    store: one(store, {
      fields: [storeRole.storeId],
      references: [store.id],
    }),

    members: many(storeMember),
  })
);

export type StoreRole = typeof storeRole.$inferSelect;
export type StoreRoleInsert = typeof storeRole.$inferInsert;
