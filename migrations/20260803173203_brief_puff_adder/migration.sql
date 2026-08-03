CREATE TABLE "store" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"logo" text,
	"country" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "store_slug_idx" ON "store" ("slug");--> statement-breakpoint
CREATE INDEX "store_userId_idx" ON "store" ("user_id");--> statement-breakpoint
ALTER TABLE "store" ADD CONSTRAINT "store_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;