import { pgTable, uuid, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { store } from "./stores";
import { product } from "./products";
import { branch } from "./branches";
import { user } from "./user";
import { relations } from "drizzle-orm/_relations";

export const stockMovement = pgTable(
  "stock_movements",
  {
    id: uuid().defaultRandom().primaryKey(),

    storeId: uuid("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),

    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),

    type: text("type").$type<"adjustment" | "transfer">().notNull(),

    fromBranchId: uuid("from_branch_id").references(() => branch.id, { onDelete: "set null" }),
    toBranchId: uuid("to_branch_id").references(() => branch.id, { onDelete: "set null" }),

    quantityBefore: integer("quantity_before").notNull(),
    quantityChange: integer("quantity_change").notNull(),
    quantityAfter: integer("quantity_after").notNull(),

    reason: text("reason"),

    responsibleUserId: text("responsible_user_id").references(() => user.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("stock_movement_store_idx").on(table.storeId),
    index("stock_movement_product_idx").on(table.productId),
    index("stock_movement_type_idx").on(table.type),
  ]
);

export const stockMovementRelations = relations(stockMovement, ({ one }) => ({
  store: one(store, { fields: [stockMovement.storeId], references: [store.id] }),
  product: one(product, { fields: [stockMovement.productId], references: [product.id] }),
  fromBranch: one(branch, { fields: [stockMovement.fromBranchId], references: [branch.id] }),
  toBranch: one(branch, { fields: [stockMovement.toBranchId], references: [branch.id] }),
  responsible: one(user, { fields: [stockMovement.responsibleUserId], references: [user.id] }),
}));

export type StockMovement = typeof stockMovement.$inferSelect;
export type StockMovementInsert = typeof stockMovement.$inferInsert;
