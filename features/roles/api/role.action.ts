"use server"

import { and, count, eq } from "drizzle-orm"

import db from "@/lib/database/db"
import { storeMember, storeRole, type StoreRole } from "@/lib/database/schemas"
import {
  PermissionUpdate,
  RoleInsert,
  RoleUpdate,
  permissionUpdateSchema,
  roleInsertSchema,
  roleUpdateSchema,
} from "@/lib/database/zod/roles"
import { getStoreContext, requirePermission } from "@/lib/database/queries/store-context"
import { ApiResponse, AppResponse } from "@/lib/common/response"
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ValidationError,
  handleError,
} from "@/lib/common/errors"
import redis from "@/lib/cache/redis"
import { STORE_ROLES_KEY, TTL_MEDIUM } from "@/lib/cache/constants"

const rolesCacheKey = (storeId: string) => `${STORE_ROLES_KEY}${storeId}`

const invalidateRoles = (storeId: string) => redis.del(rolesCacheKey(storeId))

export const getRoles = async (slug: string): Promise<ApiResponse<StoreRole[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canManageSettings")

    const cacheKey = rolesCacheKey(ctx.store.id)
    const cached = await redis.get(cacheKey)
    if (cached) {
      return AppResponse.ok(cached as StoreRole[])
    }

    const roles = await db
      .select()
      .from(storeRole)
      .where(eq(storeRole.storeId, ctx.store.id))
      .orderBy(storeRole.createdAt)

    await redis.set(cacheKey, roles, { ex: TTL_MEDIUM })

    return AppResponse.ok(roles)
  } catch (error) {
    return handleError("Get roles", error)
  }
}

export const createRole = async (
  slug: string,
  data: RoleInsert
): Promise<ApiResponse<StoreRole>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canManageSettings")

    const result = roleInsertSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    const [role] = await db
      .insert(storeRole)
      .values({ ...result.data, storeId: ctx.store.id, isSystem: false })
      .returning()

    await invalidateRoles(ctx.store.id)

    return AppResponse.created(role, "Role created successfully")
  } catch (error) {
    return handleError("Create role", error)
  }
}

export const updateRole = async (
  slug: string,
  roleId: string,
  data: RoleUpdate
): Promise<ApiResponse<StoreRole>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canManageSettings")

    const result = roleUpdateSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    const [existing] = await db
      .select()
      .from(storeRole)
      .where(and(eq(storeRole.id, roleId), eq(storeRole.storeId, ctx.store.id)))
      .limit(1)

    if (!existing) throw new NotFoundError("Role not found")
    if (existing.isSystem) throw new BadRequestError("The system role cannot be renamed.")

    const [updated] = await db
      .update(storeRole)
      .set(result.data)
      .where(and(eq(storeRole.id, roleId), eq(storeRole.storeId, ctx.store.id)))
      .returning()

    await invalidateRoles(ctx.store.id)

    return AppResponse.ok(updated, "Role updated successfully")
  } catch (error) {
    return handleError("Update role", error)
  }
}

export const deleteRole = async (slug: string, roleId: string): Promise<ApiResponse<never>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canManageSettings")

    const [role] = await db
      .select()
      .from(storeRole)
      .where(and(eq(storeRole.id, roleId), eq(storeRole.storeId, ctx.store.id)))
      .limit(1)

    if (!role) throw new NotFoundError("Role not found")
    if (role.isSystem) throw new BadRequestError("The system role cannot be deleted.")

    const [{ memberCount }] = await db
      .select({ memberCount: count(storeMember.id) })
      .from(storeMember)
      .where(and(eq(storeMember.roleId, roleId), eq(storeMember.storeId, ctx.store.id)))

    if (memberCount > 0) {
      throw new ConflictError("Cannot delete a role that still has members assigned to it.")
    }

    await db
      .delete(storeRole)
      .where(and(eq(storeRole.id, roleId), eq(storeRole.storeId, ctx.store.id)))

    await invalidateRoles(ctx.store.id)

    return AppResponse.noContent("Role deleted successfully")
  } catch (error) {
    return handleError("Delete role", error)
  }
}

export const updateRolePermissions = async (
  slug: string,
  roleId: string,
  data: PermissionUpdate
): Promise<ApiResponse<StoreRole>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canManageSettings")

    const result = permissionUpdateSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    const [existing] = await db
      .select()
      .from(storeRole)
      .where(and(eq(storeRole.id, roleId), eq(storeRole.storeId, ctx.store.id)))
      .limit(1)

    if (!existing) throw new NotFoundError("Role not found")
    if (existing.isSystem) throw new BadRequestError("The system role's permissions cannot be changed.")

    const [updated] = await db
      .update(storeRole)
      .set(result.data)
      .where(and(eq(storeRole.id, roleId), eq(storeRole.storeId, ctx.store.id)))
      .returning()

    await invalidateRoles(ctx.store.id)

    return AppResponse.ok(updated, "Permissions updated successfully")
  } catch (error) {
    return handleError("Update role permissions", error)
  }
}
