"use server"

import { and, count, eq, ilike, or } from "drizzle-orm"

import db from "@/lib/database/db"
import { product, warranty, type Warranty } from "@/lib/database/schemas"
import {
  WarrantyInsert,
  WarrantyUpdate,
  warrantyInsertSchema,
  warrantyUpdateSchema,
} from "@/lib/database/zod/warranties"
import { getStoreContext, requirePermission } from "@/lib/database/queries/store-context"
import { ApiResponse, AppResponse } from "@/lib/common/response"
import { PaginationQuery, PaginationQuerySchema, resolveSortColumn } from "@/lib/common/pagination"
import { ConflictError, NotFoundError, ValidationError, handleError } from "@/lib/common/errors"
import redis from "@/lib/cache/redis"
import { WARRANTIES_KEY } from "@/lib/cache/constants"

const warrantiesCacheKey = (storeId: string) => `${WARRANTIES_KEY}${storeId}`

const invalidateWarranties = (storeId: string) => redis.del(warrantiesCacheKey(storeId))

export const getWarranties = async (
  slug: string,
  query: Partial<PaginationQuery> = {}
): Promise<ApiResponse<Warranty[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewWarranties")

    const parsed = PaginationQuerySchema.safeParse(query)
    if (!parsed.success) {
      throw new ValidationError("Invalid pagination params", parsed.error.flatten())
    }
    const { page, limit, search, sortBy, sortOrder } = parsed.data

    const orderBy = resolveSortColumn(
      { name: warranty.name, createdAt: warranty.createdAt },
      sortBy,
      "createdAt",
      sortOrder
    )

    const conditions = [eq(warranty.storeId, ctx.store.id)]
    if (search) {
      conditions.push(
        or(ilike(warranty.name, `%${search}%`), ilike(warranty.description, `%${search}%`))!
      )
    }

    const baseQuery = db
      .select()
      .from(warranty)
      .where(and(...conditions))

    const countQuery = db
      .select({ total: count() })
      .from(warranty)
      .where(and(...conditions))

    const [warranties, [{ total }]] = await Promise.all([
      baseQuery.orderBy(orderBy).limit(limit).offset((page - 1) * limit),
      countQuery,
    ])

    return AppResponse.paginated(warranties, {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    })
  } catch (error) {
    return handleError("Get warranties", error)
  }
}

export const createWarranty = async (
  slug: string,
  data: WarrantyInsert
): Promise<ApiResponse<Warranty>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canCreateWarranties")

    const result = warrantyInsertSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    const [newWarranty] = await db
      .insert(warranty)
      .values({ ...result.data, storeId: ctx.store.id })
      .returning()

    await invalidateWarranties(ctx.store.id)

    return AppResponse.created(newWarranty, "Warranty created successfully")
  } catch (error) {
    return handleError("Create warranty", error)
  }
}

export const updateWarranty = async (
  slug: string,
  id: string,
  data: WarrantyUpdate
): Promise<ApiResponse<Warranty>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canEditWarranties")

    const result = warrantyUpdateSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    const [updated] = await db
      .update(warranty)
      .set(result.data)
      .where(and(eq(warranty.id, id), eq(warranty.storeId, ctx.store.id)))
      .returning()

    if (!updated) {
      throw new NotFoundError("Warranty not found")
    }

    await invalidateWarranties(ctx.store.id)

    return AppResponse.ok(updated, "Warranty updated successfully")
  } catch (error) {
    return handleError("Update warranty", error)
  }
}

export const deleteWarranty = async (slug: string, id: string): Promise<ApiResponse<never>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canDeleteWarranties")

    const [existing] = await db
      .select()
      .from(warranty)
      .where(and(eq(warranty.id, id), eq(warranty.storeId, ctx.store.id)))
      .limit(1)

    if (!existing) {
      throw new NotFoundError("Warranty not found")
    }

    const [{ productsCount }] = await db
      .select({ productsCount: count(product.id) })
      .from(product)
      .where(eq(product.warrantyId, id))

    if (productsCount > 0) {
      throw new ConflictError("Cannot delete a warranty that still has products assigned to it.")
    }

    await db.delete(warranty).where(eq(warranty.id, id))

    await invalidateWarranties(ctx.store.id)

    return AppResponse.noContent("Warranty deleted successfully")
  } catch (error) {
    return handleError("Delete warranty", error)
  }
}
