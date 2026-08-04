import { headers } from "next/headers"
import { and, eq } from "drizzle-orm"

import db from "@/lib/database/db"
import { auth } from "@/lib/auth"
import {
  store,
  storeMember,
  storeRole,
  type Store,
  type StoreRole,
} from "@/lib/database/schemas"
import { ForbiddenError, NotFoundError, UnauthorizedError } from "@/lib/common/errors"

export type PermissionKey = keyof Omit<
  StoreRole,
  "id" | "storeId" | "name" | "description" | "isSystem" | "createdAt" | "updatedAt"
>

export interface StoreContext {
  userId: string
  store: Store
  memberId: string
  role: StoreRole
}

/**
 * Resolves the signed-in user's membership (store, role, permissions) for a
 * tenant slug. Throws if unauthenticated, the store doesn't exist, or the
 * user isn't a member of it.
 */
export async function getStoreContext(slug: string): Promise<StoreContext> {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    throw new UnauthorizedError("You must be signed in.")
  }

  const [storeRow] = await db.select().from(store).where(eq(store.slug, slug)).limit(1)

  if (!storeRow) {
    throw new NotFoundError("Store not found")
  }

  const [membership] = await db
    .select({ member: storeMember, role: storeRole })
    .from(storeMember)
    .innerJoin(storeRole, eq(storeMember.roleId, storeRole.id))
    .where(and(eq(storeMember.storeId, storeRow.id), eq(storeMember.userId, session.user.id)))
    .limit(1)

  if (!membership) {
    throw new ForbiddenError("You are not a member of this store.")
  }

  return {
    userId: session.user.id,
    store: storeRow,
    memberId: membership.member.id,
    role: membership.role,
  }
}

export function requirePermission(ctx: StoreContext, key: PermissionKey) {
  if (ctx.role.isSystem || ctx.role[key]) return
  throw new ForbiddenError("You do not have permission to perform this action.")
}
