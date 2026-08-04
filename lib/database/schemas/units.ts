import { pgTable, uuid, text, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { store } from "./stores";
import { relations } from "drizzle-orm/_relations";

export const unit = pgTable(
  "units",
  {
    id: uuid().defaultRandom().primaryKey(),

    storeId: uuid("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    shortName: text("short_name").notNull(),

    status: text("status").$type<"active" | "inactive">().default("active").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    uniqueIndex("unit_name_unique").on(table.storeId, table.name),
    index("unit_store_idx").on(table.storeId),
  ]
);

export const unitRelations = relations(unit, ({ one }) => ({
  store: one(store, { fields: [unit.storeId], references: [store.id] }),
}));

export type Unit = typeof unit.$inferSelect;
export type UnitInsert = typeof unit.$inferInsert;
