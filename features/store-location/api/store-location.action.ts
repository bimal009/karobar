"use server"

import { and, count, eq, ilike, or } from "drizzle-orm"

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
import { PaginationQuery, PaginationQuerySchema, resolveSortColumn } from "@/lib/common/pagination"
import { NotFoundError, ValidationError, handleError } from "@/lib/common/errors"
import redis from "@/lib/cache/redis"
import { STORE_LOCATIONS_KEY, TTL_MEDIUM } from "@/lib/cache/constants"
import { buildListCacheKey, getCachedList, invalidateListCache, setCachedList, type CachedPage } from "@/lib/cache/list-cache"

const storeLocationsCacheKey = (storeId: string) => `${STORE_LOCATIONS_KEY}${storeId}`

const invalidateStoreLocations = (storeId: string) =>
  Promise.all([redis.del(storeLocationsCacheKey(storeId)), invalidateListCache(STORE_LOCATIONS_KEY, storeId)])

export const getStoreLocations = async (
  slug: string,
  query: Partial<PaginationQuery> = {}
): Promise<ApiResponse<StoreLocation[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canManageSettings")

    const parsed = PaginationQuerySchema.safeParse(query)
    if (!parsed.success) {
      throw new ValidationError("Invalid pagination params", parsed.error.flatten())
    }
    const { page, limit, search, sortBy, sortOrder } = parsed.data

    const cacheKey = buildListCacheKey(STORE_LOCATIONS_KEY, ctx.store.id, { page, limit, search, sortBy, sortOrder })
    const cached = await getCachedList<CachedPage<StoreLocation>>(cacheKey)
    if (cached) {
      return AppResponse.paginated(cached.rows, {
        page,
        limit,
        total: cached.total,
        totalPages: Math.max(1, Math.ceil(cached.total / limit)),
      })
    }

    const orderBy = resolveSortColumn(
      { name: storeLocation.name, location: storeLocation.location, createdAt: storeLocation.createdAt },
      sortBy,
      "createdAt",
      sortOrder
    )

    const conditions = [eq(storeLocation.storeId, ctx.store.id)]
    if (search) {
      conditions.push(
        or(
          ilike(storeLocation.name, `%${search}%`),
          ilike(storeLocation.location, `%${search}%`),
          ilike(storeLocation.manager, `%${search}%`)
        )!
      )
    }

    const baseQuery = db
      .select()
      .from(storeLocation)
      .where(and(...conditions))

    const countQuery = db
      .select({ total: count() })
      .from(storeLocation)
      .where(and(...conditions))

    const [stores, [{ total }]] = await Promise.all([
      baseQuery.orderBy(orderBy).limit(limit).offset((page - 1) * limit),
      countQuery,
    ])

    await setCachedList(cacheKey, { rows: stores, total })

    return AppResponse.paginated(stores, {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    })
  } catch (error) {
    return handleError("Get store locations", error)
  }
}

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
