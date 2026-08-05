"use server"

import { and, count, eq, ilike } from "drizzle-orm"

import db from "@/lib/database/db"
import { variantAttribute, type VariantAttribute } from "@/lib/database/schemas"
import {
  VariantAttributeInsert,
  VariantAttributeUpdate,
  variantAttributeInsertSchema,
  variantAttributeUpdateSchema,
} from "@/lib/database/zod/variant-attributes"
import { getStoreContext, requirePermission } from "@/lib/database/queries/store-context"
import { ApiResponse, AppResponse } from "@/lib/common/response"
import { PaginationQuery, PaginationQuerySchema, resolveSortColumn } from "@/lib/common/pagination"
import { NotFoundError, ValidationError, handleError } from "@/lib/common/errors"
import redis from "@/lib/cache/redis"
import { VARIANT_ATTRIBUTES_KEY } from "@/lib/cache/constants"

const variantAttributesCacheKey = (storeId: string) => `${VARIANT_ATTRIBUTES_KEY}${storeId}`

const invalidateVariantAttributes = (storeId: string) =>
  redis.del(variantAttributesCacheKey(storeId))

export const getVariantAttributes = async (
  slug: string,
  query: Partial<PaginationQuery> = {}
): Promise<ApiResponse<VariantAttribute[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewVariantAttributes")

    const parsed = PaginationQuerySchema.safeParse(query)
    if (!parsed.success) {
      throw new ValidationError("Invalid pagination params", parsed.error.flatten())
    }
    const { page, limit, search, sortBy, sortOrder } = parsed.data

    const orderBy = resolveSortColumn(
      { name: variantAttribute.name, createdAt: variantAttribute.createdAt },
      sortBy,
      "createdAt",
      sortOrder
    )

    const conditions = [eq(variantAttribute.storeId, ctx.store.id)]
    if (search) {
      conditions.push(ilike(variantAttribute.name, `%${search}%`))
    }

    const baseQuery = db
      .select()
      .from(variantAttribute)
      .where(and(...conditions))

    const countQuery = db
      .select({ total: count() })
      .from(variantAttribute)
      .where(and(...conditions))

    const [variantAttributes, [{ total }]] = await Promise.all([
      baseQuery.orderBy(orderBy).limit(limit).offset((page - 1) * limit),
      countQuery,
    ])

    return AppResponse.paginated(variantAttributes, {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    })
  } catch (error) {
    return handleError("Get variant attributes", error)
  }
}

export const createVariantAttribute = async (
  slug: string,
  data: VariantAttributeInsert
): Promise<ApiResponse<VariantAttribute>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canCreateVariantAttributes")

    const result = variantAttributeInsertSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    const [newVariantAttribute] = await db
      .insert(variantAttribute)
      .values({ ...result.data, storeId: ctx.store.id })
      .returning()

    await invalidateVariantAttributes(ctx.store.id)

    return AppResponse.created(newVariantAttribute, "Variant attribute created successfully")
  } catch (error) {
    return handleError("Create variant attribute", error)
  }
}

export const updateVariantAttribute = async (
  slug: string,
  id: string,
  data: VariantAttributeUpdate
): Promise<ApiResponse<VariantAttribute>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canEditVariantAttributes")

    const result = variantAttributeUpdateSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    const [updated] = await db
      .update(variantAttribute)
      .set(result.data)
      .where(and(eq(variantAttribute.id, id), eq(variantAttribute.storeId, ctx.store.id)))
      .returning()

    if (!updated) {
      throw new NotFoundError("Variant attribute not found")
    }

    await invalidateVariantAttributes(ctx.store.id)

    return AppResponse.ok(updated, "Variant attribute updated successfully")
  } catch (error) {
    return handleError("Update variant attribute", error)
  }
}

export const deleteVariantAttribute = async (slug: string, id: string): Promise<ApiResponse<never>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canDeleteVariantAttributes")

    const [deleted] = await db
      .delete(variantAttribute)
      .where(and(eq(variantAttribute.id, id), eq(variantAttribute.storeId, ctx.store.id)))
      .returning()

    if (!deleted) {
      throw new NotFoundError("Variant attribute not found")
    }

    await invalidateVariantAttributes(ctx.store.id)

    return AppResponse.noContent("Variant attribute deleted successfully")
  } catch (error) {
    return handleError("Delete variant attribute", error)
  }
}
