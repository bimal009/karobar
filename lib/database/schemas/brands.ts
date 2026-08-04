import { pgTable, uuid, text, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { store } from "./stores";
import { relations } from "drizzle-orm/_relations";

export const brand = pgTable(
  "brands",
  {
    id: uuid().defaultRandom().primaryKey(),

    storeId: uuid("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),

    name: text("name").notNull(),

    status: text("status").$type<"active" | "inactive">().default("active").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    uniqueIndex("brand_name_unique").on(table.storeId, table.name),
    index("brand_store_idx").on(table.storeId),
  ]
);

export const brandRelations = relations(brand, ({ one }) => ({
  store: one(store, { fields: [brand.storeId], references: [store.id] }),
}));

export type Brand = typeof brand.$inferSelect;
export type BrandInsert = typeof brand.$inferInsert;
