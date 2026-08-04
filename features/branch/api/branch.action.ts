"use server"

import { and, count, eq } from "drizzle-orm"

import db from "@/lib/database/db"
import { branch, branchMember, type Branch } from "@/lib/database/schemas"
import { BranchInsert, BranchUpdate, branchInsertSchema, branchUpdateSchema } from "@/lib/database/zod/branches"
import { getStoreContext, requirePermission } from "@/lib/database/queries/store-context"
import { ApiResponse, AppResponse } from "@/lib/common/response"
import { NotFoundError, ValidationError, handleError } from "@/lib/common/errors"
import redis from "@/lib/cache/redis"
import { BRANCHES_KEY, TTL_MEDIUM } from "@/lib/cache/constants"

export type BranchWithMemberCount = Branch & { memberCount: number }

const branchesCacheKey = (storeId: string) => `${BRANCHES_KEY}${storeId}`

export const invalidateBranches = async (storeId: string) => redis.del(branchesCacheKey(storeId))

export const getBranches = async (slug: string): Promise<ApiResponse<BranchWithMemberCount[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewBranches")

    const cacheKey = branchesCacheKey(ctx.store.id)
    const cached = await redis.get(cacheKey)
    if (cached) {
      return AppResponse.ok(cached as BranchWithMemberCount[])
    }

    const rows = await db
      .select({ branch, memberCount: count(branchMember.id) })
      .from(branch)
      .leftJoin(branchMember, eq(branchMember.branchId, branch.id))
      .where(eq(branch.storeId, ctx.store.id))
      .groupBy(branch.id)
      .orderBy(branch.createdAt)

    const branches = rows.map(({ branch: b, memberCount }) => ({ ...b, memberCount }))
    await redis.set(cacheKey, branches, { ex: TTL_MEDIUM })

    return AppResponse.ok(branches)
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
