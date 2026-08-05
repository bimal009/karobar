"use server"

import { and, count, eq, ilike } from "drizzle-orm"

import db from "@/lib/database/db"
import { customAttribute, type CustomAttribute } from "@/lib/database/schemas"
import {
  CustomAttributeInsert,
  CustomAttributeUpdate,
  customAttributeInsertSchema,
  customAttributeUpdateSchema,
} from "@/lib/database/zod/custom-attributes"
import { getStoreContext, requirePermission } from "@/lib/database/queries/store-context"
import { ApiResponse, AppResponse } from "@/lib/common/response"
import { PaginationQuery, PaginationQuerySchema, resolveSortColumn } from "@/lib/common/pagination"
import { NotFoundError, ValidationError, handleError } from "@/lib/common/errors"
import { CUSTOM_ATTRIBUTES_KEY } from "@/lib/cache/constants"
import { buildListCacheKey, getCachedList, invalidateListCache, setCachedList, type CachedPage } from "@/lib/cache/list-cache"

const invalidateCustomAttributes = (storeId: string) => invalidateListCache(CUSTOM_ATTRIBUTES_KEY, storeId)

export const getCustomAttributes = async (
  slug: string,
  query: Partial<PaginationQuery> = {}
): Promise<ApiResponse<CustomAttribute[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewCustomAttributes")

    const parsed = PaginationQuerySchema.safeParse(query)
    if (!parsed.success) {
      throw new ValidationError("Invalid pagination params", parsed.error.flatten())
    }
    const { page, limit, search, sortBy, sortOrder } = parsed.data

    const cacheKey = buildListCacheKey(CUSTOM_ATTRIBUTES_KEY, ctx.store.id, { page, limit, search, sortBy, sortOrder })
    const cached = await getCachedList<CachedPage<CustomAttribute>>(cacheKey)
    if (cached) {
      return AppResponse.paginated(cached.rows, {
        page,
        limit,
        total: cached.total,
        totalPages: Math.max(1, Math.ceil(cached.total / limit)),
      })
    }

    const orderBy = resolveSortColumn(
      { name: customAttribute.name, createdAt: customAttribute.createdAt },
      sortBy,
      "createdAt",
      sortOrder
    )

    const conditions = [eq(customAttribute.storeId, ctx.store.id)]
    if (search) {
      conditions.push(ilike(customAttribute.name, `%${search}%`))
    }

    const baseQuery = db
      .select()
      .from(customAttribute)
      .where(and(...conditions))

    const countQuery = db
      .select({ total: count() })
      .from(customAttribute)
      .where(and(...conditions))

    const [customAttributes, [{ total }]] = await Promise.all([
      baseQuery.orderBy(orderBy).limit(limit).offset((page - 1) * limit),
      countQuery,
    ])

    await setCachedList(cacheKey, { rows: customAttributes, total })

    return AppResponse.paginated(customAttributes, {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    })
  } catch (error) {
    return handleError("Get custom attributes", error)
  }
}

export const createCustomAttribute = async (
  slug: string,
  data: CustomAttributeInsert
): Promise<ApiResponse<CustomAttribute>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canCreateCustomAttributes")

    const result = customAttributeInsertSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    const [newCustomAttribute] = await db
      .insert(customAttribute)
      .values({ ...result.data, storeId: ctx.store.id })
      .returning()

    await invalidateCustomAttributes(ctx.store.id)

    return AppResponse.created(newCustomAttribute, "Custom attribute created successfully")
  } catch (error) {
    return handleError("Create custom attribute", error)
  }
}

export const updateCustomAttribute = async (
  slug: string,
  id: string,
  data: CustomAttributeUpdate
): Promise<ApiResponse<CustomAttribute>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canEditCustomAttributes")

    const result = customAttributeUpdateSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    const [updated] = await db
      .update(customAttribute)
      .set(result.data)
      .where(and(eq(customAttribute.id, id), eq(customAttribute.storeId, ctx.store.id)))
      .returning()

    if (!updated) {
      throw new NotFoundError("Custom attribute not found")
    }

    await invalidateCustomAttributes(ctx.store.id)

    return AppResponse.ok(updated, "Custom attribute updated successfully")
  } catch (error) {
    return handleError("Update custom attribute", error)
  }
}

export const deleteCustomAttribute = async (slug: string, id: string): Promise<ApiResponse<never>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canDeleteCustomAttributes")

    const [deleted] = await db
      .delete(customAttribute)
      .where(and(eq(customAttribute.id, id), eq(customAttribute.storeId, ctx.store.id)))
      .returning()

    if (!deleted) {
      throw new NotFoundError("Custom attribute not found")
    }

    await invalidateCustomAttributes(ctx.store.id)

    return AppResponse.noContent("Custom attribute deleted successfully")
  } catch (error) {
    return handleError("Delete custom attribute", error)
  }
}
