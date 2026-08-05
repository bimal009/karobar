"use server"

import { and, count, eq, ilike } from "drizzle-orm"

import db from "@/lib/database/db"
import { brand, product, type Brand } from "@/lib/database/schemas"
import { BrandInsert, BrandUpdate, brandInsertSchema, brandUpdateSchema } from "@/lib/database/zod/brands"
import { getStoreContext, requirePermission } from "@/lib/database/queries/store-context"
import { ApiResponse, AppResponse } from "@/lib/common/response"
import { PaginationQuery, PaginationQuerySchema, resolveSortColumn } from "@/lib/common/pagination"
import { ConflictError, NotFoundError, ValidationError, handleError } from "@/lib/common/errors"
import { BRANDS_KEY } from "@/lib/cache/constants"
import { invalidateDerivedCaches } from "@/lib/cache/invalidate"
import { buildListCacheKey, getCachedList, invalidateListCache, setCachedList, type CachedPage } from "@/lib/cache/list-cache"

export type BrandWithProductCount = Brand & { productsCount: number }

const invalidateBrands = (storeId: string) =>
  Promise.all([invalidateListCache(BRANDS_KEY, storeId), invalidateDerivedCaches(storeId)])

export const getBrands = async (
  slug: string,
  query: Partial<PaginationQuery> = {}
): Promise<ApiResponse<BrandWithProductCount[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewBrands")

    const parsed = PaginationQuerySchema.safeParse(query)
    if (!parsed.success) {
      throw new ValidationError("Invalid pagination params", parsed.error.flatten())
    }
    const { page, limit, search, sortBy, sortOrder } = parsed.data

    const cacheKey = buildListCacheKey(BRANDS_KEY, ctx.store.id, { page, limit, search, sortBy, sortOrder })
    const cached = await getCachedList<CachedPage<BrandWithProductCount>>(cacheKey)
    if (cached) {
      return AppResponse.paginated(cached.rows, {
        page,
        limit,
        total: cached.total,
        totalPages: Math.max(1, Math.ceil(cached.total / limit)),
      })
    }

    const orderBy = resolveSortColumn(
      { name: brand.name, createdAt: brand.createdAt },
      sortBy,
      "createdAt",
      sortOrder
    )

    const conditions = [eq(brand.storeId, ctx.store.id)]
    if (search) {
      conditions.push(ilike(brand.name, `%${search}%`))
    }

    const baseQuery = db
      .select({ brand, productsCount: count(product.id) })
      .from(brand)
      .leftJoin(product, eq(product.brandId, brand.id))
      .where(and(...conditions))
      .groupBy(brand.id)

    const countQuery = db
      .select({ total: count() })
      .from(brand)
      .where(and(...conditions))

    const [rows, [{ total }]] = await Promise.all([
      baseQuery.orderBy(orderBy).limit(limit).offset((page - 1) * limit),
      countQuery,
    ])

    const brands = rows.map(({ brand: b, productsCount }) => ({ ...b, productsCount }))

    await setCachedList(cacheKey, { rows: brands, total })

    return AppResponse.paginated(brands, {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    })
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
