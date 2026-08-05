"use server"

import { and, count, eq, ilike, or } from "drizzle-orm"

import db from "@/lib/database/db"
import { branch, branchMember, type Branch } from "@/lib/database/schemas"
import { BranchInsert, BranchUpdate, branchInsertSchema, branchUpdateSchema } from "@/lib/database/zod/branches"
import { getStoreContext, requirePermission } from "@/lib/database/queries/store-context"
import { ApiResponse, AppResponse } from "@/lib/common/response"
import { PaginationQuery, PaginationQuerySchema, resolveSortColumn } from "@/lib/common/pagination"
import { NotFoundError, ValidationError, handleError } from "@/lib/common/errors"
import { BRANCHES_KEY } from "@/lib/cache/constants"
import { buildListCacheKey, getCachedList, invalidateListCache, setCachedList, type CachedPage } from "@/lib/cache/list-cache"

export type BranchWithMemberCount = Branch & { memberCount: number }

export const invalidateBranches = async (storeId: string) => invalidateListCache(BRANCHES_KEY, storeId)

export const getBranches = async (
  slug: string,
  query: Partial<PaginationQuery> = {}
): Promise<ApiResponse<BranchWithMemberCount[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewBranches")

    const parsed = PaginationQuerySchema.safeParse(query)
    if (!parsed.success) {
      throw new ValidationError("Invalid pagination params", parsed.error.flatten())
    }
    const { page, limit, search, sortBy, sortOrder } = parsed.data

    const cacheKey = buildListCacheKey(BRANCHES_KEY, ctx.store.id, { page, limit, search, sortBy, sortOrder })
    const cached = await getCachedList<CachedPage<BranchWithMemberCount>>(cacheKey)
    if (cached) {
      return AppResponse.paginated(cached.rows, {
        page,
        limit,
        total: cached.total,
        totalPages: Math.max(1, Math.ceil(cached.total / limit)),
      })
    }

    const orderBy = resolveSortColumn(
      { name: branch.name, code: branch.code, createdAt: branch.createdAt },
      sortBy,
      "createdAt",
      sortOrder
    )

    const conditions = [eq(branch.storeId, ctx.store.id)]
    if (search) {
      conditions.push(
        or(ilike(branch.name, `%${search}%`), ilike(branch.code, `%${search}%`), ilike(branch.city, `%${search}%`))!
      )
    }

    const baseQuery = db
      .select({ branch, memberCount: count(branchMember.id) })
      .from(branch)
      .leftJoin(branchMember, eq(branchMember.branchId, branch.id))
      .where(and(...conditions))
      .groupBy(branch.id)

    const countQuery = db
      .select({ total: count() })
      .from(branch)
      .where(and(...conditions))

    const [rows, [{ total }]] = await Promise.all([
      baseQuery.orderBy(orderBy).limit(limit).offset((page - 1) * limit),
      countQuery,
    ])

    const branches = rows.map(({ branch: b, memberCount }) => ({ ...b, memberCount }))

    await setCachedList(cacheKey, { rows: branches, total })

    return AppResponse.paginated(branches, {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    })
  } catch (error) {
    return handleError("Get branches", error)
  }
}

export const createBranch = async (
  slug: string,
  data: BranchInsert
): Promise<ApiResponse<Branch>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canCreateBranches")

    const result = branchInsertSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    const [newBranch] = await db
      .insert(branch)
      .values({ ...result.data, storeId: ctx.store.id })
      .returning()

    await invalidateBranches(ctx.store.id)

    return AppResponse.created(newBranch, "Branch created successfully")
  } catch (error) {
    return handleError("Create branch", error)
  }
}

export const updateBranch = async (
  slug: string,
  id: string,
  data: BranchUpdate
): Promise<ApiResponse<Branch>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canEditBranches")

    const result = branchUpdateSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    const [updated] = await db
      .update(branch)
      .set(result.data)
      .where(and(eq(branch.id, id), eq(branch.storeId, ctx.store.id)))
      .returning()

    if (!updated) {
      throw new NotFoundError("Branch not found")
    }

    await invalidateBranches(ctx.store.id)

    return AppResponse.ok(updated, "Branch updated successfully")
  } catch (error) {
    return handleError("Update branch", error)
  }
}

export const deleteBranch = async (slug: string, id: string): Promise<ApiResponse<never>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canDeleteBranches")

    const [deleted] = await db
      .delete(branch)
      .where(and(eq(branch.id, id), eq(branch.storeId, ctx.store.id)))
      .returning()

    if (!deleted) {
      throw new NotFoundError("Branch not found")
    }

    await invalidateBranches(ctx.store.id)

    return AppResponse.noContent("Branch deleted successfully")
  } catch (error) {
    return handleError("Delete branch", error)
  }
}
