"use server"

import { and, eq } from "drizzle-orm"

import db from "@/lib/database/db"
import {
  brand,
  branch,
  category,
  customAttribute,
  product,
  productCustomAttributeValue,
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
import { BadRequestError, NotFoundError, ValidationError, handleError } from "@/lib/common/errors"
import redis from "@/lib/cache/redis"
import { PRODUCTS_KEY, TTL_MEDIUM } from "@/lib/cache/constants"

export type ProductWithRelations = Product & {
  category: Category | null
  subCategory: SubCategory | null
  brand: Brand | null
  unit: Unit | null
  warranty: Warranty | null
  customAttributeValues: ProductCustomAttributeValue[]
}

const productsCacheKey = (storeId: string) => `${PRODUCTS_KEY}${storeId}`

const invalidateProducts = (storeId: string) => redis.del(productsCacheKey(storeId))

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

export const getProducts = async (slug: string): Promise<ApiResponse<ProductWithRelations[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewProducts")

    const products = await fetchProducts(ctx)

    return AppResponse.ok(products)
  } catch (error) {
    return handleError("Get products", error)
  }
}

export const getExpiredProducts = async (slug: string): Promise<ApiResponse<ProductWithRelations[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewExpiredProducts")

    const products = await fetchProducts(ctx)
    const today = new Date().toISOString().slice(0, 10)
    const expired = products.filter((p) => p.expiryDate !== null && p.expiryDate < today)

    return AppResponse.ok(expired)
  } catch (error) {
    return handleError("Get expired products", error)
  }
}

export const getLowStockProducts = async (slug: string): Promise<ApiResponse<ProductWithRelations[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewLowStocks")

    const products = await fetchProducts(ctx)
    const lowStock = products.filter((p) => p.quantity <= p.lowStockThreshold)

    return AppResponse.ok(lowStock)
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

    return AppResponse.ok({ categories, brands, units, warranties, branches, customAttributes })
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
