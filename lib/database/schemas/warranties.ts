import { pgTable, uuid, text, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { store } from "./stores";
import { relations } from "drizzle-orm/_relations";

export const warranty = pgTable(
  "warranties",
  {
    id: uuid().defaultRandom().primaryKey(),

    storeId: uuid("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    duration: text("duration").notNull(),
    description: text("description"),

    status: text("status").$type<"active" | "inactive">().default("active").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    uniqueIndex("warranty_name_unique").on(table.storeId, table.name),
    index("warranty_store_idx").on(table.storeId),
  ]
);

export const warrantyRelations = relations(warranty, ({ one }) => ({
  store: one(store, { fields: [warranty.storeId], references: [store.id] }),
}));

export type Warranty = typeof warranty.$inferSelect;
export type WarrantyInsert = typeof warranty.$inferInsert;
