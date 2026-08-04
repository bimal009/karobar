import { pgTable, uuid, integer, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { store } from "./stores";
import { branch } from "./branches";
import { product } from "./products";
import { relations } from "drizzle-orm/_relations";

export const branchStock = pgTable(
  "branch_stock",
  {
    id: uuid().defaultRandom().primaryKey(),

    storeId: uuid("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),

    branchId: uuid("branch_id")
      .notNull()
      .references(() => branch.id, { onDelete: "cascade" }),

    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),

    quantity: integer("quantity").default(0).notNull(),

    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    uniqueIndex("branch_stock_unique").on(table.branchId, table.productId),
    index("branch_stock_store_idx").on(table.storeId),
    index("branch_stock_branch_idx").on(table.branchId),
    index("branch_stock_product_idx").on(table.productId),
  ]
);

export const branchStockRelations = relations(branchStock, ({ one }) => ({
  store: one(store, { fields: [branchStock.storeId], references: [store.id] }),
  branch: one(branch, { fields: [branchStock.branchId], references: [branch.id] }),
  product: one(product, { fields: [branchStock.productId], references: [product.id] }),
}));

export type BranchStock = typeof branchStock.$inferSelect;
export type BranchStockInsert = typeof branchStock.$inferInsert;
