DROP INDEX "branch_member_member_idx";--> statement-breakpoint
DROP INDEX "branch_member_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "branch_member_unique" ON "branch_members" ("member_id");