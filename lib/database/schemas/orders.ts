import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { store } from "./stores";
import { customer } from "./customers";
import { branch } from "./branches";
import { biller } from "./billers";
import { product } from "./products";
import { relations } from "drizzle-orm/_relations";

export const order = pgTable(
  "orders",
  {
    id: uuid().defaultRandom().primaryKey(),

    storeId: uuid("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),

    orderNo: text("order_no").notNull(),

    customerId: uuid("customer_id").references(() => customer.id, { onDelete: "set null" }),
    branchId: uuid("branch_id").references(() => branch.id, { onDelete: "set null" }),
    billerId: uuid("biller_id").references(() => biller.id, { onDelete: "set null" }),

    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
    discount: numeric("discount", { precision: 12, scale: 2 }).default("0").notNull(),
    tax: numeric("tax", { precision: 12, scale: 2 }).default("0").notNull(),
    total: numeric("total", { precision: 12, scale: 2 }).notNull(),

    paymentMethod: text("payment_method").$type<"cash" | "card" | "wallet">().notNull(),
    status: text("status")
      .$type<"completed" | "pending" | "cancelled" | "returned">()
      .default("completed")
      .notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("order_no_unique").on(table.storeId, table.orderNo),
    index("order_store_idx").on(table.storeId),
    index("order_customer_idx").on(table.customerId),
    index("order_status_idx").on(table.status),
    index("order_created_idx").on(table.createdAt),
  ]
);

export const orderItem = pgTable(
  "order_items",
  {
    id: uuid().defaultRandom().primaryKey(),

    orderId: uuid("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),

    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "restrict" }),

    productName: text("product_name").notNull(),
    quantity: integer("quantity").notNull(),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  },
  (table) => [index("order_item_order_idx").on(table.orderId)]
);

export const orderRelations = relations(order, ({ one, many }) => ({
  store: one(store, { fields: [order.storeId], references: [store.id] }),
  customer: one(customer, { fields: [order.customerId], references: [customer.id] }),
  branch: one(branch, { fields: [order.branchId], references: [branch.id] }),
  biller: one(biller, { fields: [order.billerId], references: [biller.id] }),
  items: many(orderItem),
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
  order: one(order, { fields: [orderItem.orderId], references: [order.id] }),
  product: one(product, { fields: [orderItem.productId], references: [product.id] }),
}));

export type Order = typeof order.$inferSelect;
export type OrderInsert = typeof order.$inferInsert;
export type OrderItem = typeof orderItem.$inferSelect;
export type OrderItemInsert = typeof orderItem.$inferInsert;
