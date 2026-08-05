"use server"

import { and, count, eq, ilike, or } from "drizzle-orm"

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
import { PaginationQuery, PaginationQuerySchema, resolveSortColumn } from "@/lib/common/pagination"
import { NotFoundError, ValidationError, handleError } from "@/lib/common/errors"
import redis from "@/lib/cache/redis"
import { BILLERS_KEY } from "@/lib/cache/constants"

const billersCacheKey = (storeId: string) => `${BILLERS_KEY}${storeId}`

const invalidateBillers = (storeId: string) => redis.del(billersCacheKey(storeId))

export const getBillers = async (
  slug: string,
  query: Partial<PaginationQuery> = {}
): Promise<ApiResponse<Biller[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canManageSettings")

    const parsed = PaginationQuerySchema.safeParse(query)
    if (!parsed.success) {
      throw new ValidationError("Invalid pagination params", parsed.error.flatten())
    }
    const { page, limit, search, sortBy, sortOrder } = parsed.data

    const orderBy = resolveSortColumn(
      { name: biller.name, location: biller.location, createdAt: biller.createdAt },
      sortBy,
      "createdAt",
      sortOrder
    )

    const conditions = [eq(biller.storeId, ctx.store.id)]
    if (search) {
      conditions.push(
        or(
          ilike(biller.name, `%${search}%`),
          ilike(biller.email, `%${search}%`),
          ilike(biller.location, `%${search}%`)
        )!
      )
    }

    const baseQuery = db
      .select()
      .from(biller)
      .where(and(...conditions))

    const countQuery = db
      .select({ total: count() })
      .from(biller)
      .where(and(...conditions))

    const [billers, [{ total }]] = await Promise.all([
      baseQuery.orderBy(orderBy).limit(limit).offset((page - 1) * limit),
      countQuery,
    ])

    return AppResponse.paginated(billers, {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    })
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
