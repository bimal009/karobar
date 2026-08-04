"use server"

import { and, eq, inArray } from "drizzle-orm"

import db from "@/lib/database/db"
import {
  branch,
  branchMember,
  storeMember,
  storeRole,
  user,
  type StoreRole,
} from "@/lib/database/schemas"
import {
  MemberInsert,
  MemberUpdate,
  memberInsertSchema,
  memberUpdateSchema,
} from "@/lib/database/zod/members"
import { getStoreContext, requirePermission } from "@/lib/database/queries/store-context"
import { ApiResponse, AppResponse } from "@/lib/common/response"
import {
  ConflictError,
  NotFoundError,
  ValidationError,
  handleError,
} from "@/lib/common/errors"
import redis from "@/lib/cache/redis"
import { STORE_MEMBERS_KEY, TTL_MEDIUM } from "@/lib/cache/constants"
import { invalidateBranches } from "@/features/branch/api/branch.action"

const membersCacheKey = (storeId: string) => `${STORE_MEMBERS_KEY}${storeId}`

const invalidateMembers = (storeId: string) => redis.del(membersCacheKey(storeId))

export interface MemberRow {
  id: string
  userId: string
  name: string
  email: string
  image: string | null
  roleId: string
  roleName: string
  isSystemRole: boolean
  branch: { id: string; name: string } | null
  createdAt: Date
}

export interface MemberFormOptions {
  roles: Pick<StoreRole, "id" | "name">[]
  branches: { id: string; name: string }[]
}

async function attachBranch(members: Omit<MemberRow, "branch">[]) {
  const memberIds = members.map((m) => m.id)
  const links = memberIds.length
    ? await db
        .select({ memberId: branchMember.memberId, id: branch.id, name: branch.name })
        .from(branchMember)
        .innerJoin(branch, eq(branchMember.branchId, branch.id))
        .where(inArray(branchMember.memberId, memberIds))
    : []

  const byMember = new Map(links.map((link) => [link.memberId, { id: link.id, name: link.name }]))

  return members.map((m) => ({ ...m, branch: byMember.get(m.id) ?? null }))
}

export const getMembers = async (slug: string): Promise<ApiResponse<MemberRow[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewMembers")

    const cacheKey = membersCacheKey(ctx.store.id)
    const cached = await redis.get(cacheKey)
    if (cached) {
      return AppResponse.ok(cached as MemberRow[])
    }

    const rows = await db
      .select({
        id: storeMember.id,
        userId: storeMember.userId,
        name: user.name,
        email: user.email,
        image: user.image,
        roleId: storeRole.id,
        roleName: storeRole.name,
        isSystemRole: storeRole.isSystem,
        createdAt: storeMember.createdAt,
      })
      .from(storeMember)
      .innerJoin(user, eq(storeMember.userId, user.id))
      .innerJoin(storeRole, eq(storeMember.roleId, storeRole.id))
      .where(eq(storeMember.storeId, ctx.store.id))
      .orderBy(storeMember.createdAt)

    const members = await attachBranch(rows)
    await redis.set(cacheKey, members, { ex: TTL_MEDIUM })

    return AppResponse.ok(members)
  } catch (error) {
    return handleError("Get members", error)
  }
}

export const getMemberFormOptions = async (slug: string): Promise<ApiResponse<MemberFormOptions>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewMembers")

    const [roles, branches] = await Promise.all([
      db
        .select({ id: storeRole.id, name: storeRole.name })
        .from(storeRole)
        .where(eq(storeRole.storeId, ctx.store.id)),
      db
        .select({ id: branch.id, name: branch.name })
        .from(branch)
        .where(eq(branch.storeId, ctx.store.id)),
    ])

    return AppResponse.ok({ roles, branches })
  } catch (error) {
    return handleError("Get member form options", error)
  }
}

export const createMember = async (
  slug: string,
  data: MemberInsert
): Promise<ApiResponse<MemberRow>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canInviteMembers")

    const result = memberInsertSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }
    const { email, roleId, branchId } = result.data

    const [existingUser] = await db.select().from(user).where(eq(user.email, email)).limit(1)
    if (!existingUser) {
      throw new NotFoundError(
        "No account found with that email. Ask them to create an account first, then add them here."
      )
    }

    const [role] = await db
      .select()
      .from(storeRole)
      .where(and(eq(storeRole.id, roleId), eq(storeRole.storeId, ctx.store.id)))
      .limit(1)
    if (!role) throw new NotFoundError("Role not found")

    const [existingMember] = await db
      .select()
      .from(storeMember)
      .where(and(eq(storeMember.storeId, ctx.store.id), eq(storeMember.userId, existingUser.id)))
      .limit(1)
    if (existingMember) {
      throw new ConflictError("This user is already a member of this store.")
    }

    const created = await db.transaction(async (tx) => {
      const [member] = await tx
        .insert(storeMember)
        .values({ storeId: ctx.store.id, userId: existingUser.id, roleId })
        .returning()

      if (branchId) {
        await tx.insert(branchMember).values({ branchId, memberId: member.id })
      }

      return member
    })

    const [row] = await attachBranch([
      {
        id: created.id,
        userId: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        image: existingUser.image,
        roleId: role.id,
        roleName: role.name,
        isSystemRole: role.isSystem,
        createdAt: created.createdAt,
      },
    ])

    await Promise.all([invalidateMembers(ctx.store.id), invalidateBranches(ctx.store.id)])

    return AppResponse.created(row, "Member added successfully")
  } catch (error) {
    return handleError("Create member", error)
  }
}

export const updateMember = async (
  slug: string,
  memberId: string,
  data: MemberUpdate
): Promise<ApiResponse<never>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canEditMembers")

    if (memberId === ctx.memberId) {
      throw new ConflictError("You cannot change your own role.")
    }

    const result = memberUpdateSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }
    const { roleId, branchId } = result.data

    const [existing] = await db
      .select()
      .from(storeMember)
      .where(and(eq(storeMember.id, memberId), eq(storeMember.storeId, ctx.store.id)))
      .limit(1)
    if (!existing) throw new NotFoundError("Member not found")

    const [role] = await db
      .select()
      .from(storeRole)
      .where(and(eq(storeRole.id, roleId), eq(storeRole.storeId, ctx.store.id)))
      .limit(1)
    if (!role) throw new NotFoundError("Role not found")

    await db.transaction(async (tx) => {
      await tx.update(storeMember).set({ roleId }).where(eq(storeMember.id, memberId))
      await tx.delete(branchMember).where(eq(branchMember.memberId, memberId))
      if (branchId) {
        await tx.insert(branchMember).values({ branchId, memberId })
      }
    })

    await Promise.all([invalidateMembers(ctx.store.id), invalidateBranches(ctx.store.id)])

    return AppResponse.noContent("Member updated successfully")
  } catch (error) {
    return handleError("Update member", error)
  }
}

export const deleteMember = async (slug: string, memberId: string): Promise<ApiResponse<never>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canDeleteMembers")

    if (memberId === ctx.memberId) {
      throw new ConflictError("You cannot remove yourself from the store.")
    }

    const [deleted] = await db
      .delete(storeMember)
      .where(and(eq(storeMember.id, memberId), eq(storeMember.storeId, ctx.store.id)))
      .returning()

    if (!deleted) throw new NotFoundError("Member not found")

    await Promise.all([invalidateMembers(ctx.store.id), invalidateBranches(ctx.store.id)])

    return AppResponse.noContent("Member removed successfully")
  } catch (error) {
    return handleError("Delete member", error)
  }
}
