"use server"

import { count, eq } from "drizzle-orm"

import db from "@/lib/database/db"
import { category, order, orderItem, product, type Order } from "@/lib/database/schemas"
import { OrderInsertInput, orderInsertSchema } from "@/lib/database/zod/orders"
import { getStoreContext, requirePermission } from "@/lib/database/queries/store-context"
import { ApiResponse, AppResponse } from "@/lib/common/response"
import { ValidationError, handleError } from "@/lib/common/errors"
import redis from "@/lib/cache/redis"
import { POS_KEY, TTL_SHORT } from "@/lib/cache/constants"
import { invalidateOrderReports } from "@/features/reports/api/reports.action"
import { invalidateDashboards } from "@/features/dashboard/api/dashboard.action"

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

export interface PosData {
  categories: PosCategory[]
  products: PosProduct[]
}

const posDataCacheKey = (storeId: string) => `${POS_KEY}${storeId}`

const invalidatePosData = (storeId: string) => redis.del(posDataCacheKey(storeId))

export const getPosData = async (tenant: string): Promise<ApiResponse<PosData>> => {
  try {
    const ctx = await getStoreContext(tenant)
    requirePermission(ctx, "canUsePos")

    const cacheKey = posDataCacheKey(ctx.store.id)
    const cached = await redis.get(cacheKey)
    if (cached) {
      return AppResponse.ok(cached as PosData)
    }

    const [categoryRows, productRows] = await Promise.all([
      db
        .select({ category, productsCount: count(product.id) })
        .from(category)
        .leftJoin(product, eq(product.categoryId, category.id))
        .where(eq(category.storeId, ctx.store.id))
        .groupBy(category.id)
        .orderBy(category.name),
      db
        .select({ product, categoryName: category.name })
        .from(product)
        .innerJoin(category, eq(product.categoryId, category.id))
        .where(eq(product.storeId, ctx.store.id))
        .orderBy(product.name),
    ])

    const categories: PosCategory[] = categoryRows.map(({ category: c, productsCount }) => ({
      id: c.id,
      name: c.name,
      productsCount,
    }))

    const products: PosProduct[] = productRows.map(({ product: p, categoryName }) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      categoryId: p.categoryId,
      categoryName,
      price: Number(p.price),
      quantity: p.quantity,
    }))

    const data: PosData = { categories, products }
    await redis.set(cacheKey, data, { ex: TTL_SHORT })

    return AppResponse.ok(data)
  } catch (error) {
    return handleError("Get POS data", error)
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
    const { items, subtotal, discount, tax, total, paymentMethod, customerId, billerId, branchId } = result.data

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
        items.map((item) => ({
          orderId: created.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: String(item.price),
        }))
      )

      return created
    })

    await Promise.all([
      invalidatePosData(ctx.store.id),
      invalidateOrderReports(ctx.store.id),
      invalidateDashboards(ctx.store.id),
    ])

    return AppResponse.created(newOrder, "Order placed successfully")
  } catch (error) {
    return handleError("Create order", error)
  }
}
