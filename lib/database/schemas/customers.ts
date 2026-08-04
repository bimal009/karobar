import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { store } from "./stores";
import { relations } from "drizzle-orm/_relations";

export const customer = pgTable(
  "customers",
  {
    id: uuid().defaultRandom().primaryKey(),

    storeId: uuid("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    location: text("location"),

    status: text("status").$type<"active" | "inactive">().default("active").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [index("customer_store_idx").on(table.storeId)]
);

export const customerRelations = relations(customer, ({ one }) => ({
  store: one(store, { fields: [customer.storeId], references: [store.id] }),
}));

export type Customer = typeof customer.$inferSelect;
export type CustomerInsert = typeof customer.$inferInsert;
