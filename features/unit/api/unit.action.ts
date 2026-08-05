"use server"

import { and, count, eq, ilike, or } from "drizzle-orm"

import db from "@/lib/database/db"
import { product, unit, type Unit } from "@/lib/database/schemas"
import { UnitInsert, UnitUpdate, unitInsertSchema, unitUpdateSchema } from "@/lib/database/zod/units"
import { getStoreContext, requirePermission } from "@/lib/database/queries/store-context"
import { ApiResponse, AppResponse } from "@/lib/common/response"
import { PaginationQuery, PaginationQuerySchema, resolveSortColumn } from "@/lib/common/pagination"
import { ConflictError, NotFoundError, ValidationError, handleError } from "@/lib/common/errors"
import { UNITS_KEY } from "@/lib/cache/constants"
import { invalidateDerivedCaches } from "@/lib/cache/invalidate"
import { buildListCacheKey, getCachedList, invalidateListCache, setCachedList, type CachedPage } from "@/lib/cache/list-cache"

/** Units are embedded in cached product/product-form-data payloads, so clear those too. */
const invalidateUnits = (storeId: string) =>
  Promise.all([invalidateListCache(UNITS_KEY, storeId), invalidateDerivedCaches(storeId)])

export const getUnits = async (
  slug: string,
  query: Partial<PaginationQuery> = {}
): Promise<ApiResponse<Unit[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewUnits")

    const parsed = PaginationQuerySchema.safeParse(query)
    if (!parsed.success) {
      throw new ValidationError("Invalid pagination params", parsed.error.flatten())
    }
    const { page, limit, search, sortBy, sortOrder } = parsed.data

    const cacheKey = buildListCacheKey(UNITS_KEY, ctx.store.id, { page, limit, search, sortBy, sortOrder })
    const cached = await getCachedList<CachedPage<Unit>>(cacheKey)
    if (cached) {
      return AppResponse.paginated(cached.rows, {
        page,
        limit,
        total: cached.total,
        totalPages: Math.max(1, Math.ceil(cached.total / limit)),
      })
    }

    const orderBy = resolveSortColumn(
      { name: unit.name, createdAt: unit.createdAt },
      sortBy,
      "createdAt",
      sortOrder
    )

    const conditions = [eq(unit.storeId, ctx.store.id)]
    if (search) {
      conditions.push(or(ilike(unit.name, `%${search}%`), ilike(unit.shortName, `%${search}%`))!)
    }

    const baseQuery = db.select().from(unit).where(and(...conditions))
    const countQuery = db.select({ total: count() }).from(unit).where(and(...conditions))

    const [units, [{ total }]] = await Promise.all([
      baseQuery.orderBy(orderBy).limit(limit).offset((page - 1) * limit),
      countQuery,
    ])

    await setCachedList(cacheKey, { rows: units, total })

    return AppResponse.paginated(units, {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    })
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
