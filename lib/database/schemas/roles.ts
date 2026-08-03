import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { store } from "./stores";
import { relations } from "drizzle-orm/_relations";
import { storeMember } from "./members";


export const storeRole = pgTable(
  "store_roles",
  {
    id: uuid().defaultRandom().primaryKey(),

    storeId: uuid("store_id")
      .notNull()
      .references(() => store.id, {
        onDelete: "cascade",
      }),

    name: text("name").notNull(),

    description: text("description"),

    isSystem: boolean("is_system")
      .notNull()
      .default(false),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
(table) => [
  uniqueIndex("store_role_name_unique").on(
    table.storeId,
    table.name
  ),

  index("store_role_store_idx").on(table.storeId),
  index("store_role_system_idx").on(table.isSystem),
]
);

export const storeRoleRelations = relations(
  storeRole,
  ({ one, many }) => ({
    store: one(store, {
      fields: [storeRole.storeId],
      references: [store.id],
    }),

    members: many(storeMember),
  })
);

export type StoreRole = typeof storeRole.$inferSelect;
export type StoreRoleInsert = typeof storeRole.$inferInsert;