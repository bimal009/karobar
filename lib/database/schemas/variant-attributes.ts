import { pgTable, uuid, text, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { store } from "./stores";
import { relations } from "drizzle-orm/_relations";

export const variantAttribute = pgTable(
  "variant_attributes",
  {
    id: uuid().defaultRandom().primaryKey(),

    storeId: uuid("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    values: text("values").array().notNull().default([]),

    status: text("status").$type<"active" | "inactive">().default("active").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    uniqueIndex("variant_attribute_name_unique").on(table.storeId, table.name),
    index("variant_attribute_store_idx").on(table.storeId),
  ]
);

export const variantAttributeRelations = relations(variantAttribute, ({ one }) => ({
  store: one(store, { fields: [variantAttribute.storeId], references: [store.id] }),
}));

export type VariantAttribute = typeof variantAttribute.$inferSelect;
export type VariantAttributeInsert = typeof variantAttribute.$inferInsert;
