"use server"

import { eq } from "drizzle-orm"
import db from "@/lib/database/db"
import { user } from "@/lib/database/schemas"
import { getStoreContext } from "@/lib/database/queries/store-context"
import { ApiResponse, AppResponse } from "@/lib/common/response"
import { handleError } from "@/lib/common/errors"

export interface StoreSettings {
  name: string
  slug: string
  country: string
  currency: string
  logo: string | null
  ownerName: string
  ownerEmail: string
}

export const getSettings = async (tenant: string): Promise<ApiResponse<StoreSettings>> => {
  try {
    const ctx = await getStoreContext(tenant)

    const [owner] = await db
      .select({ name: user.name, email: user.email })
      .from(user)
      .where(eq(user.id, ctx.store.userId))
      .limit(1)

    return AppResponse.ok({
      name: ctx.store.name,
      slug: ctx.store.slug,
      country: ctx.store.country,
      currency: ctx.store.currency,
      logo: ctx.store.logo,
      ownerName: owner?.name ?? "",
      ownerEmail: owner?.email ?? "",
    })
  } catch (error) {
    return handleError("Get settings", error)
  }
}
