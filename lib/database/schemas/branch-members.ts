import {
  pgTable,
  uuid,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

import { branch } from "./branches";
import { storeMember } from "./members";
import { relations } from "drizzle-orm/_relations";

export const branchMember = pgTable(
  "branch_members",
  {
    id: uuid().defaultRandom().primaryKey(),

    branchId: uuid("branch_id")
      .notNull()
      .references(() => branch.id, {
        onDelete: "cascade",
      }),

    memberId: uuid("member_id")
      .notNull()
      .references(() => storeMember.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("branch_member_unique").on(
      table.branchId,
      table.memberId
    ),

    index("branch_member_branch_idx").on(table.branchId),

    index("branch_member_member_idx").on(table.memberId),
  ]
);

export const branchMemberRelations = relations(
  branchMember,
  ({ one }) => ({
    branch: one(branch, {
      fields: [branchMember.branchId],
      references: [branch.id],
    }),

    member: one(storeMember, {
      fields: [branchMember.memberId],
      references: [storeMember.id],
    }),
  })
);

export type BranchMember =
  typeof branchMember.$inferSelect;

export type BranchMemberInsert =
  typeof branchMember.$inferInsert;