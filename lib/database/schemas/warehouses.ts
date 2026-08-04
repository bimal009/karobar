import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { store } from "./stores";
import { relations } from "drizzle-orm/_relations";

export const warehouse = pgTable(
  "warehouses",
  {
    id: uuid().defaultRandom().primaryKey(),

    storeId: uuid("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    contactPerson: text("contact_person"),
    location: text("location"),

    status: text("status").$type<"active" | "inactive">().default("active").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [index("warehouse_store_idx").on(table.storeId)]
);

export const warehouseRelations = relations(warehouse, ({ one }) => ({
  store: one(store, { fields: [warehouse.storeId], references: [store.id] }),
}));

export type Warehouse = typeof warehouse.$inferSelect;
export type WarehouseInsert = typeof warehouse.$inferInsert;
