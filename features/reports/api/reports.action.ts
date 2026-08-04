"use server"

import { count, desc, eq, sql } from "drizzle-orm"

import db from "@/lib/database/db"
import {
  biller,
  brand,
  category,
  customer,
  order,
  orderItem,
  product,
  supplier,
} from "@/lib/database/schemas"
import { getSuppliers } from "@/lib/dummy-data"
import { getStoreContext, requirePermission } from "@/lib/database/queries/store-context"
import { ApiResponse, AppResponse } from "@/lib/common/response"
import { handleError } from "@/lib/common/errors"
import redis from "@/lib/cache/redis"
import {
  CUSTOMER_REPORT_KEY,
  INVENTORY_REPORT_KEY,
  INVOICE_REPORT_KEY,
  PRODUCT_REPORT_KEY,
  SALES_REPORT_KEY,
  SUPPLIER_REPORT_KEY,
  TTL_SHORT,
} from "@/lib/cache/constants"
import type { Supplier } from "@/lib/types"

const salesReportCacheKey = (storeId: string) => `${SALES_REPORT_KEY}${storeId}`
const inventoryReportCacheKey = (storeId: string) => `${INVENTORY_REPORT_KEY}${storeId}`
const invoiceReportCacheKey = (storeId: string) => `${INVOICE_REPORT_KEY}${storeId}`
const customerReportCacheKey = (storeId: string) => `${CUSTOMER_REPORT_KEY}${storeId}`
const supplierReportCacheKey = (storeId: string) => `${SUPPLIER_REPORT_KEY}${storeId}`
const productReportCacheKey = (storeId: string) => `${PRODUCT_REPORT_KEY}${storeId}`

/** Invalidates every report cache derived from order/orderItem data. Called after a new order is placed. */
export const invalidateOrderReports = async (storeId: string) =>
  Promise.all([
    redis.del(salesReportCacheKey(storeId)),
    redis.del(invoiceReportCacheKey(storeId)),
    redis.del(customerReportCacheKey(storeId)),
    redis.del(productReportCacheKey(storeId)),
  ])

export interface SalesReportRow {
  id: string
  sku: string
  name: string
  brand: string
  category: string
  soldQty: number
  soldAmount: number
  inStock: number
}

export interface SalesReportData {
  rows: SalesReportRow[]
  newSales: number
  unitsSold: number
  ordersCount: number
  customersCount: number
  productOptions: { id: string; name: string }[]
}

export const getSalesReportData = async (tenant: string): Promise<ApiResponse<SalesReportData>> => {
  try {
    const ctx = await getStoreContext(tenant)
    requirePermission(ctx, "canViewSalesReport")

    const cacheKey = salesReportCacheKey(ctx.store.id)
    const cached = await redis.get(cacheKey)
    if (cached) {
      return AppResponse.ok(cached as SalesReportData)
    }

    const [products, soldRows, [{ ordersCount }], [{ customersCount }]] = await Promise.all([
      db
        .select({ product, brandName: brand.name, categoryName: category.name })
        .from(product)
        .innerJoin(category, eq(product.categoryId, category.id))
        .leftJoin(brand, eq(product.brandId, brand.id))
        .where(eq(product.storeId, ctx.store.id)),
      db
        .select({
          productId: orderItem.productId,
          qty: sql<string>`coalesce(sum(${orderItem.quantity}), 0)`,
          amount: sql<string>`coalesce(sum(${orderItem.quantity} * ${orderItem.price}), 0)`,
        })
        .from(orderItem)
        .innerJoin(order, eq(orderItem.orderId, order.id))
        .where(eq(order.storeId, ctx.store.id))
        .groupBy(orderItem.productId),
      db.select({ ordersCount: count() }).from(order).where(eq(order.storeId, ctx.store.id)),
      db.select({ customersCount: count() }).from(customer).where(eq(customer.storeId, ctx.store.id)),
    ])

    const soldMap = new Map(soldRows.map((r) => [r.productId, { qty: Number(r.qty), amount: Number(r.amount) }]))

    const rows: SalesReportRow[] = products.map(({ product: p, brandName, categoryName }) => {
      const sold = soldMap.get(p.id) ?? { qty: 0, amount: 0 }
      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        brand: brandName ?? "—",
        category: categoryName,
        soldQty: sold.qty,
        soldAmount: sold.amount,
        inStock: p.quantity,
      }
    })

    const data: SalesReportData = {
      rows,
      newSales: rows.reduce((sum, r) => sum + r.soldAmount, 0),
      unitsSold: rows.reduce((sum, r) => sum + r.soldQty, 0),
      ordersCount,
      customersCount,
      productOptions: rows.slice(0, 5).map((r) => ({ id: r.id, name: r.name })),
    }

    await redis.set(cacheKey, data, { ex: TTL_SHORT })

    return AppResponse.ok(data)
  } catch (error) {
    return handleError("Get sales report", error)
  }
}

export interface PurchaseReportData {
  suppliers: Supplier[]
  totalOrders: number
  totalDue: number
}

/**
 * There is no real purchase/procurement table in this schema — intentionally left
 * reading from dummy data rather than inventing one or faking it from sales orders.
 */
export const getPurchaseReportData = async (tenant: string): Promise<ApiResponse<PurchaseReportData>> => {
  try {
    void tenant
    const suppliers = getSuppliers()
    return AppResponse.ok({
      suppliers,
      totalOrders: suppliers.reduce((s, sup) => s + sup.totalOrders, 0),
      totalDue: suppliers.reduce((s, sup) => s + sup.totalDue, 0),
    })
  } catch (error) {
    return handleError("Get purchase report", error)
  }
}

export interface InventoryProductRow {
  id: string
  sku: string
  name: string
  categoryName: string
  quantity: number
  lowStockThreshold: number
  cost: number
}

export interface InventoryReportData {
  products: InventoryProductRow[]
  outOfStock: number
  lowStock: number
  stockValue: number
}

export const getInventoryReportData = async (tenant: string): Promise<ApiResponse<InventoryReportData>> => {
  try {
    const ctx = await getStoreContext(tenant)
    requirePermission(ctx, "canViewInventoryReport")

    const cacheKey = inventoryReportCacheKey(ctx.store.id)
    const cached = await redis.get(cacheKey)
    if (cached) {
      return AppResponse.ok(cached as InventoryReportData)
    }

    const rows = await db
      .select({ product, categoryName: category.name })
      .from(product)
      .innerJoin(category, eq(product.categoryId, category.id))
      .where(eq(product.storeId, ctx.store.id))
      .orderBy(product.name)

    const products: InventoryProductRow[] = rows.map(({ product: p, categoryName }) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      categoryName,
      quantity: p.quantity,
      lowStockThreshold: p.lowStockThreshold,
      cost: Number(p.cost),
    }))

    const data: InventoryReportData = {
      products,
      outOfStock: products.filter((p) => p.quantity === 0).length,
      lowStock: products.filter((p) => p.quantity > 0 && p.quantity <= p.lowStockThreshold).length,
      stockValue: products.reduce((s, p) => s + p.quantity * p.cost, 0),
    }

    await redis.set(cacheKey, data, { ex: TTL_SHORT })

    return AppResponse.ok(data)
  } catch (error) {
    return handleError("Get inventory report", error)
  }
}

export interface InvoiceRow {
  id: string
  orderNo: string
  customerName: string
  billerName: string
  total: number
  paymentMethod: "cash" | "card" | "wallet"
  status: "completed" | "pending" | "cancelled" | "returned"
  createdAt: Date
}

export const getInvoiceReportData = async (tenant: string): Promise<ApiResponse<InvoiceRow[]>> => {
  try {
    const ctx = await getStoreContext(tenant)
    requirePermission(ctx, "canViewInvoiceReport")

    const cacheKey = invoiceReportCacheKey(ctx.store.id)
    const cached = await redis.get(cacheKey)
    if (cached) {
      return AppResponse.ok(cached as InvoiceRow[])
    }

    const rows = await db
      .select({ order, customerName: customer.name, billerName: biller.name })
      .from(order)
      .leftJoin(customer, eq(order.customerId, customer.id))
      .leftJoin(biller, eq(order.billerId, biller.id))
      .where(eq(order.storeId, ctx.store.id))
      .orderBy(desc(order.createdAt))

    const invoices: InvoiceRow[] = rows.map(({ order: o, customerName, billerName }) => ({
      id: o.id,
      orderNo: o.orderNo,
      customerName: customerName ?? "Walk-in Customer",
      billerName: billerName ?? "—",
      total: Number(o.total),
      paymentMethod: o.paymentMethod,
      status: o.status,
      createdAt: o.createdAt,
    }))

    await redis.set(cacheKey, invoices, { ex: TTL_SHORT })

    return AppResponse.ok(invoices)
  } catch (error) {
    return handleError("Get invoice report", error)
  }
}

export interface SupplierReportRow {
  id: string
  name: string
  location: string | null
  totalDue: number
  status: "active" | "inactive"
}

export const getSupplierReportData = async (tenant: string): Promise<ApiResponse<SupplierReportRow[]>> => {
  try {
    const ctx = await getStoreContext(tenant)
    requirePermission(ctx, "canViewSupplierReport")

    const cacheKey = supplierReportCacheKey(ctx.store.id)
    const cached = await redis.get(cacheKey)
    if (cached) {
      return AppResponse.ok(cached as SupplierReportRow[])
    }

    const rows = await db
      .select()
      .from(supplier)
      .where(eq(supplier.storeId, ctx.store.id))
      .orderBy(supplier.name)

    const suppliers: SupplierReportRow[] = rows.map((s) => ({
      id: s.id,
      name: s.name,
      location: s.location,
      totalDue: Number(s.totalDue),
      status: s.status,
    }))

    await redis.set(cacheKey, suppliers, { ex: TTL_SHORT })

    return AppResponse.ok(suppliers)
  } catch (error) {
    return handleError("Get supplier report", error)
  }
}

export interface CustomerReportRow {
  id: string
  name: string
  location: string | null
  totalOrders: number
  totalSpent: number
  status: "active" | "inactive"
}

export const getCustomerReportData = async (tenant: string): Promise<ApiResponse<CustomerReportRow[]>> => {
  try {
    const ctx = await getStoreContext(tenant)
    requirePermission(ctx, "canViewCustomerReport")

    const cacheKey = customerReportCacheKey(ctx.store.id)
    const cached = await redis.get(cacheKey)
    if (cached) {
      return AppResponse.ok(cached as CustomerReportRow[])
    }

    const rows = await db
      .select({
        customer,
        totalOrders: count(order.id),
        totalSpent: sql<string>`coalesce(sum(${order.total}), 0)`,
      })
      .from(customer)
      .leftJoin(order, eq(order.customerId, customer.id))
      .where(eq(customer.storeId, ctx.store.id))
      .groupBy(customer.id)
      .orderBy(desc(sql`coalesce(sum(${order.total}), 0)`))

    const customers: CustomerReportRow[] = rows.map(({ customer: c, totalOrders, totalSpent }) => ({
      id: c.id,
      name: c.name,
      location: c.location,
      totalOrders,
      totalSpent: Number(totalSpent),
      status: c.status,
    }))

    await redis.set(cacheKey, customers, { ex: TTL_SHORT })

    return AppResponse.ok(customers)
  } catch (error) {
    return handleError("Get customer report", error)
  }
}

export interface ProductReportRow {
  id: string
  sku: string
  name: string
  brandName: string
  categoryName: string
  cost: number
  price: number
  quantity: number
  unitsSold: number
  revenue: number
}

export const getProductReportData = async (tenant: string): Promise<ApiResponse<ProductReportRow[]>> => {
  try {
    const ctx = await getStoreContext(tenant)
    requirePermission(ctx, "canViewProductReport")

    const cacheKey = productReportCacheKey(ctx.store.id)
    const cached = await redis.get(cacheKey)
    if (cached) {
      return AppResponse.ok(cached as ProductReportRow[])
    }

    const rows = await db
      .select({
        product,
        brandName: brand.name,
        categoryName: category.name,
        unitsSold: sql<string>`coalesce(sum(${orderItem.quantity}), 0)`,
        revenue: sql<string>`coalesce(sum(${orderItem.quantity} * ${orderItem.price}), 0)`,
      })
      .from(product)
      .innerJoin(category, eq(product.categoryId, category.id))
      .leftJoin(brand, eq(product.brandId, brand.id))
      .leftJoin(orderItem, eq(orderItem.productId, product.id))
      .where(eq(product.storeId, ctx.store.id))
      .groupBy(product.id, brand.name, category.name)
      .orderBy(product.name)

    const products: ProductReportRow[] = rows.map(({ product: p, brandName, categoryName, unitsSold, revenue }) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      brandName: brandName ?? "—",
      categoryName,
      cost: Number(p.cost),
      price: Number(p.price),
      quantity: p.quantity,
      unitsSold: Number(unitsSold),
      revenue: Number(revenue),
    }))

    await redis.set(cacheKey, products, { ex: TTL_SHORT })

    return AppResponse.ok(products)
  } catch (error) {
    return handleError("Get product report", error)
  }
}
