"use server"

import { alias } from "drizzle-orm/pg-core"
import { and, desc, eq } from "drizzle-orm"

import db from "@/lib/database/db"
import {
  branch,
  branchStock,
  category,
  product,
  stockMovement,
  user,
  type BranchStock,
  type StockMovement,
} from "@/lib/database/schemas"
import {
  StockAdjustmentInput,
  StockTransferInput,
  stockAdjustmentSchema,
  stockTransferSchema,
} from "@/lib/database/zod/stock-movements"
import { getStoreContext, requirePermission } from "@/lib/database/queries/store-context"
import { ApiResponse, AppResponse } from "@/lib/common/response"
import { BadRequestError, ValidationError, handleError } from "@/lib/common/errors"
import redis from "@/lib/cache/redis"
import { STOCK_KEY, STOCK_MOVEMENTS_KEY, TTL_MEDIUM } from "@/lib/cache/constants"

export type BranchStockRow = BranchStock & {
  branchName: string
  productName: string
  sku: string
  categoryName: string
  lowStockThreshold: number
}

export type StockMovementRow = StockMovement & {
  productName: string
  sku: string
  fromBranchName: string | null
  toBranchName: string | null
  responsibleName: string | null
}

const branchStockCacheKey = (storeId: string) => `${STOCK_KEY}${storeId}`
const stockMovementsCacheKey = (storeId: string) => `${STOCK_MOVEMENTS_KEY}${storeId}`

const invalidateBranchStock = (storeId: string) => redis.del(branchStockCacheKey(storeId))
const invalidateStockMovements = (storeId: string) => redis.del(stockMovementsCacheKey(storeId))

export const getBranchStock = async (tenant: string): Promise<ApiResponse<BranchStockRow[]>> => {
  try {
    const ctx = await getStoreContext(tenant)
    requirePermission(ctx, "canManageStock")

    const cacheKey = branchStockCacheKey(ctx.store.id)
    const cached = await redis.get(cacheKey)
    if (cached) {
      return AppResponse.ok(cached as BranchStockRow[])
    }

    const rows = await db
      .select({
        branchStock,
        branchName: branch.name,
        productName: product.name,
        sku: product.sku,
        categoryName: category.name,
        lowStockThreshold: product.lowStockThreshold,
      })
      .from(branchStock)
      .innerJoin(branch, eq(branchStock.branchId, branch.id))
      .innerJoin(product, eq(branchStock.productId, product.id))
      .innerJoin(category, eq(product.categoryId, category.id))
      .where(eq(branchStock.storeId, ctx.store.id))
      .orderBy(branch.name, product.name)

    const result = rows.map(({ branchStock: bs, branchName, productName, sku, categoryName, lowStockThreshold }) => ({
      ...bs,
      branchName,
      productName,
      sku,
      categoryName,
      lowStockThreshold,
    }))

    await redis.set(cacheKey, result, { ex: TTL_MEDIUM })

    return AppResponse.ok(result)
  } catch (error) {
    return handleError("Get branch stock", error)
  }
}

export const getStockMovements = async (
  tenant: string,
  type?: "adjustment" | "transfer"
): Promise<ApiResponse<StockMovementRow[]>> => {
  try {
    const ctx = await getStoreContext(tenant)
    requirePermission(ctx, "canManageStock")

    const cacheKey = stockMovementsCacheKey(ctx.store.id)
    const cached = await redis.get(cacheKey)

    let movements: StockMovementRow[]
    if (cached) {
      movements = cached as StockMovementRow[]
    } else {
      const fromBranch = alias(branch, "from_branch")
      const toBranch = alias(branch, "to_branch")

      const rows = await db
        .select({
          stockMovement,
          productName: product.name,
          sku: product.sku,
          fromBranchName: fromBranch.name,
          toBranchName: toBranch.name,
          responsibleName: user.name,
        })
        .from(stockMovement)
        .innerJoin(product, eq(stockMovement.productId, product.id))
        .leftJoin(fromBranch, eq(stockMovement.fromBranchId, fromBranch.id))
        .leftJoin(toBranch, eq(stockMovement.toBranchId, toBranch.id))
        .leftJoin(user, eq(stockMovement.responsibleUserId, user.id))
        .where(eq(stockMovement.storeId, ctx.store.id))
        .orderBy(desc(stockMovement.createdAt))

      movements = rows.map(({ stockMovement: m, productName, sku, fromBranchName, toBranchName, responsibleName }) => ({
        ...m,
        productName,
        sku,
        fromBranchName: fromBranchName ?? null,
        toBranchName: toBranchName ?? null,
        responsibleName: responsibleName ?? null,
      }))

      await redis.set(cacheKey, movements, { ex: TTL_MEDIUM })
    }

    const filtered = type ? movements.filter((m) => m.type === type) : movements

    return AppResponse.ok(filtered)
  } catch (error) {
    return handleError("Get stock movements", error)
  }
}

export interface StockFormOptions {
  branches: { id: string; name: string }[]
  products: { id: string; name: string; sku: string }[]
}

export const getStockFormOptions = async (tenant: string): Promise<ApiResponse<StockFormOptions>> => {
  try {
    const ctx = await getStoreContext(tenant)
    requirePermission(ctx, "canManageStock")

    const [branches, products] = await Promise.all([
      db
        .select({ id: branch.id, name: branch.name })
        .from(branch)
        .where(eq(branch.storeId, ctx.store.id))
        .orderBy(branch.name),
      db
        .select({ id: product.id, name: product.name, sku: product.sku })
        .from(product)
        .where(eq(product.storeId, ctx.store.id))
        .orderBy(product.name),
    ])

    return AppResponse.ok({ branches, products })
  } catch (error) {
    return handleError("Get stock form options", error)
  }
}

export const adjustStock = async (
  tenant: string,
  data: StockAdjustmentInput
): Promise<ApiResponse<StockMovement>> => {
  try {
    const ctx = await getStoreContext(tenant)
    requirePermission(ctx, "canAdjustStock")

    const result = stockAdjustmentSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }
    const { branchId, productId, quantityChange, reason } = result.data

    const movement = await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(branchStock)
        .where(and(eq(branchStock.branchId, branchId), eq(branchStock.productId, productId)))
        .limit(1)

      const quantityBefore = existing?.quantity ?? 0
      const quantityAfter = quantityBefore + quantityChange

      if (quantityAfter < 0) {
        throw new BadRequestError("Adjustment would result in negative stock.")
      }

      if (existing) {
        await tx
          .update(branchStock)
          .set({ quantity: quantityAfter })
          .where(eq(branchStock.id, existing.id))
      } else {
        await tx.insert(branchStock).values({
          storeId: ctx.store.id,
          branchId,
          productId,
          quantity: quantityAfter,
        })
      }

      const [created] = await tx
        .insert(stockMovement)
        .values({
          storeId: ctx.store.id,
          productId,
          type: "adjustment",
          fromBranchId: branchId,
          quantityBefore,
          quantityChange,
          quantityAfter,
          reason,
          responsibleUserId: ctx.userId,
        })
        .returning()

      return created
    })

    await Promise.all([invalidateBranchStock(ctx.store.id), invalidateStockMovements(ctx.store.id)])

    return AppResponse.created(movement, "Stock adjusted successfully")
  } catch (error) {
    return handleError("Adjust stock", error)
  }
}

export const transferStock = async (
  tenant: string,
  data: StockTransferInput
): Promise<ApiResponse<StockMovement>> => {
  try {
    const ctx = await getStoreContext(tenant)
    requirePermission(ctx, "canTransferStock")

    const result = stockTransferSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }
    const { productId, fromBranchId, toBranchId, quantity, reason } = result.data

    if (fromBranchId === toBranchId) {
      throw new BadRequestError("Source and destination branches must be different.")
    }

    const movement = await db.transaction(async (tx) => {
      const [source] = await tx
        .select()
        .from(branchStock)
        .where(and(eq(branchStock.branchId, fromBranchId), eq(branchStock.productId, productId)))
        .limit(1)

      const sourceQuantityBefore = source?.quantity ?? 0
      if (sourceQuantityBefore < quantity) {
        throw new BadRequestError("Insufficient stock at the source branch.")
      }

      await tx
        .update(branchStock)
        .set({ quantity: sourceQuantityBefore - quantity })
        .where(eq(branchStock.id, source!.id))

      const [destination] = await tx
        .select()
        .from(branchStock)
        .where(and(eq(branchStock.branchId, toBranchId), eq(branchStock.productId, productId)))
        .limit(1)

      if (destination) {
        await tx
          .update(branchStock)
          .set({ quantity: destination.quantity + quantity })
          .where(eq(branchStock.id, destination.id))
      } else {
        await tx.insert(branchStock).values({
          storeId: ctx.store.id,
          branchId: toBranchId,
          productId,
          quantity,
        })
      }

      const [created] = await tx
        .insert(stockMovement)
        .values({
          storeId: ctx.store.id,
          productId,
          type: "transfer",
          fromBranchId,
          toBranchId,
          quantityBefore: sourceQuantityBefore,
          quantityChange: -quantity,
          quantityAfter: sourceQuantityBefore - quantity,
          reason,
          responsibleUserId: ctx.userId,
        })
        .returning()

      return created
    })

    await Promise.all([invalidateBranchStock(ctx.store.id), invalidateStockMovements(ctx.store.id)])

    return AppResponse.created(movement, "Stock transferred successfully")
  } catch (error) {
    return handleError("Transfer stock", error)
  }
}
