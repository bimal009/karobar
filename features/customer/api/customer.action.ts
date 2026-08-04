"use server"

import { and, eq } from "drizzle-orm"

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
import { NotFoundError, ValidationError, handleError } from "@/lib/common/errors"
import redis from "@/lib/cache/redis"
import { CUSTOMERS_KEY, TTL_MEDIUM } from "@/lib/cache/constants"

const customersCacheKey = (storeId: string) => `${CUSTOMERS_KEY}${storeId}`

const invalidateCustomers = (storeId: string) => redis.del(customersCacheKey(storeId))

export const getCustomers = async (slug: string): Promise<ApiResponse<Customer[]>> => {
  try {
    const ctx = await getStoreContext(slug)
    requirePermission(ctx, "canViewCustomers")

    const cacheKey = customersCacheKey(ctx.store.id)
    const cached = await redis.get(cacheKey)
    if (cached) {
      return AppResponse.ok(cached as Customer[])
    }

    const customers = await db
      .select()
      .from(customer)
      .where(eq(customer.storeId, ctx.store.id))
      .orderBy(customer.createdAt)

    await redis.set(cacheKey, customers, { ex: TTL_MEDIUM })

    return AppResponse.ok(customers)
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
