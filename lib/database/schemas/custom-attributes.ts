import { pgTable, uuid, text, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { store } from "./stores";
import { relations } from "drizzle-orm/_relations";

export const customAttribute = pgTable(
  "custom_attributes",
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
    uniqueIndex("custom_attribute_name_unique").on(table.storeId, table.name),
    index("custom_attribute_store_idx").on(table.storeId),
  ]
);

export const customAttributeRelations = relations(customAttribute, ({ one }) => ({
  store: one(store, { fields: [customAttribute.storeId], references: [store.id] }),
}));

export type CustomAttribute = typeof customAttribute.$inferSelect;
export type CustomAttributeInsert = typeof customAttribute.$inferInsert;
