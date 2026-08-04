"use server"

import { and, count, eq } from "drizzle-orm"

import db from "@/lib/database/db"
import { brand, product, type Brand } from "@/lib/database/schemas"
import { BrandInsert, BrandUpdate, brandInsertSchema, brandUpdateSchema } from "@/lib/database/zod/brands"
import { getStoreContext, requirePermission } from "@/lib/database/queries/store-context"
import { ApiResponse, AppResponse } from "@/lib/common/response"
import { ConflictError, NotFoundError, ValidationError, handleError } from "@/lib/common/errors"
import redis from "@/lib/cache/redis"
import { BRANDS_KEY, TTL_MEDIUM } from "@/lib/cache/constants"

export type BrandWithProductCount = Brand & { productsCount: number }

const brandsCacheKey = (storeId: string) => `${BRANDS_KEY}${storeId}`

const invalidateBrands = (storeId: string) => redis.del(brandsCacheKey(storeId))

export const getBrands = async (slug: string): Promise<ApiResponse<BrandWithProductCount[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewBrands")

    const cacheKey = brandsCacheKey(ctx.store.id)
    const cached = await redis.get(cacheKey)
    if (cached) {
      return AppResponse.ok(cached as BrandWithProductCount[])
    }

    const rows = await db
      .select({ brand, productsCount: count(product.id) })
      .from(brand)
      .leftJoin(product, eq(product.brandId, brand.id))
      .where(eq(brand.storeId, ctx.store.id))
      .groupBy(brand.id)
      .orderBy(brand.createdAt)

    const brands = rows.map(({ brand: b, productsCount }) => ({ ...b, productsCount }))
    await redis.set(cacheKey, brands, { ex: TTL_MEDIUM })

    return AppResponse.ok(brands)
  } catch (error) {
    return handleError("Get brands", error)
  }
}

export const createBrand = async (
  slug: string,
  data: BrandInsert
): Promise<ApiResponse<Brand>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canCreateBrands")

    const result = brandInsertSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    const [newBrand] = await db
      .insert(brand)
      .values({ ...result.data, storeId: ctx.store.id })
      .returning()

    await invalidateBrands(ctx.store.id)

    return AppResponse.created(newBrand, "Brand created successfully")
  } catch (error) {
    return handleError("Create brand", error)
  }
}

export const updateBrand = async (
  slug: string,
  id: string,
  data: BrandUpdate
): Promise<ApiResponse<Brand>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canEditBrands")

    const result = brandUpdateSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    const [updated] = await db
      .update(brand)
      .set(result.data)
      .where(and(eq(brand.id, id), eq(brand.storeId, ctx.store.id)))
      .returning()

    if (!updated) {
      throw new NotFoundError("Brand not found")
    }

    await invalidateBrands(ctx.store.id)

    return AppResponse.ok(updated, "Brand updated successfully")
  } catch (error) {
    return handleError("Update brand", error)
  }
}

export const deleteBrand = async (slug: string, id: string): Promise<ApiResponse<never>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canDeleteBrands")

    const [existing] = await db
      .select()
      .from(brand)
      .where(and(eq(brand.id, id), eq(brand.storeId, ctx.store.id)))
      .limit(1)

    if (!existing) {
      throw new NotFoundError("Brand not found")
    }

    const [{ productsCount }] = await db
      .select({ productsCount: count(product.id) })
      .from(product)
      .where(eq(product.brandId, id))

    if (productsCount > 0) {
      throw new ConflictError("Cannot delete a brand that still has products assigned to it.")
    }

    await db.delete(brand).where(eq(brand.id, id))

    await invalidateBrands(ctx.store.id)

    return AppResponse.noContent("Brand deleted successfully")
  } catch (error) {
    return handleError("Delete brand", error)
  }
}
