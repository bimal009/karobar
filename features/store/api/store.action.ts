"use server";

import db from "@/lib/database/db";
import { Store, store, storeMember, storeRole } from "@/lib/database/schemas";
import { StoreInsert, storeInsertSchema } from "@/lib/database/zod/stores";
import { eq } from "drizzle-orm";

import { ApiResponse, AppResponse } from "@/lib/common/response";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
  handleError,
} from "@/lib/common/errors";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const getMyStoreSlug = async (): Promise<ApiResponse<string | null>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new UnauthorizedError("You must be signed in.");
    }

    const [membership] = await db
      .select({ slug: store.slug })
      .from(storeMember)
      .innerJoin(store, eq(storeMember.storeId, store.id))
      .where(eq(storeMember.userId, session.user.id))
      .limit(1);

    return AppResponse.ok(membership?.slug ?? null);
  } catch (error) {
    return handleError("Get my store", error);
  }
};

export const createStore = async (data: StoreInsert): Promise<ApiResponse<Store>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new UnauthorizedError("You must be signed in.");
    }

    const result = storeInsertSchema.safeParse(data);

    if (!result.success) {
      throw new ValidationError(
        "Validation failed",
        result.error.flatten()
      );
    }

    const validated = result.data;

    const slug = validated.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const existingStore = await db
      .select()
      .from(store)
      .where(eq(store.slug, slug))
      .limit(1);

    if (existingStore.length > 0) {
      throw new ConflictError("Slug already exists");
    }

    const createdStore = await db.transaction(async (tx) => {
      
      const [newStore] = await tx
        .insert(store)
        .values({
          ...validated,
          slug,
          userId: session.user.id,
        })
        .returning();

      const [systemRole] = await tx
        .insert(storeRole)
        .values({
          storeId: newStore.id,
          name: "System",
          description: "System role with all permissions",
          isSystem: true,

          canViewDashboard: true,
        canUsePos: true,

        canViewBranches: true,
        canCreateBranches: true,
        canEditBranches: true,
        canDeleteBranches: true,

        canViewMembers: true,
        canInviteMembers: true,
        canEditMembers: true,
        canDeleteMembers: true,

        canViewProducts: true,
        canCreateProducts: true,
        canEditProducts: true,
        canDeleteProducts: true,

        canViewCategories: true,
        canCreateCategories: true,
        canEditCategories: true,
        canDeleteCategories: true,

        canViewSubCategories: true,
        canCreateSubCategories: true,
        canEditSubCategories: true,
        canDeleteSubCategories: true,

        canViewBrands: true,
        canCreateBrands: true,
        canEditBrands: true,
        canDeleteBrands: true,

        canViewUnits: true,
        canCreateUnits: true,
        canEditUnits: true,
        canDeleteUnits: true,

        canViewVariantAttributes: true,
        canCreateVariantAttributes: true,
        canEditVariantAttributes: true,
        canDeleteVariantAttributes: true,

        canViewWarranties: true,
        canCreateWarranties: true,
        canEditWarranties: true,
        canDeleteWarranties: true,

        canViewExpiredProducts: true,
        canViewLowStocks: true,

        canManageStock: true,
        canAdjustStock: true,
        canTransferStock: true,

        canPrintBarcode: true,
        canPrintQrCode: true,

        canViewCustomers: true,
        canCreateCustomers: true,
        canEditCustomers: true,
        canDeleteCustomers: true,

        canViewSuppliers: true,
        canCreateSuppliers: true,
        canEditSuppliers: true,
        canDeleteSuppliers: true,

        canViewWarehouses: true,
        canCreateWarehouses: true,
        canEditWarehouses: true,
        canDeleteWarehouses: true,

        canViewSalesReport: true,
        canViewPurchaseReport: true,
        canViewInventoryReport: true,
        canViewInvoiceReport: true,
        canViewCustomerReport: true,
        canViewSupplierReport: true,
        canViewProductReport: true,

        canManageSettings: true,
        })
        .returning();

      await tx.insert(storeMember).values({
        storeId: newStore.id,
        userId: session.user.id,
        roleId: systemRole.id,
        
      });

      return newStore;
    });

          await auth.api.updateUser({
  headers: await headers(),
  body: {
    isOnboarded: true,
    image: validated.logo ?? undefined,
  },
});

    return AppResponse.created(
      createdStore,
      "Store created successfully"
    );
  } catch (error) {
    return handleError("Create store", error);
  }
};