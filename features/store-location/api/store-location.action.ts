"use server"

import { and, eq } from "drizzle-orm"

import db from "@/lib/database/db"
import { storeLocation, type StoreLocation } from "@/lib/database/schemas"
import {
  StoreLocationInsert,
  StoreLocationUpdate,
  storeLocationInsertSchema,
  storeLocationUpdateSchema,
} from "@/lib/database/zod/store-locations"
import { getStoreContext, requirePermission } from "@/lib/database/queries/store-context"
import { ApiResponse, AppResponse } from "@/lib/common/response"
import { NotFoundError, ValidationError, handleError } from "@/lib/common/errors"
import redis from "@/lib/cache/redis"
import { STORE_LOCATIONS_KEY, TTL_MEDIUM } from "@/lib/cache/constants"

const storeLocationsCacheKey = (storeId: string) => `${STORE_LOCATIONS_KEY}${storeId}`

const invalidateStoreLocations = (storeId: string) => redis.del(storeLocationsCacheKey(storeId))

export const getStores = async (slug: string): Promise<ApiResponse<StoreLocation[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canManageSettings")

    const cacheKey = storeLocationsCacheKey(ctx.store.id)
    const cached = await redis.get(cacheKey)
    if (cached) {
      return AppResponse.ok(cached as StoreLocation[])
    }

    const stores = await db
      .select()
      .from(storeLocation)
      .where(eq(storeLocation.storeId, ctx.store.id))
      .orderBy(storeLocation.createdAt)

    await redis.set(cacheKey, stores, { ex: TTL_MEDIUM })

    return AppResponse.ok(stores)
  } catch (error) {
    return handleError("Get stores", error)
  }
}

export const createStore = async (
  slug: string,
  data: StoreLocationInsert
): Promise<ApiResponse<StoreLocation>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canManageSettings")

    const result = storeLocationInsertSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    const [newStore] = await db
      .insert(storeLocation)
      .values({ ...result.data, storeId: ctx.store.id })
      .returning()

    await invalidateStoreLocations(ctx.store.id)

    return AppResponse.created(newStore, "Store created successfully")
  } catch (error) {
    return handleError("Create store", error)
  }
}

export const updateStore = async (
  slug: string,
  id: string,
  data: StoreLocationUpdate
): Promise<ApiResponse<StoreLocation>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canManageSettings")

    const result = storeLocationUpdateSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    const [updated] = await db
      .update(storeLocation)
      .set(result.data)
      .where(and(eq(storeLocation.id, id), eq(storeLocation.storeId, ctx.store.id)))
      .returning()

    if (!updated) {
      throw new NotFoundError("Store not found")
    }

    await invalidateStoreLocations(ctx.store.id)

    return AppResponse.ok(updated, "Store updated successfully")
  } catch (error) {
    return handleError("Update store", error)
  }
}

export const deleteStore = async (slug: string, id: string): Promise<ApiResponse<never>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canManageSettings")

    const [deleted] = await db
      .delete(storeLocation)
      .where(and(eq(storeLocation.id, id), eq(storeLocation.storeId, ctx.store.id)))
      .returning()

    if (!deleted) {
      throw new NotFoundError("Store not found")
    }

    await invalidateStoreLocations(ctx.store.id)

    return AppResponse.noContent("Store deleted successfully")
  } catch (error) {
    return handleError("Delete store", error)
  }
}
