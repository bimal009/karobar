"use server"

import { and, eq } from "drizzle-orm"

import db from "@/lib/database/db"
import { biller, type Biller } from "@/lib/database/schemas"
import {
  BillerInsert,
  BillerUpdate,
  billerInsertSchema,
  billerUpdateSchema,
} from "@/lib/database/zod/billers"
import { getStoreContext, requirePermission } from "@/lib/database/queries/store-context"
import { ApiResponse, AppResponse } from "@/lib/common/response"
import { NotFoundError, ValidationError, handleError } from "@/lib/common/errors"
import redis from "@/lib/cache/redis"
import { BILLERS_KEY, TTL_MEDIUM } from "@/lib/cache/constants"

const billersCacheKey = (storeId: string) => `${BILLERS_KEY}${storeId}`

const invalidateBillers = (storeId: string) => redis.del(billersCacheKey(storeId))

export const getBillers = async (slug: string): Promise<ApiResponse<Biller[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canManageSettings")

    const cacheKey = billersCacheKey(ctx.store.id)
    const cached = await redis.get(cacheKey)
    if (cached) {
      return AppResponse.ok(cached as Biller[])
    }

    const billers = await db
      .select()
      .from(biller)
      .where(eq(biller.storeId, ctx.store.id))
      .orderBy(biller.createdAt)

    await redis.set(cacheKey, billers, { ex: TTL_MEDIUM })

    return AppResponse.ok(billers)
  } catch (error) {
    return handleError("Get billers", error)
  }
}

export const createBiller = async (
  slug: string,
  data: BillerInsert
): Promise<ApiResponse<Biller>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canManageSettings")

    const result = billerInsertSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    const [newBiller] = await db
      .insert(biller)
      .values({ ...result.data, storeId: ctx.store.id })
      .returning()

    await invalidateBillers(ctx.store.id)

    return AppResponse.created(newBiller, "Biller created successfully")
  } catch (error) {
    return handleError("Create biller", error)
  }
}

export const updateBiller = async (
  slug: string,
  id: string,
  data: BillerUpdate
): Promise<ApiResponse<Biller>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canManageSettings")

    const result = billerUpdateSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    const [updated] = await db
      .update(biller)
      .set(result.data)
      .where(and(eq(biller.id, id), eq(biller.storeId, ctx.store.id)))
      .returning()

    if (!updated) {
      throw new NotFoundError("Biller not found")
    }

    await invalidateBillers(ctx.store.id)

    return AppResponse.ok(updated, "Biller updated successfully")
  } catch (error) {
    return handleError("Update biller", error)
  }
}

export const deleteBiller = async (slug: string, id: string): Promise<ApiResponse<never>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canManageSettings")

    const [deleted] = await db
      .delete(biller)
      .where(and(eq(biller.id, id), eq(biller.storeId, ctx.store.id)))
      .returning()

    if (!deleted) {
      throw new NotFoundError("Biller not found")
    }

    await invalidateBillers(ctx.store.id)

    return AppResponse.noContent("Biller deleted successfully")
  } catch (error) {
    return handleError("Delete biller", error)
  }
}
