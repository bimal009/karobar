import {
  pgTable,
  uuid,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

import { user } from "./user";
import { storeRole } from "./roles";
import { store } from "./stores";
import { relations } from "drizzle-orm/_relations";

export const storeMember = pgTable(
  "store_members",
  {
    id: uuid().defaultRandom().primaryKey(),

    storeId: uuid("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

roleId: uuid("role_id")
  .notNull()
  .references(() => storeRole.id, {
    onDelete: "restrict",
  }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
(table) => [
  uniqueIndex("store_member_unique").on(table.storeId, table.userId),

  index("store_member_store_idx").on(table.storeId),
  index("store_member_user_idx").on(table.userId),
  index("store_member_role_idx").on(table.roleId),

  index("store_member_lookup_idx").on(
    table.storeId,
    table.userId,
    table.roleId
  ),
]
);

export const storeMemberRelations = relations(storeMember, ({ one }) => ({
  store: one(store, {
    fields: [storeMember.storeId],
    references: [store.id],
  }),

  user: one(user, {
    fields: [storeMember.userId],
    references: [user.id],
  }),
  role: one(storeRole, {
  fields: [storeMember.roleId],
  references: [storeRole.id],
}),
}));

export type StoreMember = typeof storeMember.$inferSelect;
export type StoreMemberInsert = typeof storeMember.$inferInsert;