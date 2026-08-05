"use server"

import { and, count, desc, eq, gte, sql } from "drizzle-orm"

import db from "@/lib/database/db"
import { branch, category, customer, order, orderItem, product, supplier, user } from "@/lib/database/schemas"
import { getStoreContext, requirePermission } from "@/lib/database/queries/store-context"
import { ApiResponse, AppResponse } from "@/lib/common/response"
import { handleError } from "@/lib/common/errors"
import redis from "@/lib/cache/redis"
import { DASHBOARD_KEY, SALES_DASHBOARD_KEY, TTL_SHORT } from "@/lib/cache/constants"

const dashboardCacheKey = (storeId: string) => `${DASHBOARD_KEY}${storeId}`
const salesDashboardCacheKey = (storeId: string) => `${SALES_DASHBOARD_KEY}${storeId}`

export interface RevenuePoint {
  label: string
  revenue: number
  expenses: number
}

export interface DashboardTopProduct {
  id: string
  name: string
  categoryName: string
  sold: number
  revenue: number
  avgPrice: number
}

export interface DashboardLowStockProduct {
  id: string
  name: string
  sku: string
  categoryName: string
  quantity: number
  lowStockThreshold: number
}

export interface DashboardCategorySlice {
  id: string
  name: string
  productsCount: number
  percent: number
}

export interface DashboardRecentSale {
  id: string
  orderNo: string
  customerName: string
  customerAvatarInitial: string
  total: number
  paymentMethod: "cash" | "card" | "wallet"
  status: "completed" | "pending" | "cancelled" | "returned"
}

export interface DashboardTopCustomer {
  id: string
  name: string
  location: string | null
  avatarInitial: string
  totalOrders: number
  totalSpent: number
}

export interface DashboardData {
  ordersCount: number
  customersCount: number
  suppliersCount: number
  lowStock: DashboardLowStockProduct[]
  topProducts: DashboardTopProduct[]
  categories: DashboardCategorySlice[]
  totalCategoryProducts: number
  revenueByDay: RevenuePoint[]
  totalSales: number
  totalSalesReturn: number
  totalPurchase: number
  totalPurchaseReturn: number
  profit: number
  invoiceDue: number
  recentSales: DashboardRecentSale[]
  topCustomers: DashboardTopCustomer[]
}

async function fetchTopProducts(storeId: string, limit: number): Promise<DashboardTopProduct[]> {
  const rows = await db
    .select({
      productId: orderItem.productId,
      name: product.name,
      categoryName: category.name,
      sold: sql<string>`sum(${orderItem.quantity})`,
      revenue: sql<string>`sum(${orderItem.quantity} * ${orderItem.price})`,
    })
    .from(orderItem)
    .innerJoin(order, eq(orderItem.orderId, order.id))
    .innerJoin(product, eq(orderItem.productId, product.id))
    .innerJoin(category, eq(product.categoryId, category.id))
    .where(eq(order.storeId, storeId))
    .groupBy(orderItem.productId, product.name, category.name)
    .orderBy(desc(sql`sum(${orderItem.quantity} * ${orderItem.price})`))
    .limit(limit)

  return rows.map((r) => {
    const sold = Number(r.sold)
    const revenue = Number(r.revenue)
    return {
      id: r.productId,
      name: r.name,
      categoryName: r.categoryName,
      sold,
      revenue,
      avgPrice: sold > 0 ? revenue / sold : 0,
    }
  })
}

async function fetchRecentSales(storeId: string, limit: number): Promise<DashboardRecentSale[]> {
  const rows = await db
    .select({ order, customerName: customer.name })
    .from(order)
    .leftJoin(customer, eq(order.customerId, customer.id))
    .where(eq(order.storeId, storeId))
    .orderBy(desc(order.createdAt))
    .limit(limit)

  return rows.map(({ order: o, customerName }) => ({
    id: o.id,
    orderNo: o.orderNo,
    customerName: customerName ?? "Walk-in Customer",
    customerAvatarInitial: (customerName ?? "W").charAt(0).toUpperCase(),
    total: Number(o.total),
    paymentMethod: o.paymentMethod,
    status: o.status,
  }))
}

export const getDashboardData = async (tenant: string): Promise<ApiResponse<DashboardData>> => {
  try {
    const ctx = await getStoreContext(tenant)
    requirePermission(ctx, "canViewDashboard")

    const cacheKey = dashboardCacheKey(ctx.store.id)
    const cached = await redis.get(cacheKey)
    if (cached) {
      return AppResponse.ok(cached as DashboardData)
    }

    const storeId = ctx.store.id

    const [
      [{ ordersCount }],
      [{ customersCount }],
      suppliers,
      products,
      categoryRows,
      revenueRows,
      [{ totalSales }],
      [{ totalSalesReturn }],
      topProducts,
      recentSales,
      topCustomerRows,
    ] = await Promise.all([
      db.select({ ordersCount: count() }).from(order).where(eq(order.storeId, storeId)),
      db.select({ customersCount: count() }).from(customer).where(eq(customer.storeId, storeId)),
      db.select().from(supplier).where(eq(supplier.storeId, storeId)),
      db
        .select({ product, categoryName: category.name })
        .from(product)
        .innerJoin(category, eq(product.categoryId, category.id))
        .where(eq(product.storeId, storeId)),
      db
        .select({ category, productsCount: count(product.id) })
        .from(category)
        .leftJoin(product, eq(product.categoryId, category.id))
        .where(eq(category.storeId, storeId))
        .groupBy(category.id)
        .orderBy(desc(count(product.id)))
        .limit(4),
      db
        .select({
          day: sql<string>`to_char(date_trunc('day', ${order.createdAt}), 'Mon DD')`,
          revenue: sql<string>`sum(${order.total})`,
        })
        .from(order)
        .where(eq(order.storeId, storeId))
        .groupBy(sql`date_trunc('day', ${order.createdAt})`)
        .orderBy(sql`date_trunc('day', ${order.createdAt})`),
      db
        .select({ totalSales: sql<string>`coalesce(sum(${order.total}), 0)` })
        .from(order)
        .where(and(eq(order.storeId, storeId), eq(order.status, "completed"))),
      db
        .select({ totalSalesReturn: sql<string>`coalesce(sum(${order.total}), 0)` })
        .from(order)
        .where(and(eq(order.storeId, storeId), eq(order.status, "returned"))),
      fetchTopProducts(storeId, 5),
      fetchRecentSales(storeId, 5),
      db
        .select({
          customer,
          totalOrders: count(order.id),
          totalSpent: sql<string>`coalesce(sum(${order.total}), 0)`,
        })
        .from(customer)
        .innerJoin(order, eq(order.customerId, customer.id))
        .where(eq(customer.storeId, storeId))
        .groupBy(customer.id)
        .orderBy(desc(sql`coalesce(sum(${order.total}), 0)`))
        .limit(5),
    ])

    const lowStock: DashboardLowStockProduct[] = products
      .filter(({ product: p }) => p.quantity <= p.lowStockThreshold)
      .map(({ product: p, categoryName }) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        categoryName,
        quantity: p.quantity,
        lowStockThreshold: p.lowStockThreshold,
      }))

    const totalCategoryProducts = categoryRows.reduce((sum, { productsCount }) => sum + productsCount, 0)
    const categories: DashboardCategorySlice[] = categoryRows.map(({ category: c, productsCount }) => ({
      id: c.id,
      name: c.name,
      productsCount,
      percent: totalCategoryProducts > 0 ? Math.round((productsCount / totalCategoryProducts) * 100) : 0,
    }))

    const revenueByDay: RevenuePoint[] = revenueRows.map((r) => ({
      label: r.day,
      revenue: Number(r.revenue),
      expenses: 0,
    }))

    const topCustomers: DashboardTopCustomer[] = topCustomerRows.map(({ customer: c, totalOrders, totalSpent }) => ({
      id: c.id,
      name: c.name,
      location: c.location,
      avatarInitial: c.name.charAt(0).toUpperCase(),
      totalOrders,
      totalSpent: Number(totalSpent),
    }))

    const totalPurchase = 0
    const totalPurchaseReturn = 0
    const invoiceDue = suppliers.reduce((s, sup) => s + Number(sup.totalDue), 0)

    const data: DashboardData = {
      ordersCount,
      customersCount,
      suppliersCount: suppliers.length,
      lowStock,
      topProducts,
      categories,
      totalCategoryProducts,
      revenueByDay,
      totalSales: Number(totalSales),
      totalSalesReturn: Number(totalSalesReturn),
      totalPurchase,
      totalPurchaseReturn,
      profit: Number(totalSales) - totalPurchase,
      invoiceDue,
      recentSales,
      topCustomers,
    }

    await redis.set(cacheKey, data, { ex: TTL_SHORT })

    return AppResponse.ok(data)
  } catch (error) {
    return handleError("Get dashboard data", error)
  }
}

export interface SalesDashboardData {
  userName: string
  topProducts: DashboardTopProduct[]
  weeklyEarning: number
  totalSales: number
  totalRevenue: number
  purchasedGoods: number
  salesByStore: { store: string; total: number }[]
  maxStoreTotal: number
  recent: DashboardRecentSale[]
  revenueByDay: RevenuePoint[]
}

export const getSalesDashboardData = async (tenant: string): Promise<ApiResponse<SalesDashboardData>> => {
  try {
    const ctx = await getStoreContext(tenant)
    requirePermission(ctx, "canViewDashboard")

    const cacheKey = salesDashboardCacheKey(ctx.store.id)
    const cached = await redis.get(cacheKey)
    if (cached) {
      return AppResponse.ok(cached as SalesDashboardData)
    }

    const storeId = ctx.store.id
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [
      [currentUser],
      [{ weeklyEarning }],
      [{ totalSales }],
      [{ totalRevenue }],
      [{ purchasedGoods }],
      salesByStoreRows,
      topProducts,
      recent,
      revenueRows,
    ] = await Promise.all([
      db.select({ name: user.name }).from(user).where(eq(user.id, ctx.userId)).limit(1),
      db
        .select({ weeklyEarning: sql<string>`coalesce(sum(${order.total}), 0)` })
        .from(order)
        .where(
          and(eq(order.storeId, storeId), eq(order.status, "completed"), gte(order.createdAt, sevenDaysAgo))
        ),
      db.select({ totalSales: count() }).from(order).where(eq(order.storeId, storeId)),
      db
        .select({ totalRevenue: sql<string>`coalesce(sum(${order.total}), 0)` })
        .from(order)
        .where(and(eq(order.storeId, storeId), eq(order.status, "completed"))),
      db
        .select({ purchasedGoods: sql<string>`coalesce(sum(${orderItem.quantity}), 0)` })
        .from(orderItem)
        .innerJoin(order, eq(orderItem.orderId, order.id))
        .where(eq(order.storeId, storeId)),
      db
        .select({
          storeName: branch.name,
          total: sql<string>`sum(${order.total})`,
        })
        .from(order)
        .innerJoin(branch, eq(order.branchId, branch.id))
        .where(eq(order.storeId, storeId))
        .groupBy(branch.id)
        .orderBy(desc(sql`sum(${order.total})`)),
      fetchTopProducts(storeId, 5),
      fetchRecentSales(storeId, 5),
      db
        .select({
          day: sql<string>`to_char(date_trunc('day', ${order.createdAt}), 'Mon DD')`,
          revenue: sql<string>`sum(${order.total})`,
        })
        .from(order)
        .where(eq(order.storeId, storeId))
        .groupBy(sql`date_trunc('day', ${order.createdAt})`)
        .orderBy(sql`date_trunc('day', ${order.createdAt})`),
    ])

    const salesByStore = salesByStoreRows.map((r) => ({ store: r.storeName, total: Number(r.total) }))
    const maxStoreTotal = Math.max(...salesByStore.map((s) => s.total), 1)

    const data: SalesDashboardData = {
      userName: currentUser?.name ?? "there",
      topProducts,
      weeklyEarning: Number(weeklyEarning),
      totalSales,
      totalRevenue: Number(totalRevenue),
      purchasedGoods: Number(purchasedGoods),
      salesByStore,
      maxStoreTotal,
      recent,
      revenueByDay: revenueRows.map((r) => ({ label: r.day, revenue: Number(r.revenue), expenses: 0 })),
    }

    await redis.set(cacheKey, data, { ex: TTL_SHORT })

    return AppResponse.ok(data)
  } catch (error) {
    return handleError("Get sales dashboard data", error)
  }
}
