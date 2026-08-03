import { relations } from "drizzle-orm/_relations"
import { pgTable, text, timestamp, index, uniqueIndex, uuid } from "drizzle-orm/pg-core"
import { user } from "./user"
import { InferSelectModel } from "drizzle-orm"

export const store = pgTable(
  "store",
  {
   id: uuid().defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logo: text("logo"),
    country: text("country").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("store_slug_idx").on(table.slug),
    index("store_userId_idx").on(table.userId),
  ]
)

export const storeRelations = relations(store, ({ one }) => ({
  owner: one(user, {
    fields: [store.userId],
    references: [user.id],
  }),
}))

export type Store = InferSelectModel<typeof store>;