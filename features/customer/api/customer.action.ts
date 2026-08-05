"use server"

import { and, count, eq, ilike, or } from "drizzle-orm"

import db from "@/lib/database/db"
import { customer, type Customer } from "@/lib/database/schemas"
import {
  CustomerInsert,
  CustomerUpdate,
  customerInsertSchema,
  customerUpdateSchema,
} from "@/lib/database/zod/customers"
import { getStoreContext, requirePermission } from "@/lib/database/queries/store-context"
import { ApiResponse, AppResponse } from "@/lib/common/response"
import { PaginationQuery, PaginationQuerySchema, resolveSortColumn } from "@/lib/common/pagination"
import { NotFoundError, ValidationError, handleError } from "@/lib/common/errors"
import { CUSTOMERS_KEY } from "@/lib/cache/constants"
import { invalidateDerivedCaches } from "@/lib/cache/invalidate"
import { buildListCacheKey, getCachedList, invalidateListCache, setCachedList, type CachedPage } from "@/lib/cache/list-cache"

const invalidateCustomers = (storeId: string) =>
  Promise.all([invalidateListCache(CUSTOMERS_KEY, storeId), invalidateDerivedCaches(storeId)])

export const getCustomers = async (
  slug: string,
  query: Partial<PaginationQuery> = {}
): Promise<ApiResponse<Customer[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewCustomers")

    const parsed = PaginationQuerySchema.safeParse(query)
    if (!parsed.success) {
      throw new ValidationError("Invalid pagination params", parsed.error.flatten())
    }
    const { page, limit, search, sortBy, sortOrder } = parsed.data

    const cacheKey = buildListCacheKey(CUSTOMERS_KEY, ctx.store.id, { page, limit, search, sortBy, sortOrder })
    const cached = await getCachedList<CachedPage<Customer>>(cacheKey)
    if (cached) {
      return AppResponse.paginated(cached.rows, {
        page,
        limit,
        total: cached.total,
        totalPages: Math.max(1, Math.ceil(cached.total / limit)),
      })
    }

    const orderBy = resolveSortColumn(
      { name: customer.name, createdAt: customer.createdAt },
      sortBy,
      "createdAt",
      sortOrder
    )

    const conditions = [eq(customer.storeId, ctx.store.id)]
    if (search) {
      conditions.push(
        or(
          ilike(customer.name, `%${search}%`),
          ilike(customer.email, `%${search}%`),
          ilike(customer.phone, `%${search}%`)
        )!
      )
    }

    const baseQuery = db
      .select()
      .from(customer)
      .where(and(...conditions))

    const countQuery = db
      .select({ total: count() })
      .from(customer)
      .where(and(...conditions))

    const [customers, [{ total }]] = await Promise.all([
      baseQuery.orderBy(orderBy).limit(limit).offset((page - 1) * limit),
      countQuery,
    ])

    await setCachedList(cacheKey, { rows: customers, total })

    return AppResponse.paginated(customers, {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    })
  } catch (error) {
    return handleError("Get customers", error)
  }
}

export const createCustomer = async (
  slug: string,
  data: CustomerInsert
): Promise<ApiResponse<Customer>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canCreateCustomers")

    const result = customerInsertSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    const [newCustomer] = await db
      .insert(customer)
      .values({ ...result.data, storeId: ctx.store.id })
      .returning()

    await invalidateCustomers(ctx.store.id)

    return AppResponse.created(newCustomer, "Customer created successfully")
  } catch (error) {
    return handleError("Create customer", error)
  }
}

export const updateCustomer = async (
  slug: string,
  id: string,
  data: CustomerUpdate
): Promise<ApiResponse<Customer>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canEditCustomers")

    const result = customerUpdateSchema.safeParse(data)
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.flatten())
    }

    const [updated] = await db
      .update(customer)
      .set(result.data)
      .where(and(eq(customer.id, id), eq(customer.storeId, ctx.store.id)))
      .returning()

    if (!updated) {
      throw new NotFoundError("Customer not found")
    }

    await invalidateCustomers(ctx.store.id)

    return AppResponse.ok(updated, "Customer updated successfully")
  } catch (error) {
    return handleError("Update customer", error)
  }
}

export const deleteCustomer = async (slug: string, id: string): Promise<ApiResponse<never>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canDeleteCustomers")

    const [deleted] = await db
      .delete(customer)
      .where(and(eq(customer.id, id), eq(customer.storeId, ctx.store.id)))
      .returning()

    if (!deleted) {
      throw new NotFoundError("Customer not found")
    }

    await invalidateCustomers(ctx.store.id)

    return AppResponse.noContent("Customer deleted successfully")
  } catch (error) {
    return handleError("Delete customer", error)
  }
}
