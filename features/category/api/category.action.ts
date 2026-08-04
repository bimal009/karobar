"use server"

import { and, count, eq } from "drizzle-orm"

import db from "@/lib/database/db"
import { category, product, type Category } from "@/lib/database/schemas"
import {
  CategoryInsert,
  CategoryUpdate,
  categoryInsertSchema,
  categoryUpdateSchema,
} from "@/lib/database/zod/categories"
import { getStoreContext, requirePermission } from "@/lib/database/queries/store-context"
import { ApiResponse, AppResponse } from "@/lib/common/response"
import { ConflictError, NotFoundError, ValidationError, handleError } from "@/lib/common/errors"
import redis from "@/lib/cache/redis"
import { CATEGORIES_KEY, TTL_MEDIUM } from "@/lib/cache/constants"

export type CategoryWithProductCount = Category & { productsCount: number }

const categoriesCacheKey = (storeId: string) => `${CATEGORIES_KEY}${storeId}`

const invalidateCategories = (storeId: string) => redis.del(categoriesCacheKey(storeId))

export const getCategories = async (slug: string): Promise<ApiResponse<CategoryWithProductCount[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewCategories")

    const cacheKey = categoriesCacheKey(ctx.store.id)
    const cached = await redis.get(cacheKey)
    if (cached) {
      return AppResponse.ok(cached as CategoryWithProductCount[])
    }

    const rows = await db
      .select({ category, productsCount: count(product.id) })
      .from(category)
      .leftJoin(product, eq(product.categoryId, category.id))
      .where(eq(category.storeId, ctx.store.id))
      .groupBy(category.id)
      .orderBy(category.createdAt)

    const categories = rows.map(({ category: c, productsCount }) => ({ ...c, productsCount }))
    await redis.set(cacheKey, categories, { ex: TTL_MEDIUM })

    return AppResponse.ok(categories)
  } catch (error) {
    return handleError("Get categories", error)
  }
}

export const createCategory = async (
  slug: string,
  data: CategoryInsert
): Promise<ApiResponse<Category>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canCreateCategories")

    const result = categoryInsertSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    const [newCategory] = await db
      .insert(category)
      .values({ ...result.data, storeId: ctx.store.id })
      .returning()

    await invalidateCategories(ctx.store.id)

    return AppResponse.created(newCategory, "Category created successfully")
  } catch (error) {
    return handleError("Create category", error)
  }
}

export const updateCategory = async (
  slug: string,
  id: string,
  data: CategoryUpdate
): Promise<ApiResponse<Category>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canEditCategories")

    const result = categoryUpdateSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    const [updated] = await db
      .update(category)
      .set(result.data)
      .where(and(eq(category.id, id), eq(category.storeId, ctx.store.id)))
      .returning()

    if (!updated) {
      throw new NotFoundError("Category not found")
    }

    await invalidateCategories(ctx.store.id)

    return AppResponse.ok(updated, "Category updated successfully")
  } catch (error) {
    return handleError("Update category", error)
  }
}

export const deleteCategory = async (slug: string, id: string): Promise<ApiResponse<never>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canDeleteCategories")

    const [existing] = await db
      .select()
      .from(category)
      .where(and(eq(category.id, id), eq(category.storeId, ctx.store.id)))
      .limit(1)

    if (!existing) {
      throw new NotFoundError("Category not found")
    }

    const [{ productsCount }] = await db
      .select({ productsCount: count(product.id) })
      .from(product)
      .where(eq(product.categoryId, id))

    if (productsCount > 0) {
      throw new ConflictError("Cannot delete a category that still has products assigned to it.")
    }

    await db.delete(category).where(eq(category.id, id))

    await invalidateCategories(ctx.store.id)

    return AppResponse.noContent("Category deleted successfully")
  } catch (error) {
    return handleError("Delete category", error)
  }
}
