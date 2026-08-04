"use server"

import { and, count, eq, ilike, or } from "drizzle-orm"

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
import { PaginationQuery, PaginationQuerySchema } from "@/lib/common/pagination"
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ValidationError,
  handleError,
} from "@/lib/common/errors"
import redis from "@/lib/cache/redis"
import { STORE_ROLES_KEY } from "@/lib/cache/constants"

const rolesCacheKey = (storeId: string) => `${STORE_ROLES_KEY}${storeId}`

const invalidateRoles = (storeId: string) => redis.del(rolesCacheKey(storeId))

export const getRoles = async (
  slug: string,
  query: Partial<PaginationQuery> = {}
): Promise<ApiResponse<StoreRole[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canManageSettings")

    const parsed = PaginationQuerySchema.safeParse(query)
    if (!parsed.success) {
      throw new ValidationError("Invalid pagination params", parsed.error.flatten())
    }
    const { page, limit, search } = parsed.data

    const conditions = [eq(storeRole.storeId, ctx.store.id)]
    if (search) {
      conditions.push(
        or(ilike(storeRole.name, `%${search}%`), ilike(storeRole.description, `%${search}%`))!
      )
    }

    const baseQuery = db
      .select()
      .from(storeRole)
      .where(and(...conditions))

    const countQuery = db
      .select({ total: count() })
      .from(storeRole)
      .where(and(...conditions))

    const [roles, [{ total }]] = await Promise.all([
      baseQuery.orderBy(storeRole.createdAt).limit(limit).offset((page - 1) * limit),
      countQuery,
    ])

    return AppResponse.paginated(roles, {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    })
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
