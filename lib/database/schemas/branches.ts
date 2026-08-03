import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { store } from "./stores";
import { relations } from "drizzle-orm/_relations";
import { branchMember } from "./branch-members";

export const branch = pgTable(
  "branches",
  {
    id: uuid().defaultRandom().primaryKey(),

    storeId: uuid("store_id")
      .notNull()
      .references(() => store.id, {
        onDelete: "cascade",
      }),

    name: text("name").notNull(),

    code: text("code").notNull(),

    phone: text("phone"),

    email: text("email"),

    address: text("address"),

    city: text("city"),

    state: text("state"),

    country: text("country"),

    postalCode: text("postal_code"),

    isMain: boolean("is_main")
      .default(false)
      .notNull(),

    status: text("status")
      .$type<"active" | "inactive">()
      .default("active")
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("branch_code_unique").on(
      table.storeId,
      table.code
    ),

    uniqueIndex("branch_name_unique").on(
      table.storeId,
      table.name
    ),

    index("branch_store_idx").on(table.storeId),
    index("branch_status_idx").on(table.status),
  ]
);

export const branchRelations = relations(branch, ({ one, many }) => ({
  store: one(store, {
    fields: [branch.storeId],
    references: [store.id],
  }),

  members: many(branchMember),
}));

export type Branch = typeof branch.$inferSelect;
export type BranchInsert = typeof branch.$inferInsert;