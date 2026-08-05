import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const plan = pgTable(
  "plans",
  {
    id: uuid().defaultRandom().primaryKey(),

    name: text("name").notNull(),

    description: text("description"),

    isDefault: boolean("is_default")
      .notNull()
      .default(false),

    isActive: boolean("is_active")
      .notNull()
      .default(true),

    // Branches
    canUseMultiBranch: boolean("can_use_multi_branch").default(false).notNull(),

    // POS
    canUsePos: boolean("can_use_pos").default(false).notNull(),

    // Inventory / Stock
    canManageInventory: boolean("can_manage_inventory").default(false).notNull(),

    // Suppliers
    canUseSuppliers: boolean("can_use_suppliers").default(false).notNull(),

    // Warehouses
    canUseWarehouses: boolean("can_use_warehouses").default(false).notNull(),

    // Customers
    canUseCustomers: boolean("can_use_customers").default(false).notNull(),

    // Warranties
    canUseWarranties: boolean("can_use_warranties").default(false).notNull(),

    // Attributes
    canUseVariantAttributes: boolean("can_use_variant_attributes").default(false).notNull(),
    canUseCustomAttributes: boolean("can_use_custom_attributes").default(false).notNull(),

    // Printing
    canPrintBarcodes: boolean("can_print_barcodes").default(false).notNull(),

    // Reports
    canViewReports: boolean("can_view_reports").default(false).notNull(),

    // Team
    canInviteMembers: boolean("can_invite_members").default(false).notNull(),

    // Integrations
    canUseApiAccess: boolean("can_use_api_access").default(false).notNull(),
    canExportData: boolean("can_export_data").default(false).notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("plan_name_unique").on(table.name),
    index("plan_active_idx").on(table.isActive),
  ]
);

export type Plan = typeof plan.$inferSelect;
export type PlanInsert = typeof plan.$inferInsert;
