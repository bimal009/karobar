import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  date,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { store } from "./stores";
import { category, subCategory } from "./categories";
import { brand } from "./brands";
import { unit } from "./units";
import { warranty } from "./warranties";
import { relations } from "drizzle-orm/_relations";

export const product = pgTable(
  "products",
  {
    id: uuid().defaultRandom().primaryKey(),

    storeId: uuid("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    sku: text("sku").notNull(),
    barcode: text("barcode"),

    categoryId: uuid("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "restrict" }),

    subCategoryId: uuid("sub_category_id").references(() => subCategory.id, {
      onDelete: "set null",
    }),

    brandId: uuid("brand_id").references(() => brand.id, { onDelete: "set null" }),

    unitId: uuid("unit_id").references(() => unit.id, { onDelete: "set null" }),

    warrantyId: uuid("warranty_id").references(() => warranty.id, { onDelete: "set null" }),

    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    cost: numeric("cost", { precision: 12, scale: 2 }).notNull(),

    quantity: integer("quantity").default(0).notNull(),
    lowStockThreshold: integer("low_stock_threshold").default(0).notNull(),

    expiryDate: date("expiry_date"),

    status: text("status").$type<"active" | "inactive">().default("active").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    uniqueIndex("product_sku_unique").on(table.storeId, table.sku),
    index("product_store_idx").on(table.storeId),
    index("product_category_idx").on(table.categoryId),
    index("product_status_idx").on(table.status),
  ]
);

export const productRelations = relations(product, ({ one }) => ({
  store: one(store, { fields: [product.storeId], references: [store.id] }),
  category: one(category, { fields: [product.categoryId], references: [category.id] }),
  subCategory: one(subCategory, { fields: [product.subCategoryId], references: [subCategory.id] }),
  brand: one(brand, { fields: [product.brandId], references: [brand.id] }),
  unit: one(unit, { fields: [product.unitId], references: [unit.id] }),
  warranty: one(warranty, { fields: [product.warrantyId], references: [warranty.id] }),
}));

export type Product = typeof product.$inferSelect;
export type ProductInsert = typeof product.$inferInsert;
