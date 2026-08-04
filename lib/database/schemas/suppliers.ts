import { pgTable, uuid, text, numeric, timestamp, index } from "drizzle-orm/pg-core";
import { store } from "./stores";
import { relations } from "drizzle-orm/_relations";

export const supplier = pgTable(
  "suppliers",
  {
    id: uuid().defaultRandom().primaryKey(),

    storeId: uuid("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    location: text("location"),

    totalDue: numeric("total_due", { precision: 12, scale: 2 }).default("0").notNull(),

    status: text("status").$type<"active" | "inactive">().default("active").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [index("supplier_store_idx").on(table.storeId)]
);

export const supplierRelations = relations(supplier, ({ one }) => ({
  store: one(store, { fields: [supplier.storeId], references: [store.id] }),
}));

export type Supplier = typeof supplier.$inferSelect;
export type SupplierInsert = typeof supplier.$inferInsert;
