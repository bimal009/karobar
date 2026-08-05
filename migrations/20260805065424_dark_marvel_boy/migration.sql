CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"description" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"can_use_multi_branch" boolean DEFAULT false NOT NULL,
	"can_use_pos" boolean DEFAULT false NOT NULL,
	"can_manage_inventory" boolean DEFAULT false NOT NULL,
	"can_use_suppliers" boolean DEFAULT false NOT NULL,
	"can_use_warehouses" boolean DEFAULT false NOT NULL,
	"can_use_customers" boolean DEFAULT false NOT NULL,
	"can_use_warranties" boolean DEFAULT false NOT NULL,
	"can_use_variant_attributes" boolean DEFAULT false NOT NULL,
	"can_use_custom_attributes" boolean DEFAULT false NOT NULL,
	"can_print_barcodes" boolean DEFAULT false NOT NULL,
	"can_view_reports" boolean DEFAULT false NOT NULL,
	"can_invite_members" boolean DEFAULT false NOT NULL,
	"can_use_api_access" boolean DEFAULT false NOT NULL,
	"can_export_data" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "plan_name_unique" ON "plans" ("name");--> statement-breakpoint
CREATE INDEX "plan_active_idx" ON "plans" ("is_active");