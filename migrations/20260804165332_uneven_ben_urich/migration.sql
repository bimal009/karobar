CREATE TABLE "custom_attributes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"name" text NOT NULL,
	"values" text[] DEFAULT '{}'::text[] NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_custom_attribute_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"product_id" uuid NOT NULL,
	"attribute_id" uuid NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_view_custom_attributes" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_create_custom_attributes" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_edit_custom_attributes" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_delete_custom_attributes" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "custom_attribute_name_unique" ON "custom_attributes" ("store_id","name");--> statement-breakpoint
CREATE INDEX "custom_attribute_store_idx" ON "custom_attributes" ("store_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_custom_attribute_value_unique" ON "product_custom_attribute_values" ("product_id","attribute_id","value");--> statement-breakpoint
CREATE INDEX "product_custom_attribute_value_product_idx" ON "product_custom_attribute_values" ("product_id");--> statement-breakpoint
CREATE INDEX "product_custom_attribute_value_attribute_idx" ON "product_custom_attribute_values" ("attribute_id");--> statement-breakpoint
ALTER TABLE "custom_attributes" ADD CONSTRAINT "custom_attributes_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "product_custom_attribute_values" ADD CONSTRAINT "product_custom_attribute_values_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "product_custom_attribute_values" ADD CONSTRAINT "product_custom_attribute_values_NXGi0vaZHZls_fkey" FOREIGN KEY ("attribute_id") REFERENCES "custom_attributes"("id") ON DELETE CASCADE;