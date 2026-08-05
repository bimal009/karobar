"use server"

import { and, count, eq, ilike, inArray, sql } from "drizzle-orm"

import db from "@/lib/database/db"
import { biller, branch, category, customer, order, orderItem, product, type Order } from "@/lib/database/schemas"
import { OrderInsertInput, orderInsertSchema } from "@/lib/database/zod/orders"
import { getStoreContext, requirePermission } from "@/lib/database/queries/store-context"
import { ApiResponse, AppResponse } from "@/lib/common/response"
import { PaginationQuery, PaginationQuerySchema, resolveSortColumn } from "@/lib/common/pagination"
import { BadRequestError, ValidationError, handleError } from "@/lib/common/errors"
import redis from "@/lib/cache/redis"
import { POS_KEY, TTL_SHORT } from "@/lib/cache/constants"
import { invalidateDerivedCaches } from "@/lib/cache/invalidate"

export interface PosCategory {
  id: string
  name: string
  productsCount: number
}

export interface PosProduct {
  id: string
  name: string
  sku: string
  categoryId: string
  categoryName: string
  price: number
  quantity: number
}

export interface PosCustomer {
  id: string
  name: string
  phone: string | null
  email: string | null
}

export interface PosData {
  categories: PosCategory[]
  customers: PosCustomer[]
}

const posDataCacheKey = (storeId: string) => `${POS_KEY}${storeId}`

export const getPosData = async (tenant: string): Promise<ApiResponse<PosData>> => {
  try {
    const ctx = await getStoreContext(tenant)
    requirePermission(ctx, "canUsePos")

    const cacheKey = posDataCacheKey(ctx.store.id)
    const cached = await redis.get(cacheKey)
    if (cached) {
      return AppResponse.ok(cached as PosData)
    }

    const [categoryRows, customerRows] = await Promise.all([
      db
        .select({ category, productsCount: count(product.id) })
        .from(category)
        .leftJoin(product, eq(product.categoryId, category.id))
        .where(eq(category.storeId, ctx.store.id))
        .groupBy(category.id)
        .orderBy(category.name),
      db
        .select({ id: customer.id, name: customer.name, phone: customer.phone, email: customer.email })
        .from(customer)
        .where(eq(customer.storeId, ctx.store.id))
        .orderBy(customer.name),
    ])

    const categories: PosCategory[] = categoryRows.map(({ category: c, productsCount }) => ({
      id: c.id,
      name: c.name,
      productsCount,
    }))

    const data: PosData = { categories, customers: customerRows }
    await redis.set(cacheKey, data, { ex: TTL_SHORT })

    return AppResponse.ok(data)
  } catch (error) {
    return handleError("Get POS data", error)
  }
}

export interface PosProductSearchParams extends Partial<PaginationQuery> {
  categoryId?: string
}

export const searchPosProducts = async (
  tenant: string,
  params: PosProductSearchParams = {}
): Promise<ApiResponse<PosProduct[]>> => {
  try {
    const ctx = await getStoreContext(tenant)
    requirePermission(ctx, "canUsePos")

    const { categoryId, ...paginationQuery } = params
    const parsed = PaginationQuerySchema.safeParse(paginationQuery)
    if (!parsed.success) {
      throw new ValidationError("Invalid pagination params", parsed.error.flatten())
    }
    const { page, limit, search, sortBy, sortOrder } = parsed.data

    const orderBy = resolveSortColumn(
      { name: product.name, price: product.price, quantity: product.quantity },
      sortBy,
      "name",
      sortOrder
    )

    const conditions = [eq(product.storeId, ctx.store.id)]
    if (categoryId && categoryId !== "all") {
      conditions.push(eq(product.categoryId, categoryId))
    }
    if (search) {
      conditions.push(ilike(product.name, `%${search}%`))
    }

    const baseQuery = db
      .select({ product, categoryName: category.name })
      .from(product)
      .innerJoin(category, eq(product.categoryId, category.id))
      .where(and(...conditions))

    const countQuery = db
      .select({ total: count() })
      .from(product)
      .where(and(...conditions))

    const [rows, [{ total }]] = await Promise.all([
      baseQuery.orderBy(orderBy).limit(limit).offset((page - 1) * limit),
      countQuery,
    ])

    const products: PosProduct[] = rows.map(({ product: p, categoryName }) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      categoryId: p.categoryId,
      categoryName,
      price: Number(p.price),
      quantity: p.quantity,
    }))

    return AppResponse.paginated(products, {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    })
  } catch (error) {
    return handleError("Search POS products", error)
  }
}

async function assertBelongsToStore(
  table: typeof customer | typeof biller | typeof branch,
  id: string,
  storeId: string,
  label: string
) {
  const [existing] = await db
    .select({ id: table.id })
    .from(table)
    .where(and(eq(table.id, id), eq(table.storeId, storeId)))
    .limit(1)
  if (!existing) {
    throw new BadRequestError(`Selected ${label} does not belong to this store.`)
  }
}

export const createOrder = async (
  tenant: string,
  data: OrderInsertInput
): Promise<ApiResponse<Order>> => {
  try {
    const ctx = await getStoreContext(tenant)
    requirePermission(ctx, "canUsePos")

    const result = orderInsertSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }
    const { items, discount, paymentMethod, customerId, billerId, branchId } = result.data

    // Re-derive product names/prices from the store's own catalog — never trust
    // client-submitted price/productName, and reject any id from another store.
    const productIds = [...new Set(items.map((item) => item.productId))]
    const storeProducts = await db
      .select({ id: product.id, name: product.name, price: product.price })
      .from(product)
      .where(and(inArray(product.id, productIds), eq(product.storeId, ctx.store.id)))

    if (storeProducts.length !== productIds.length) {
      throw new BadRequestError("One or more products don't belong to this store.")
    }
    const productById = new Map(storeProducts.map((p) => [p.id, p]))

    if (customerId) await assertBelongsToStore(customer, customerId, ctx.store.id, "customer")
    if (billerId) await assertBelongsToStore(biller, billerId, ctx.store.id, "biller")
    if (branchId) await assertBelongsToStore(branch, branchId, ctx.store.id, "branch")

    const resolvedItems = items.map((item) => {
      const p = productById.get(item.productId)!
      return { productId: item.productId, productName: p.name, quantity: item.quantity, price: Number(p.price) }
    })

    const subtotal = resolvedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tax = Math.round(subtotal * 0.08 * 100) / 100
    const total = Math.max(0, subtotal - discount) + tax

    const orderNo = `ORD-${Date.now()}`

    const newOrder = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(order)
        .values({
          storeId: ctx.store.id,
          orderNo,
          customerId,
          billerId,
          branchId,
          subtotal: String(subtotal),
          discount: String(discount),
          tax: String(tax),
          total: String(total),
          paymentMethod,
        })
        .returning()

      await tx.insert(orderItem).values(
        resolvedItems.map((item) => ({
          orderId: created.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: String(item.price),
        }))
      )

      for (const item of resolvedItems) {
        await tx
          .update(product)
          .set({ quantity: sql`${product.quantity} - ${item.quantity}` })
          .where(and(eq(product.id, item.productId), eq(product.storeId, ctx.store.id)))
      }

      return created
    })

    await invalidateDerivedCaches(ctx.store.id)

    return AppResponse.created(newOrder, "Order placed successfully")
  } catch (error) {
    return handleError("Create order", error)
  }
}
