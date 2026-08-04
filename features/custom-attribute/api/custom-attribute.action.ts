"use server"

import { and, eq } from "drizzle-orm"

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
import { NotFoundError, ValidationError, handleError } from "@/lib/common/errors"
import redis from "@/lib/cache/redis"
import { TTL_MEDIUM, CUSTOM_ATTRIBUTES_KEY } from "@/lib/cache/constants"

const customAttributesCacheKey = (storeId: string) => `${CUSTOM_ATTRIBUTES_KEY}${storeId}`

const invalidateCustomAttributes = (storeId: string) => redis.del(customAttributesCacheKey(storeId))

export const getCustomAttributes = async (
  slug: string
): Promise<ApiResponse<CustomAttribute[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewCustomAttributes")

    const cacheKey = customAttributesCacheKey(ctx.store.id)
    const cached = await redis.get(cacheKey)
    if (cached) {
      return AppResponse.ok(cached as CustomAttribute[])
    }

    const customAttributes = await db
      .select()
      .from(customAttribute)
      .where(eq(customAttribute.storeId, ctx.store.id))
      .orderBy(customAttribute.createdAt)

    await redis.set(cacheKey, customAttributes, { ex: TTL_MEDIUM })

    return AppResponse.ok(customAttributes)
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
