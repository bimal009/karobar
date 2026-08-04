import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { store } from "./stores";
import { relations } from "drizzle-orm/_relations";

export const biller = pgTable(
  "billers",
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
  (table) => [index("biller_store_idx").on(table.storeId)]
);

export const billerRelations = relations(biller, ({ one }) => ({
  store: one(store, { fields: [biller.storeId], references: [store.id] }),
}));

export type Biller = typeof biller.$inferSelect;
export type BillerInsert = typeof biller.$inferInsert;
