import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { store } from "./stores";
import { relations } from "drizzle-orm/_relations";

export const storeLocation = pgTable(
  "store_locations",
  {
    id: uuid().defaultRandom().primaryKey(),

    storeId: uuid("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    manager: text("manager"),
    location: text("location"),

    status: text("status").$type<"active" | "inactive">().default("active").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [index("store_location_store_idx").on(table.storeId)]
);

export const storeLocationRelations = relations(storeLocation, ({ one }) => ({
  store: one(store, { fields: [storeLocation.storeId], references: [store.id] }),
}));

export type StoreLocation = typeof storeLocation.$inferSelect;
export type StoreLocationInsert = typeof storeLocation.$inferInsert;
