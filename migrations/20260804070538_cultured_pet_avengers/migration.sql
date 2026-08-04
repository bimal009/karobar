CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sub_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"name" text NOT NULL,
	"short_name" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "variant_attributes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"name" text NOT NULL,
	"values" text[] DEFAULT '{}'::text[] NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warranties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"name" text NOT NULL,
	"duration" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"name" text NOT NULL,
	"sku" text NOT NULL,
	"barcode" text,
	"category_id" uuid NOT NULL,
	"sub_category_id" uuid,
	"brand_id" uuid,
	"unit_id" uuid,
	"warranty_id" uuid,
	"price" numeric(12,2) NOT NULL,
	"cost" numeric(12,2) NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"low_stock_threshold" integer DEFAULT 0 NOT NULL,
	"expiry_date" date,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"location" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"location" text,
	"total_due" numeric(12,2) DEFAULT '0' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"location" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"manager" text,
	"location" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warehouses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"contact_person" text,
	"location" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"type" text NOT NULL,
	"from_branch_id" uuid,
	"to_branch_id" uuid,
	"quantity_before" integer NOT NULL,
	"quantity_change" integer NOT NULL,
	"quantity_after" integer NOT NULL,
	"reason" text,
	"responsible_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"order_no" text NOT NULL,
	"customer_id" uuid,
	"branch_id" uuid,
	"biller_id" uuid,
	"subtotal" numeric(12,2) NOT NULL,
	"discount" numeric(12,2) DEFAULT '0' NOT NULL,
	"tax" numeric(12,2) DEFAULT '0' NOT NULL,
	"total" numeric(12,2) NOT NULL,
	"payment_method" text NOT NULL,
	"status" text DEFAULT 'completed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"product_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"price" numeric(12,2) NOT NULL
);
--> statement-breakpoint
DROP TABLE "store_role_permissions";--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_view_dashboard" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_use_pos" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_view_branches" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_create_branches" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_edit_branches" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_delete_branches" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_view_members" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_invite_members" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_edit_members" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_delete_members" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_view_products" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_create_products" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_edit_products" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_delete_products" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_view_categories" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_create_categories" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_edit_categories" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_delete_categories" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_view_sub_categories" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_create_sub_categories" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_edit_sub_categories" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_delete_sub_categories" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_view_brands" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_create_brands" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_edit_brands" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_delete_brands" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_view_units" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_create_units" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_edit_units" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_delete_units" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_view_variant_attributes" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_create_variant_attributes" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_edit_variant_attributes" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_delete_variant_attributes" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_view_warranties" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_create_warranties" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_edit_warranties" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_delete_warranties" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_view_expired_products" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_view_low_stocks" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_manage_stock" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_adjust_stock" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_transfer_stock" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_print_barcode" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_print_qr_code" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_view_customers" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_create_customers" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_edit_customers" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_delete_customers" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_view_suppliers" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_create_suppliers" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_edit_suppliers" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_delete_suppliers" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_view_warehouses" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_create_warehouses" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_edit_warehouses" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_delete_warehouses" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_view_sales_report" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_view_purchase_report" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_view_inventory_report" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_view_invoice_report" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_view_customer_report" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_view_supplier_report" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_view_product_report" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_roles" ADD COLUMN "can_manage_settings" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "category_slug_unique" ON "categories" ("store_id","slug");--> statement-breakpoint
CREATE INDEX "category_store_idx" ON "categories" ("store_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sub_category_name_unique" ON "sub_categories" ("category_id","name");--> statement-breakpoint
CREATE INDEX "sub_category_store_idx" ON "sub_categories" ("store_id");--> statement-breakpoint
CREATE INDEX "sub_category_category_idx" ON "sub_categories" ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "brand_name_unique" ON "brands" ("store_id","name");--> statement-breakpoint
CREATE INDEX "brand_store_idx" ON "brands" ("store_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unit_name_unique" ON "units" ("store_id","name");--> statement-breakpoint
CREATE INDEX "unit_store_idx" ON "units" ("store_id");--> statement-breakpoint
CREATE UNIQUE INDEX "variant_attribute_name_unique" ON "variant_attributes" ("store_id","name");--> statement-breakpoint
CREATE INDEX "variant_attribute_store_idx" ON "variant_attributes" ("store_id");--> statement-breakpoint
CREATE UNIQUE INDEX "warranty_name_unique" ON "warranties" ("store_id","name");--> statement-breakpoint
CREATE INDEX "warranty_store_idx" ON "warranties" ("store_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_sku_unique" ON "products" ("store_id","sku");--> statement-breakpoint
CREATE INDEX "product_store_idx" ON "products" ("store_id");--> statement-breakpoint
CREATE INDEX "product_category_idx" ON "products" ("category_id");--> statement-breakpoint
CREATE INDEX "product_status_idx" ON "products" ("status");--> statement-breakpoint
CREATE INDEX "customer_store_idx" ON "customers" ("store_id");--> statement-breakpoint
CREATE INDEX "supplier_store_idx" ON "suppliers" ("store_id");--> statement-breakpoint
CREATE INDEX "biller_store_idx" ON "billers" ("store_id");--> statement-breakpoint
CREATE INDEX "store_location_store_idx" ON "store_locations" ("store_id");--> statement-breakpoint
CREATE INDEX "warehouse_store_idx" ON "warehouses" ("store_id");--> statement-breakpoint
CREATE INDEX "stock_movement_store_idx" ON "stock_movements" ("store_id");--> statement-breakpoint
CREATE INDEX "stock_movement_product_idx" ON "stock_movements" ("product_id");--> statement-breakpoint
CREATE INDEX "stock_movement_type_idx" ON "stock_movements" ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "order_no_unique" ON "orders" ("store_id","order_no");--> statement-breakpoint
CREATE INDEX "order_store_idx" ON "orders" ("store_id");--> statement-breakpoint
CREATE INDEX "order_customer_idx" ON "orders" ("customer_id");--> statement-breakpoint
CREATE INDEX "order_status_idx" ON "orders" ("status");--> statement-breakpoint
CREATE INDEX "order_created_idx" ON "orders" ("created_at");--> statement-breakpoint
CREATE INDEX "order_item_order_idx" ON "order_items" ("order_id");--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sub_categories" ADD CONSTRAINT "sub_categories_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sub_categories" ADD CONSTRAINT "sub_categories_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "variant_attributes" ADD CONSTRAINT "variant_attributes_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "warranties" ADD CONSTRAINT "warranties_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_sub_category_id_sub_categories_id_fkey" FOREIGN KEY ("sub_category_id") REFERENCES "sub_categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_unit_id_units_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_warranty_id_warranties_id_fkey" FOREIGN KEY ("warranty_id") REFERENCES "warranties"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "billers" ADD CONSTRAINT "billers_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "store_locations" ADD CONSTRAINT "store_locations_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_from_branch_id_branches_id_fkey" FOREIGN KEY ("from_branch_id") REFERENCES "branches"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_to_branch_id_branches_id_fkey" FOREIGN KEY ("to_branch_id") REFERENCES "branches"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_responsible_user_id_user_id_fkey" FOREIGN KEY ("responsible_user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_branch_id_branches_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_biller_id_billers_id_fkey" FOREIGN KEY ("biller_id") REFERENCES "billers"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT;