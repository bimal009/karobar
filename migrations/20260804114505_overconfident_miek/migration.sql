CREATE TABLE "branch_stock" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "branch_stock_unique" ON "branch_stock" ("branch_id","product_id");--> statement-breakpoint
CREATE INDEX "branch_stock_store_idx" ON "branch_stock" ("store_id");--> statement-breakpoint
CREATE INDEX "branch_stock_branch_idx" ON "branch_stock" ("branch_id");--> statement-breakpoint
CREATE INDEX "branch_stock_product_idx" ON "branch_stock" ("product_id");--> statement-breakpoint
ALTER TABLE "branch_stock" ADD CONSTRAINT "branch_stock_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "branch_stock" ADD CONSTRAINT "branch_stock_branch_id_branches_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "branch_stock" ADD CONSTRAINT "branch_stock_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;