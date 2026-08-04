"use server"

import { and, count, eq } from "drizzle-orm"

import db from "@/lib/database/db"
import { product, unit, type Unit } from "@/lib/database/schemas"
import { UnitInsert, UnitUpdate, unitInsertSchema, unitUpdateSchema } from "@/lib/database/zod/units"
import { getStoreContext, requirePermission } from "@/lib/database/queries/store-context"
import { ApiResponse, AppResponse } from "@/lib/common/response"
import { ConflictError, NotFoundError, ValidationError, handleError } from "@/lib/common/errors"
import redis from "@/lib/cache/redis"
import { TTL_MEDIUM, UNITS_KEY } from "@/lib/cache/constants"

const unitsCacheKey = (storeId: string) => `${UNITS_KEY}${storeId}`

const invalidateUnits = (storeId: string) => redis.del(unitsCacheKey(storeId))

export const getUnits = async (slug: string): Promise<ApiResponse<Unit[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewUnits")

    const cacheKey = unitsCacheKey(ctx.store.id)
    const cached = await redis.get(cacheKey)
    if (cached) {
      return AppResponse.ok(cached as Unit[])
    }

    const units = await db
      .select()
      .from(unit)
      .where(eq(unit.storeId, ctx.store.id))
      .orderBy(unit.createdAt)

    await redis.set(cacheKey, units, { ex: TTL_MEDIUM })

    return AppResponse.ok(units)
  } catch (error) {
    return handleError("Get units", error)
  }
}

export const createUnit = async (
  slug: string,
  data: UnitInsert
): Promise<ApiResponse<Unit>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canCreateUnits")

    const result = unitInsertSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    const [newUnit] = await db
      .insert(unit)
      .values({ ...result.data, storeId: ctx.store.id })
      .returning()

    await invalidateUnits(ctx.store.id)

    return AppResponse.created(newUnit, "Unit created successfully")
  } catch (error) {
    return handleError("Create unit", error)
  }
}

export const updateUnit = async (
  slug: string,
  id: string,
  data: UnitUpdate
): Promise<ApiResponse<Unit>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canEditUnits")

    const result = unitUpdateSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    const [updated] = await db
      .update(unit)
      .set(result.data)
      .where(and(eq(unit.id, id), eq(unit.storeId, ctx.store.id)))
      .returning()

    if (!updated) {
      throw new NotFoundError("Unit not found")
    }

    await invalidateUnits(ctx.store.id)

    return AppResponse.ok(updated, "Unit updated successfully")
  } catch (error) {
    return handleError("Update unit", error)
  }
}

export const deleteUnit = async (slug: string, id: string): Promise<ApiResponse<never>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canDeleteUnits")

    const [existing] = await db
      .select()
      .from(unit)
      .where(and(eq(unit.id, id), eq(unit.storeId, ctx.store.id)))
      .limit(1)

    if (!existing) {
      throw new NotFoundError("Unit not found")
    }

    const [{ productsCount }] = await db
      .select({ productsCount: count(product.id) })
      .from(product)
      .where(eq(product.unitId, id))

    if (productsCount > 0) {
      throw new ConflictError("Cannot delete a unit that still has products assigned to it.")
    }

    await db.delete(unit).where(eq(unit.id, id))

    await invalidateUnits(ctx.store.id)

    return AppResponse.noContent("Unit deleted successfully")
  } catch (error) {
    return handleError("Delete unit", error)
  }
}
