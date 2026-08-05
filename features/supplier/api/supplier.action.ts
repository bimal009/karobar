"use server"

import { and, count, eq, ilike, or } from "drizzle-orm"

import db from "@/lib/database/db"
import { supplier, type Supplier } from "@/lib/database/schemas"
import {
  SupplierInsert,
  SupplierUpdate,
  supplierInsertSchema,
  supplierUpdateSchema,
} from "@/lib/database/zod/suppliers"
import { getStoreContext, requirePermission } from "@/lib/database/queries/store-context"
import { ApiResponse, AppResponse } from "@/lib/common/response"
import { PaginationQuery, PaginationQuerySchema, resolveSortColumn } from "@/lib/common/pagination"
import { NotFoundError, ValidationError, handleError } from "@/lib/common/errors"
import redis from "@/lib/cache/redis"
import { SUPPLIERS_KEY } from "@/lib/cache/constants"
import { invalidateDerivedCaches } from "@/lib/cache/invalidate"

const suppliersCacheKey = (storeId: string) => `${SUPPLIERS_KEY}${storeId}`

const invalidateSuppliers = (storeId: string) =>
  Promise.all([redis.del(suppliersCacheKey(storeId)), invalidateDerivedCaches(storeId)])

export const getSuppliers = async (
  slug: string,
  query: Partial<PaginationQuery> = {}
): Promise<ApiResponse<Supplier[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewSuppliers")

    const parsed = PaginationQuerySchema.safeParse(query)
    if (!parsed.success) {
      throw new ValidationError("Invalid pagination params", parsed.error.flatten())
    }
    const { page, limit, search, sortBy, sortOrder } = parsed.data

    const orderBy = resolveSortColumn(
      { name: supplier.name, createdAt: supplier.createdAt },
      sortBy,
      "createdAt",
      sortOrder
    )

    const conditions = [eq(supplier.storeId, ctx.store.id)]
    if (search) {
      conditions.push(
        or(
          ilike(supplier.name, `%${search}%`),
          ilike(supplier.email, `%${search}%`),
          ilike(supplier.phone, `%${search}%`),
          ilike(supplier.location, `%${search}%`)
        )!
      )
    }

    const baseQuery = db
      .select()
      .from(supplier)
      .where(and(...conditions))

    const countQuery = db
      .select({ total: count() })
      .from(supplier)
      .where(and(...conditions))

    const [suppliers, [{ total }]] = await Promise.all([
      baseQuery.orderBy(orderBy).limit(limit).offset((page - 1) * limit),
      countQuery,
    ])

    return AppResponse.paginated(suppliers, {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    })
  } catch (error) {
    return handleError("Get suppliers", error)
  }
}

export const createSupplier = async (
  slug: string,
  data: SupplierInsert
): Promise<ApiResponse<Supplier>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canCreateSuppliers")

    const result = supplierInsertSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    const { totalDue, ...rest } = result.data

    const [newSupplier] = await db
      .insert(supplier)
      .values({ ...rest, storeId: ctx.store.id, totalDue: String(totalDue) })
      .returning()

    await invalidateSuppliers(ctx.store.id)

    return AppResponse.created(newSupplier, "Supplier created successfully")
  } catch (error) {
    return handleError("Create supplier", error)
  }
}

export const updateSupplier = async (
  slug: string,
  id: string,
  data: SupplierUpdate
): Promise<ApiResponse<Supplier>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canEditSuppliers")

    const result = supplierUpdateSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    const { totalDue, ...rest } = result.data

    const [updated] = await db
      .update(supplier)
      .set({
        ...rest,
        ...(totalDue !== undefined ? { totalDue: String(totalDue) } : {}),
      })
      .where(and(eq(supplier.id, id), eq(supplier.storeId, ctx.store.id)))
      .returning()

    if (!updated) {
      throw new NotFoundError("Supplier not found")
    }

    await invalidateSuppliers(ctx.store.id)

    return AppResponse.ok(updated, "Supplier updated successfully")
  } catch (error) {
    return handleError("Update supplier", error)
  }
}

export const deleteSupplier = async (slug: string, id: string): Promise<ApiResponse<never>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canDeleteSuppliers")

    const [deleted] = await db
      .delete(supplier)
      .where(and(eq(supplier.id, id), eq(supplier.storeId, ctx.store.id)))
      .returning()

    if (!deleted) {
      throw new NotFoundError("Supplier not found")
    }

    await invalidateSuppliers(ctx.store.id)

    return AppResponse.noContent("Supplier deleted successfully")
  } catch (error) {
    return handleError("Delete supplier", error)
  }
}
