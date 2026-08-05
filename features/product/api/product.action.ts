"use server"

import { and, count, eq, ilike, inArray, isNotNull, lt, lte, or, type SQL } from "drizzle-orm"

import db from "@/lib/database/db"
import {
  brand,
  branch,
  category,
  customAttribute,
  product,
  productCustomAttributeValue,
  subCategory,
  unit,
  warranty,
  type Brand,
  type Branch,
  type Category,
  type CustomAttribute,
  type Product,
  type ProductCustomAttributeValue,
  type SubCategory,
  type Unit,
  type Warranty,
} from "@/lib/database/schemas"
import {
  ProductInsert,
  ProductUpdate,
  productInsertSchema,
  productUpdateSchema,
} from "@/lib/database/zod/products"
import {
  getStoreContext,
  requirePermission,
  type StoreContext,
} from "@/lib/database/queries/store-context"
import { ApiResponse, AppResponse } from "@/lib/common/response"
import { PaginationQuery, PaginationQuerySchema, resolveSortColumn } from "@/lib/common/pagination"
import { BadRequestError, NotFoundError, ValidationError, handleError } from "@/lib/common/errors"
import redis from "@/lib/cache/redis"
import {
  PRODUCTS_EXPIRED_KEY,
  PRODUCTS_FORM_DATA_KEY,
  PRODUCTS_KEY,
  PRODUCTS_LIST_KEY,
  PRODUCTS_LOW_STOCK_KEY,
  TTL_MEDIUM,
} from "@/lib/cache/constants"
import { invalidateDerivedCaches } from "@/lib/cache/invalidate"
import { buildListCacheKey, getCachedList, setCachedList, type CachedPage } from "@/lib/cache/list-cache"

export type ProductWithRelations = Product & {
  category: Category | null
  subCategory: SubCategory | null
  brand: Brand | null
  unit: Unit | null
  warranty: Warranty | null
  customAttributeValues: ProductCustomAttributeValue[]
}

const productsCacheKey = (storeId: string) => `${PRODUCTS_KEY}${storeId}`

const invalidateProducts = (storeId: string) => invalidateDerivedCaches(storeId)

async function fetchProducts(ctx: StoreContext): Promise<ProductWithRelations[]> {
  const cacheKey = productsCacheKey(ctx.store.id)
  const cached = await redis.get(cacheKey)
  if (cached) {
    return cached as ProductWithRelations[]
  }

  const products = await db.query.product.findMany({
    where: { storeId: ctx.store.id },
    orderBy: { createdAt: "asc" },
    with: {
      category: true,
      subCategory: true,
      brand: true,
      unit: true,
      warranty: true,
      customAttributeValues: true,
    },
  })

  await redis.set(cacheKey, products, { ex: TTL_MEDIUM })

  return products
}

/** Unpaginated full-catalog fetch for consumers that need every product (e.g. label printing pickers). */
export const getAllProducts = async (slug: string): Promise<ApiResponse<ProductWithRelations[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewProducts")

    const products = await fetchProducts(ctx)

    return AppResponse.ok(products)
  } catch (error) {
    return handleError("Get products", error)
  }
}

const productSelection = {
  id: product.id,
  storeId: product.storeId,
  name: product.name,
  sku: product.sku,
  barcode: product.barcode,
  image: product.image,
  categoryId: product.categoryId,
  subCategoryId: product.subCategoryId,
  brandId: product.brandId,
  unitId: product.unitId,
  warrantyId: product.warrantyId,
  price: product.price,
  cost: product.cost,
  quantity: product.quantity,
  lowStockThreshold: product.lowStockThreshold,
  expiryDate: product.expiryDate,
  status: product.status,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,

  categoryStoreId: category.storeId,
  categoryName: category.name,
  categorySlug: category.slug,
  categoryStatus: category.status,
  categoryCreatedAt: category.createdAt,
  categoryUpdatedAt: category.updatedAt,

  subCategoryStoreId: subCategory.storeId,
  subCategoryCategoryId: subCategory.categoryId,
  subCategoryName: subCategory.name,
  subCategoryStatus: subCategory.status,
  subCategoryCreatedAt: subCategory.createdAt,
  subCategoryUpdatedAt: subCategory.updatedAt,

  brandStoreId: brand.storeId,
  brandName: brand.name,
  brandStatus: brand.status,
  brandCreatedAt: brand.createdAt,
  brandUpdatedAt: brand.updatedAt,

  unitStoreId: unit.storeId,
  unitName: unit.name,
  unitShortName: unit.shortName,
  unitStatus: unit.status,
  unitCreatedAt: unit.createdAt,
  unitUpdatedAt: unit.updatedAt,

  warrantyStoreId: warranty.storeId,
  warrantyName: warranty.name,
  warrantyDuration: warranty.duration,
  warrantyDescription: warranty.description,
  warrantyStatus: warranty.status,
  warrantyCreatedAt: warranty.createdAt,
  warrantyUpdatedAt: warranty.updatedAt,
}

function productJoinedRows(conditions: SQL[]) {
  return db
    .select(productSelection)
    .from(product)
    .innerJoin(category, eq(product.categoryId, category.id))
    .leftJoin(subCategory, eq(product.subCategoryId, subCategory.id))
    .leftJoin(brand, eq(product.brandId, brand.id))
    .leftJoin(unit, eq(product.unitId, unit.id))
    .leftJoin(warranty, eq(product.warrantyId, warranty.id))
    .where(and(...conditions))
}

type ProductRow = Awaited<ReturnType<typeof productJoinedRows>>[number]

function mapProductRow(r: ProductRow): Omit<ProductWithRelations, "customAttributeValues"> {
  return {
    id: r.id,
    storeId: r.storeId,
    name: r.name,
    sku: r.sku,
    barcode: r.barcode,
    image: r.image,
    categoryId: r.categoryId,
    subCategoryId: r.subCategoryId,
    brandId: r.brandId,
    unitId: r.unitId,
    warrantyId: r.warrantyId,
    price: r.price,
    cost: r.cost,
    quantity: r.quantity,
    lowStockThreshold: r.lowStockThreshold,
    expiryDate: r.expiryDate,
    status: r.status,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    category: {
      id: r.categoryId,
      storeId: r.categoryStoreId,
      name: r.categoryName,
      slug: r.categorySlug,
      status: r.categoryStatus,
      createdAt: r.categoryCreatedAt,
      updatedAt: r.categoryUpdatedAt,
    },
    subCategory: r.subCategoryId
      ? {
          id: r.subCategoryId,
          storeId: r.subCategoryStoreId!,
          categoryId: r.subCategoryCategoryId!,
          name: r.subCategoryName!,
          status: r.subCategoryStatus!,
          createdAt: r.subCategoryCreatedAt!,
          updatedAt: r.subCategoryUpdatedAt!,
        }
      : null,
    brand: r.brandId
      ? {
          id: r.brandId,
          storeId: r.brandStoreId!,
          name: r.brandName!,
          status: r.brandStatus!,
          createdAt: r.brandCreatedAt!,
          updatedAt: r.brandUpdatedAt!,
        }
      : null,
    unit: r.unitId
      ? {
          id: r.unitId,
          storeId: r.unitStoreId!,
          name: r.unitName!,
          shortName: r.unitShortName!,
          status: r.unitStatus!,
          createdAt: r.unitCreatedAt!,
          updatedAt: r.unitUpdatedAt!,
        }
      : null,
    warranty: r.warrantyId
      ? {
          id: r.warrantyId,
          storeId: r.warrantyStoreId!,
          name: r.warrantyName!,
          duration: r.warrantyDuration!,
          description: r.warrantyDescription,
          status: r.warrantyStatus!,
          createdAt: r.warrantyCreatedAt!,
          updatedAt: r.warrantyUpdatedAt!,
        }
      : null,
  }
}

async function attachCustomAttributeValues(
  rows: Omit<ProductWithRelations, "customAttributeValues">[]
): Promise<ProductWithRelations[]> {
  const productIds = rows.map((p) => p.id)
  const values = productIds.length
    ? await db
        .select()
        .from(productCustomAttributeValue)
        .where(inArray(productCustomAttributeValue.productId, productIds))
    : []

  const byProduct = new Map<string, ProductCustomAttributeValue[]>()
  for (const value of values) {
    const list = byProduct.get(value.productId) ?? []
    list.push(value)
    byProduct.set(value.productId, list)
  }

  return rows.map((p) => ({ ...p, customAttributeValues: byProduct.get(p.id) ?? [] }))
}

export interface ProductListParams extends Partial<PaginationQuery> {
  categoryId?: string
  brandId?: string
}

export const getProducts = async (
  slug: string,
  query: ProductListParams = {}
): Promise<ApiResponse<ProductWithRelations[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewProducts")

    const { categoryId, brandId, ...paginationQuery } = query
    const parsed = PaginationQuerySchema.safeParse(paginationQuery)
    if (!parsed.success) {
      throw new ValidationError("Invalid pagination params", parsed.error.flatten())
    }
    const { page, limit, search, sortBy, sortOrder } = parsed.data

    const cacheKey = buildListCacheKey(PRODUCTS_LIST_KEY, ctx.store.id, {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      categoryId,
      brandId,
    })
    const cached = await getCachedList<CachedPage<ProductWithRelations>>(cacheKey)
    if (cached) {
      return AppResponse.paginated(cached.rows, {
        page,
        limit,
        total: cached.total,
        totalPages: Math.max(1, Math.ceil(cached.total / limit)),
      })
    }

    const orderBy = resolveSortColumn(
      {
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        createdAt: product.createdAt,
      },
      sortBy,
      "createdAt",
      sortOrder
    )

    const conditions = [eq(product.storeId, ctx.store.id)]
    if (search) {
      conditions.push(
        or(
          ilike(product.name, `%${search}%`),
          ilike(product.sku, `%${search}%`),
          ilike(product.barcode, `%${search}%`)
        )!
      )
    }
    if (categoryId) conditions.push(eq(product.categoryId, categoryId))
    if (brandId) conditions.push(eq(product.brandId, brandId))

    const countQuery = db.select({ total: count() }).from(product).where(and(...conditions))

    const [rows, [{ total }]] = await Promise.all([
      productJoinedRows(conditions).orderBy(orderBy).limit(limit).offset((page - 1) * limit),
      countQuery,
    ])

    const products = await attachCustomAttributeValues(rows.map(mapProductRow))

    await setCachedList(cacheKey, { rows: products, total })

    return AppResponse.paginated(products, {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    })
  } catch (error) {
    return handleError("Get products", error)
  }
}

export const getExpiredProducts = async (
  slug: string,
  query: Partial<PaginationQuery> = {}
): Promise<ApiResponse<ProductWithRelations[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewExpiredProducts")

    const parsed = PaginationQuerySchema.safeParse(query)
    if (!parsed.success) {
      throw new ValidationError("Invalid pagination params", parsed.error.flatten())
    }
    const { page, limit, search, sortBy, sortOrder } = parsed.data

    const cacheKey = buildListCacheKey(PRODUCTS_EXPIRED_KEY, ctx.store.id, {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    })
    const cached = await getCachedList<CachedPage<ProductWithRelations>>(cacheKey)
    if (cached) {
      return AppResponse.paginated(cached.rows, {
        page,
        limit,
        total: cached.total,
        totalPages: Math.max(1, Math.ceil(cached.total / limit)),
      })
    }

    const orderBy = resolveSortColumn(
      {
        name: product.name,
        expiryDate: product.expiryDate,
        quantity: product.quantity,
        createdAt: product.createdAt,
      },
      sortBy,
      "createdAt",
      sortOrder
    )

    const today = new Date().toISOString().slice(0, 10)
    const conditions = [
      eq(product.storeId, ctx.store.id),
      isNotNull(product.expiryDate),
      lt(product.expiryDate, today),
    ]
    if (search) {
      conditions.push(
        or(
          ilike(product.name, `%${search}%`),
          ilike(product.sku, `%${search}%`),
          ilike(product.barcode, `%${search}%`)
        )!
      )
    }

    const countQuery = db.select({ total: count() }).from(product).where(and(...conditions))

    const [rows, [{ total }]] = await Promise.all([
      productJoinedRows(conditions).orderBy(orderBy).limit(limit).offset((page - 1) * limit),
      countQuery,
    ])

    const products = await attachCustomAttributeValues(rows.map(mapProductRow))

    await setCachedList(cacheKey, { rows: products, total })

    return AppResponse.paginated(products, {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    })
  } catch (error) {
    return handleError("Get expired products", error)
  }
}

export const getLowStockProducts = async (
  slug: string,
  query: Partial<PaginationQuery> = {}
): Promise<ApiResponse<ProductWithRelations[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewLowStocks")

    const parsed = PaginationQuerySchema.safeParse(query)
    if (!parsed.success) {
      throw new ValidationError("Invalid pagination params", parsed.error.flatten())
    }
    const { page, limit, search, sortBy, sortOrder } = parsed.data

    const cacheKey = buildListCacheKey(PRODUCTS_LOW_STOCK_KEY, ctx.store.id, {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    })
    const cached = await getCachedList<CachedPage<ProductWithRelations>>(cacheKey)
    if (cached) {
      return AppResponse.paginated(cached.rows, {
        page,
        limit,
        total: cached.total,
        totalPages: Math.max(1, Math.ceil(cached.total / limit)),
      })
    }

    const orderBy = resolveSortColumn(
      {
        name: product.name,
        quantity: product.quantity,
        threshold: product.lowStockThreshold,
        createdAt: product.createdAt,
      },
      sortBy,
      "createdAt",
      sortOrder
    )

    const conditions = [
      eq(product.storeId, ctx.store.id),
      lte(product.quantity, product.lowStockThreshold),
    ]
    if (search) {
      conditions.push(
        or(
          ilike(product.name, `%${search}%`),
          ilike(product.sku, `%${search}%`),
          ilike(product.barcode, `%${search}%`)
        )!
      )
    }

    const countQuery = db.select({ total: count() }).from(product).where(and(...conditions))

    const [rows, [{ total }]] = await Promise.all([
      productJoinedRows(conditions).orderBy(orderBy).limit(limit).offset((page - 1) * limit),
      countQuery,
    ])

    const products = await attachCustomAttributeValues(rows.map(mapProductRow))

    await setCachedList(cacheKey, { rows: products, total })

    return AppResponse.paginated(products, {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    })
  } catch (error) {
    return handleError("Get low stock products", error)
  }
}

export interface ProductCreateFormData {
  categories: Category[]
  brands: Brand[]
  units: Unit[]
  warranties: Warranty[]
  branches: Branch[]
  customAttributes: CustomAttribute[]
}

export const getProductCreateFormData = async (
  slug: string
): Promise<ApiResponse<ProductCreateFormData>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewProducts")

    const cacheKey = `${PRODUCTS_FORM_DATA_KEY}${ctx.store.id}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return AppResponse.ok(cached as ProductCreateFormData)
    }

    const [categories, brands, units, warranties, branches, customAttributes] = await Promise.all([
      db.select().from(category).where(eq(category.storeId, ctx.store.id)).orderBy(category.name),
      db.select().from(brand).where(eq(brand.storeId, ctx.store.id)).orderBy(brand.name),
      db.select().from(unit).where(eq(unit.storeId, ctx.store.id)).orderBy(unit.name),
      db.select().from(warranty).where(eq(warranty.storeId, ctx.store.id)).orderBy(warranty.name),
      db.select().from(branch).where(eq(branch.storeId, ctx.store.id)).orderBy(branch.name),
      db
        .select()
        .from(customAttribute)
        .where(and(eq(customAttribute.storeId, ctx.store.id), eq(customAttribute.status, "active")))
        .orderBy(customAttribute.name),
    ])

    const data: ProductCreateFormData = { categories, brands, units, warranties, branches, customAttributes }
    await redis.set(cacheKey, data, { ex: TTL_MEDIUM })

    return AppResponse.ok(data)
  } catch (error) {
    return handleError("Get product create form data", error)
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

async function assertSubCategoryBelongsToStore(storeId: string, subCategoryId: string) {
  const [existing] = await db
    .select({ id: subCategory.id })
    .from(subCategory)
    .where(and(eq(subCategory.id, subCategoryId), eq(subCategory.storeId, storeId)))
    .limit(1)
  if (!existing) throw new BadRequestError("Selected sub-category does not belong to this store.")
}

async function assertBrandBelongsToStore(storeId: string, brandId: string) {
  const [existing] = await db
    .select({ id: brand.id })
    .from(brand)
    .where(and(eq(brand.id, brandId), eq(brand.storeId, storeId)))
    .limit(1)
  if (!existing) throw new BadRequestError("Selected brand does not belong to this store.")
}

async function assertUnitBelongsToStore(storeId: string, unitId: string) {
  const [existing] = await db
    .select({ id: unit.id })
    .from(unit)
    .where(and(eq(unit.id, unitId), eq(unit.storeId, storeId)))
    .limit(1)
  if (!existing) throw new BadRequestError("Selected unit does not belong to this store.")
}

async function assertWarrantyBelongsToStore(storeId: string, warrantyId: string) {
  const [existing] = await db
    .select({ id: warranty.id })
    .from(warranty)
    .where(and(eq(warranty.id, warrantyId), eq(warranty.storeId, storeId)))
    .limit(1)
  if (!existing) throw new BadRequestError("Selected warranty does not belong to this store.")
}

async function assertCustomAttributesBelongToStore(storeId: string, attributeIds: string[]) {
  if (attributeIds.length === 0) return
  const uniqueIds = [...new Set(attributeIds)]
  const rows = await db
    .select({ id: customAttribute.id })
    .from(customAttribute)
    .where(and(inArray(customAttribute.id, uniqueIds), eq(customAttribute.storeId, storeId)))
  if (rows.length !== uniqueIds.length) {
    throw new BadRequestError("One or more custom attributes don't belong to this store.")
  }
}

export const createProduct = async (
  slug: string,
  data: ProductInsert
): Promise<ApiResponse<Product>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canCreateProducts")

    const result = productInsertSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    await assertCategoryBelongsToStore(ctx.store.id, result.data.categoryId)
    if (result.data.subCategoryId) await assertSubCategoryBelongsToStore(ctx.store.id, result.data.subCategoryId)
    if (result.data.brandId) await assertBrandBelongsToStore(ctx.store.id, result.data.brandId)
    if (result.data.unitId) await assertUnitBelongsToStore(ctx.store.id, result.data.unitId)
    if (result.data.warrantyId) await assertWarrantyBelongsToStore(ctx.store.id, result.data.warrantyId)
    if (result.data.customAttributeValues?.length) {
      await assertCustomAttributesBelongToStore(
        ctx.store.id,
        result.data.customAttributeValues.map((v) => v.attributeId)
      )
    }

    const { price, cost, customAttributeValues, ...rest } = result.data

    const newProduct = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(product)
        .values({
          ...rest,
          storeId: ctx.store.id,
          price: String(price),
          cost: String(cost),
        })
        .returning()

      if (customAttributeValues?.length) {
        await tx.insert(productCustomAttributeValue).values(
          customAttributeValues.map(({ attributeId, value }) => ({
            productId: created.id,
            attributeId,
            value,
          }))
        )
      }

      return created
    })

    await invalidateProducts(ctx.store.id)

    return AppResponse.created(newProduct, "Product created successfully")
  } catch (error) {
    return handleError("Create product", error)
  }
}

export const updateProduct = async (
  slug: string,
  id: string,
  data: ProductUpdate
): Promise<ApiResponse<Product>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canEditProducts")

    const result = productUpdateSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    if (result.data.categoryId) {
      await assertCategoryBelongsToStore(ctx.store.id, result.data.categoryId)
    }
    if (result.data.subCategoryId) await assertSubCategoryBelongsToStore(ctx.store.id, result.data.subCategoryId)
    if (result.data.brandId) await assertBrandBelongsToStore(ctx.store.id, result.data.brandId)
    if (result.data.unitId) await assertUnitBelongsToStore(ctx.store.id, result.data.unitId)
    if (result.data.warrantyId) await assertWarrantyBelongsToStore(ctx.store.id, result.data.warrantyId)
    if (result.data.customAttributeValues?.length) {
      await assertCustomAttributesBelongToStore(
        ctx.store.id,
        result.data.customAttributeValues.map((v) => v.attributeId)
      )
    }

    const { price, cost, customAttributeValues, ...rest } = result.data

    const updated = await db.transaction(async (tx) => {
      const [row] = await tx
        .update(product)
        .set({
          ...rest,
          ...(price !== undefined ? { price: String(price) } : {}),
          ...(cost !== undefined ? { cost: String(cost) } : {}),
        })
        .where(and(eq(product.id, id), eq(product.storeId, ctx.store.id)))
        .returning()

      if (!row) return row

      if (customAttributeValues !== undefined) {
        await tx.delete(productCustomAttributeValue).where(eq(productCustomAttributeValue.productId, id))
        if (customAttributeValues.length) {
          await tx.insert(productCustomAttributeValue).values(
            customAttributeValues.map(({ attributeId, value }) => ({
              productId: id,
              attributeId,
              value,
            }))
          )
        }
      }

      return row
    })

    if (!updated) {
      throw new NotFoundError("Product not found")
    }

    await invalidateProducts(ctx.store.id)

    return AppResponse.ok(updated, "Product updated successfully")
  } catch (error) {
    return handleError("Update product", error)
  }
}

export const deleteProduct = async (slug: string, id: string): Promise<ApiResponse<never>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canDeleteProducts")

    const [deleted] = await db
      .delete(product)
      .where(and(eq(product.id, id), eq(product.storeId, ctx.store.id)))
      .returning()

    if (!deleted) {
      throw new NotFoundError("Product not found")
    }

    await invalidateProducts(ctx.store.id)

    return AppResponse.noContent("Product deleted successfully")
  } catch (error) {
    return handleError("Delete product", error)
  }
}
