"use server"

import { and, eq } from "drizzle-orm"

import db from "@/lib/database/db"
import { warehouse, type Warehouse } from "@/lib/database/schemas"
import {
  WarehouseInsert,
  WarehouseUpdate,
  warehouseInsertSchema,
  warehouseUpdateSchema,
} from "@/lib/database/zod/warehouses"
import { getStoreContext, requirePermission } from "@/lib/database/queries/store-context"
import { ApiResponse, AppResponse } from "@/lib/common/response"
import { NotFoundError, ValidationError, handleError } from "@/lib/common/errors"
import redis from "@/lib/cache/redis"
import { TTL_MEDIUM, WAREHOUSES_KEY } from "@/lib/cache/constants"

const warehousesCacheKey = (storeId: string) => `${WAREHOUSES_KEY}${storeId}`

const invalidateWarehouses = (storeId: string) => redis.del(warehousesCacheKey(storeId))

export const getWarehouses = async (slug: string): Promise<ApiResponse<Warehouse[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewWarehouses")

    const cacheKey = warehousesCacheKey(ctx.store.id)
    const cached = await redis.get(cacheKey)
    if (cached) {
      return AppResponse.ok(cached as Warehouse[])
    }

    const warehouses = await db
      .select()
      .from(warehouse)
      .where(eq(warehouse.storeId, ctx.store.id))
      .orderBy(warehouse.createdAt)

    await redis.set(cacheKey, warehouses, { ex: TTL_MEDIUM })

    return AppResponse.ok(warehouses)
  } catch (error) {
    return handleError("Get warehouses", error)
  }
}

export const createWarehouse = async (
  slug: string,
  data: WarehouseInsert
): Promise<ApiResponse<Warehouse>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canCreateWarehouses")

    const result = warehouseInsertSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    const [newWarehouse] = await db
      .insert(warehouse)
      .values({ ...result.data, storeId: ctx.store.id })
      .returning()

    await invalidateWarehouses(ctx.store.id)

    return AppResponse.created(newWarehouse, "Warehouse created successfully")
  } catch (error) {
    return handleError("Create warehouse", error)
  }
}

export const updateWarehouse = async (
  slug: string,
  id: string,
  data: WarehouseUpdate
): Promise<ApiResponse<Warehouse>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canEditWarehouses")

    const result = warehouseUpdateSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    const [updated] = await db
      .update(warehouse)
      .set(result.data)
      .where(and(eq(warehouse.id, id), eq(warehouse.storeId, ctx.store.id)))
      .returning()

    if (!updated) {
      throw new NotFoundError("Warehouse not found")
    }

    await invalidateWarehouses(ctx.store.id)

    return AppResponse.ok(updated, "Warehouse updated successfully")
  } catch (error) {
    return handleError("Update warehouse", error)
  }
}

export const deleteWarehouse = async (slug: string, id: string): Promise<ApiResponse<never>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canDeleteWarehouses")

    const [deleted] = await db
      .delete(warehouse)
      .where(and(eq(warehouse.id, id), eq(warehouse.storeId, ctx.store.id)))
      .returning()

    if (!deleted) {
      throw new NotFoundError("Warehouse not found")
    }

    await invalidateWarehouses(ctx.store.id)

    return AppResponse.noContent("Warehouse deleted successfully")
  } catch (error) {
    return handleError("Delete warehouse", error)
  }
}
