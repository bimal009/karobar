"use server"

import { and, count, eq } from "drizzle-orm"

import db from "@/lib/database/db"
import { category, product, subCategory, type Category, type SubCategory } from "@/lib/database/schemas"
import {
  SubCategoryInsert,
  SubCategoryUpdate,
  subCategoryInsertSchema,
  subCategoryUpdateSchema,
} from "@/lib/database/zod/sub-categories"
import { getStoreContext, requirePermission } from "@/lib/database/queries/store-context"
import { ApiResponse, AppResponse } from "@/lib/common/response"
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ValidationError,
  handleError,
} from "@/lib/common/errors"
import redis from "@/lib/cache/redis"
import { SUB_CATEGORIES_KEY, TTL_MEDIUM } from "@/lib/cache/constants"

export type SubCategoryWithCategory = SubCategory & { categoryName: string; productsCount: number }

const subCategoriesCacheKey = (storeId: string) => `${SUB_CATEGORIES_KEY}${storeId}`

const invalidateSubCategories = (storeId: string) => redis.del(subCategoriesCacheKey(storeId))

export const getSubCategories = async (slug: string): Promise<ApiResponse<SubCategoryWithCategory[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewSubCategories")

    const cacheKey = subCategoriesCacheKey(ctx.store.id)
    const cached = await redis.get(cacheKey)
    if (cached) {
      return AppResponse.ok(cached as SubCategoryWithCategory[])
    }

    const rows = await db
      .select({ subCategory, categoryName: category.name, productsCount: count(product.id) })
      .from(subCategory)
      .innerJoin(category, eq(subCategory.categoryId, category.id))
      .leftJoin(product, eq(product.subCategoryId, subCategory.id))
      .where(eq(subCategory.storeId, ctx.store.id))
      .groupBy(subCategory.id, category.name)
      .orderBy(subCategory.createdAt)

    const subCategories = rows.map(({ subCategory: s, categoryName, productsCount }) => ({
      ...s,
      categoryName,
      productsCount,
    }))
    await redis.set(cacheKey, subCategories, { ex: TTL_MEDIUM })

    return AppResponse.ok(subCategories)
  } catch (error) {
    return handleError("Get sub categories", error)
  }
}

export interface SubCategoryPageData {
  subCategories: SubCategoryWithCategory[]
  categories: Category[]
}

export const getSubCategoryPageData = async (
  slug: string
): Promise<ApiResponse<SubCategoryPageData>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewSubCategories")

    const [subCategoriesRes, categories] = await Promise.all([
      getSubCategories(slug),
      db.select().from(category).where(eq(category.storeId, ctx.store.id)).orderBy(category.name),
    ])

    if (subCategoriesRes.error || !subCategoriesRes.data) {
      throw new Error(subCategoriesRes.message)
    }

    return AppResponse.ok({ subCategories: subCategoriesRes.data, categories })
  } catch (error) {
    return handleError("Get sub category page data", error)
  }
}

async function assertCategoryBelongsToStore(storeId: string, categoryId: string) {
  const [existing] = await db
    .select({ id: category.id })
    .from(category)
    .where(and(eq(category.id, categoryId), eq(category.storeId, storeId)))
    .limit(1)

  if (!existing) {
    throw new BadRequestError("Selected category does not belong to this store.")
  }
}

export const createSubCategory = async (
  slug: string,
  data: SubCategoryInsert
): Promise<ApiResponse<SubCategory>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canCreateSubCategories")

    const result = subCategoryInsertSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    await assertCategoryBelongsToStore(ctx.store.id, result.data.categoryId)

    const [newSubCategory] = await db
      .insert(subCategory)
      .values({ ...result.data, storeId: ctx.store.id })
      .returning()

    await invalidateSubCategories(ctx.store.id)

    return AppResponse.created(newSubCategory, "Sub category created successfully")
  } catch (error) {
    return handleError("Create sub category", error)
  }
}

export const updateSubCategory = async (
  slug: string,
  id: string,
  data: SubCategoryUpdate
): Promise<ApiResponse<SubCategory>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canEditSubCategories")

    const result = subCategoryUpdateSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    if (result.data.categoryId) {
      await assertCategoryBelongsToStore(ctx.store.id, result.data.categoryId)
    }

    const [updated] = await db
      .update(subCategory)
      .set(result.data)
      .where(and(eq(subCategory.id, id), eq(subCategory.storeId, ctx.store.id)))
      .returning()

    if (!updated) {
      throw new NotFoundError("Sub category not found")
    }

    await invalidateSubCategories(ctx.store.id)

    return AppResponse.ok(updated, "Sub category updated successfully")
  } catch (error) {
    return handleError("Update sub category", error)
  }
}

export const deleteSubCategory = async (slug: string, id: string): Promise<ApiResponse<never>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canDeleteSubCategories")

    const [existing] = await db
      .select()
      .from(subCategory)
      .where(and(eq(subCategory.id, id), eq(subCategory.storeId, ctx.store.id)))
      .limit(1)

    if (!existing) {
      throw new NotFoundError("Sub category not found")
    }

    const [{ productsCount }] = await db
      .select({ productsCount: count(product.id) })
      .from(product)
      .where(eq(product.subCategoryId, id))

    if (productsCount > 0) {
      throw new ConflictError("Cannot delete a sub category that still has products assigned to it.")
    }

    await db.delete(subCategory).where(eq(subCategory.id, id))

    await invalidateSubCategories(ctx.store.id)

    return AppResponse.noContent("Sub category deleted successfully")
  } catch (error) {
    return handleError("Delete sub category", error)
  }
}
