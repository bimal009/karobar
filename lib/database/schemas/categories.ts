import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { store } from "./stores";
import { relations } from "drizzle-orm/_relations";

export const category = pgTable(
  "categories",
  {
    id: uuid().defaultRandom().primaryKey(),

    storeId: uuid("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    slug: text("slug").notNull(),

    status: text("status").$type<"active" | "inactive">().default("active").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    uniqueIndex("category_slug_unique").on(table.storeId, table.slug),
    index("category_store_idx").on(table.storeId),
  ]
);

export const subCategory = pgTable(
  "sub_categories",
  {
    id: uuid().defaultRandom().primaryKey(),

    storeId: uuid("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),

    categoryId: uuid("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "cascade" }),

    name: text("name").notNull(),

    status: text("status").$type<"active" | "inactive">().default("active").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    uniqueIndex("sub_category_name_unique").on(table.categoryId, table.name),
    index("sub_category_store_idx").on(table.storeId),
    index("sub_category_category_idx").on(table.categoryId),
  ]
);

export const categoryRelations = relations(category, ({ one, many }) => ({
  store: one(store, { fields: [category.storeId], references: [store.id] }),
  subCategories: many(subCategory),
}));

export const subCategoryRelations = relations(subCategory, ({ one }) => ({
  store: one(store, { fields: [subCategory.storeId], references: [store.id] }),
  category: one(category, { fields: [subCategory.categoryId], references: [category.id] }),
}));

export type Category = typeof category.$inferSelect;
export type CategoryInsert = typeof category.$inferInsert;
export type SubCategory = typeof subCategory.$inferSelect;
export type SubCategoryInsert = typeof subCategory.$inferInsert;
