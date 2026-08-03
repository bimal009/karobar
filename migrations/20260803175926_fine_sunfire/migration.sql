CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"phone" text,
	"email" text,
	"address" text,
	"city" text,
	"state" text,
	"country" text,
	"postal_code" text,
	"is_main" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "branch_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"branch_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "branch_code_unique" ON "branches" ("store_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "branch_name_unique" ON "branches" ("store_id","name");--> statement-breakpoint
CREATE INDEX "branch_store_idx" ON "branches" ("store_id");--> statement-breakpoint
CREATE INDEX "branch_status_idx" ON "branches" ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "branch_member_unique" ON "branch_members" ("branch_id","member_id");--> statement-breakpoint
CREATE INDEX "branch_member_branch_idx" ON "branch_members" ("branch_id");--> statement-breakpoint
CREATE INDEX "branch_member_member_idx" ON "branch_members" ("member_id");--> statement-breakpoint
CREATE UNIQUE INDEX "store_member_unique" ON "store_members" ("store_id","user_id");--> statement-breakpoint
CREATE INDEX "store_member_store_idx" ON "store_members" ("store_id");--> statement-breakpoint
CREATE INDEX "store_member_user_idx" ON "store_members" ("user_id");--> statement-breakpoint
CREATE INDEX "store_member_role_idx" ON "store_members" ("role_id");--> statement-breakpoint
CREATE INDEX "store_member_lookup_idx" ON "store_members" ("store_id","user_id","role_id");--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "branch_members" ADD CONSTRAINT "branch_members_branch_id_branches_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "branch_members" ADD CONSTRAINT "branch_members_member_id_store_members_id_fkey" FOREIGN KEY ("member_id") REFERENCES "store_members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "store_members" ADD CONSTRAINT "store_members_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "store_members" ADD CONSTRAINT "store_members_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "store_members" ADD CONSTRAINT "store_members_role_id_store_roles_id_fkey" FOREIGN KEY ("role_id") REFERENCES "store_roles"("id") ON DELETE RESTRICT;