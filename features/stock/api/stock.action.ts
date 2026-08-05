"use server"

import { alias } from "drizzle-orm/pg-core"
import { and, count, eq, ilike, or } from "drizzle-orm"

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
import { PaginationQuery, PaginationQuerySchema, resolveSortColumn } from "@/lib/common/pagination"
import { BadRequestError, ValidationError, handleError } from "@/lib/common/errors"
import redis from "@/lib/cache/redis"
import { STOCK_KEY, STOCK_MOVEMENTS_KEY } from "@/lib/cache/constants"

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

async function assertBranchBelongsToStore(branchId: string, storeId: string) {
  const [existing] = await db
    .select({ id: branch.id })
    .from(branch)
    .where(and(eq(branch.id, branchId), eq(branch.storeId, storeId)))
    .limit(1)
  if (!existing) throw new BadRequestError("Selected branch does not belong to this store.")
}

async function assertProductBelongsToStore(productId: string, storeId: string) {
  const [existing] = await db
    .select({ id: product.id })
    .from(product)
    .where(and(eq(product.id, productId), eq(product.storeId, storeId)))
    .limit(1)
  if (!existing) throw new BadRequestError("Selected product does not belong to this store.")
}

export interface BranchStockListParams extends Partial<PaginationQuery> {
  branchId?: string
}

export const getBranchStock = async (
  tenant: string,
  query: BranchStockListParams = {}
): Promise<ApiResponse<BranchStockRow[]>> => {
  try {
    const ctx = await getStoreContext(tenant)
    requirePermission(ctx, "canManageStock")

    const { branchId, ...paginationQuery } = query
    const parsed = PaginationQuerySchema.safeParse(paginationQuery)
    if (!parsed.success) {
      throw new ValidationError("Invalid pagination params", parsed.error.flatten())
    }
    const { page, limit, search, sortBy, sortOrder } = parsed.data

    const orderBy = resolveSortColumn(
      { branch: branch.name, product: product.name, quantity: branchStock.quantity },
      sortBy,
      "branch",
      sortOrder
    )

    const conditions = [eq(branchStock.storeId, ctx.store.id)]
    if (branchId) conditions.push(eq(branchStock.branchId, branchId))
    if (search) {
      conditions.push(
        or(
          ilike(product.name, `%${search}%`),
          ilike(product.sku, `%${search}%`),
          ilike(branch.name, `%${search}%`)
        )!
      )
    }

    const baseQuery = db
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
      .where(and(...conditions))

    const countQuery = db
      .select({ total: count() })
      .from(branchStock)
      .innerJoin(branch, eq(branchStock.branchId, branch.id))
      .innerJoin(product, eq(branchStock.productId, product.id))
      .where(and(...conditions))

    const [rows, [{ total }]] = await Promise.all([
      baseQuery.orderBy(orderBy).limit(limit).offset((page - 1) * limit),
      countQuery,
    ])

    const result: BranchStockRow[] = rows.map(
      ({ branchStock: bs, branchName, productName, sku, categoryName, lowStockThreshold }) => ({
        ...bs,
        branchName,
        productName,
        sku,
        categoryName,
        lowStockThreshold,
      })
    )

    return AppResponse.paginated(result, {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    })
  } catch (error) {
    return handleError("Get branch stock", error)
  }
}

export interface StockMovementListParams extends Partial<PaginationQuery> {
  type?: "adjustment" | "transfer"
}

export const getStockMovements = async (
  tenant: string,
  query: StockMovementListParams = {}
): Promise<ApiResponse<StockMovementRow[]>> => {
  try {
    const ctx = await getStoreContext(tenant)
    requirePermission(ctx, "canManageStock")

    const { type, ...paginationQuery } = query
    const parsed = PaginationQuerySchema.safeParse(paginationQuery)
    if (!parsed.success) {
      throw new ValidationError("Invalid pagination params", parsed.error.flatten())
    }
    const { page, limit, search, sortBy, sortOrder } = parsed.data

    const fromBranch = alias(branch, "from_branch")
    const toBranch = alias(branch, "to_branch")

    const orderBy = resolveSortColumn(
      { createdAt: stockMovement.createdAt, quantityChange: stockMovement.quantityChange, product: product.name },
      sortBy,
      "createdAt",
      sortOrder
    )

    const conditions = [eq(stockMovement.storeId, ctx.store.id)]
    if (type) conditions.push(eq(stockMovement.type, type))
    if (search) {
      conditions.push(
        or(
          ilike(product.name, `%${search}%`),
          ilike(product.sku, `%${search}%`),
          ilike(fromBranch.name, `%${search}%`),
          ilike(toBranch.name, `%${search}%`)
        )!
      )
    }

    const baseQuery = db
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
      .where(and(...conditions))

    const countQuery = db
      .select({ total: count() })
      .from(stockMovement)
      .innerJoin(product, eq(stockMovement.productId, product.id))
      .leftJoin(fromBranch, eq(stockMovement.fromBranchId, fromBranch.id))
      .leftJoin(toBranch, eq(stockMovement.toBranchId, toBranch.id))
      .where(and(...conditions))

    const [rows, [{ total }]] = await Promise.all([
      baseQuery.orderBy(orderBy).limit(limit).offset((page - 1) * limit),
      countQuery,
    ])

    const movements: StockMovementRow[] = rows.map(
      ({ stockMovement: m, productName, sku, fromBranchName, toBranchName, responsibleName }) => ({
        ...m,
        productName,
        sku,
        fromBranchName: fromBranchName ?? null,
        toBranchName: toBranchName ?? null,
        responsibleName: responsibleName ?? null,
      })
    )

    return AppResponse.paginated(movements, {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    })
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

    await Promise.all([
      assertBranchBelongsToStore(branchId, ctx.store.id),
      assertProductBelongsToStore(productId, ctx.store.id),
    ])

    const movement = await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(branchStock)
        .where(
          and(
            eq(branchStock.branchId, branchId),
            eq(branchStock.productId, productId),
            eq(branchStock.storeId, ctx.store.id)
          )
        )
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

    await Promise.all([
      assertBranchBelongsToStore(fromBranchId, ctx.store.id),
      assertBranchBelongsToStore(toBranchId, ctx.store.id),
      assertProductBelongsToStore(productId, ctx.store.id),
    ])

    const movement = await db.transaction(async (tx) => {
      const [source] = await tx
        .select()
        .from(branchStock)
        .where(
          and(
            eq(branchStock.branchId, fromBranchId),
            eq(branchStock.productId, productId),
            eq(branchStock.storeId, ctx.store.id)
          )
        )
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
        .where(
          and(
            eq(branchStock.branchId, toBranchId),
            eq(branchStock.productId, productId),
            eq(branchStock.storeId, ctx.store.id)
          )
        )
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
