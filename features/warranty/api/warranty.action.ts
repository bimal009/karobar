"use server"

import { and, count, eq } from "drizzle-orm"

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
import { ConflictError, NotFoundError, ValidationError, handleError } from "@/lib/common/errors"
import redis from "@/lib/cache/redis"
import { TTL_MEDIUM, WARRANTIES_KEY } from "@/lib/cache/constants"

const warrantiesCacheKey = (storeId: string) => `${WARRANTIES_KEY}${storeId}`

const invalidateWarranties = (storeId: string) => redis.del(warrantiesCacheKey(storeId))

export const getWarranties = async (slug: string): Promise<ApiResponse<Warranty[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewWarranties")

    const cacheKey = warrantiesCacheKey(ctx.store.id)
    const cached = await redis.get(cacheKey)
    if (cached) {
      return AppResponse.ok(cached as Warranty[])
    }

    const warranties = await db
      .select()
      .from(warranty)
      .where(eq(warranty.storeId, ctx.store.id))
      .orderBy(warranty.createdAt)

    await redis.set(cacheKey, warranties, { ex: TTL_MEDIUM })

    return AppResponse.ok(warranties)
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
