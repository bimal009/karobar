import redis from "./redis"
import {
  CUSTOMER_REPORT_KEY,
  DASHBOARD_KEY,
  INVENTORY_REPORT_KEY,
  INVOICE_REPORT_KEY,
  POS_KEY,
  PRODUCT_REPORT_KEY,
  PRODUCTS_KEY,
  SALES_DASHBOARD_KEY,
  SALES_REPORT_KEY,
  SUPPLIER_REPORT_KEY,
} from "./constants"

/**
 * Clears every cache derived from products/categories/brands/units/warranties/
 * customers/suppliers/orders for a store. Reports, dashboards, and POS all read
 * overlapping data, so any mutation to those entities should call this rather
 * than invalidating a single narrow key — that's what let stale data linger
 * after edits made elsewhere.
 */
export const invalidateDerivedCaches = (storeId: string) =>
  Promise.all([
    redis.del(`${PRODUCTS_KEY}${storeId}`),
    redis.del(`${POS_KEY}${storeId}`),
    redis.del(`${DASHBOARD_KEY}${storeId}`),
    redis.del(`${SALES_DASHBOARD_KEY}${storeId}`),
    redis.del(`${SALES_REPORT_KEY}${storeId}`),
    redis.del(`${INVENTORY_REPORT_KEY}${storeId}`),
    redis.del(`${INVOICE_REPORT_KEY}${storeId}`),
    redis.del(`${CUSTOMER_REPORT_KEY}${storeId}`),
    redis.del(`${SUPPLIER_REPORT_KEY}${storeId}`),
    redis.del(`${PRODUCT_REPORT_KEY}${storeId}`),
  ])
