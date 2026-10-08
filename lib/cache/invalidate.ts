import redis from "./redis"
import {
  CUSTOMER_REPORT_KEY,
  DASHBOARD_KEY,
  INVENTORY_REPORT_KEY,
  INVOICE_REPORT_KEY,
  POS_KEY,
  POS_PRODUCTS_KEY,
  PRODUCT_REPORT_KEY,
  PRODUCTS_EXPIRED_KEY,
  PRODUCTS_FORM_DATA_KEY,
  PRODUCTS_KEY,
  PRODUCTS_LIST_KEY,
  PRODUCTS_LOW_STOCK_KEY,
  SALES_DASHBOARD_KEY,
  SALES_REPORT_KEY,
  SUPPLIER_REPORT_KEY,
} from "./constants"
import { invalidateListCache } from "./list-cache"


export const invalidateDerivedCaches = (storeId: string) =>
  Promise.all([
    redis.del(`${PRODUCTS_KEY}${storeId}`),
    invalidateListCache(PRODUCTS_LIST_KEY, storeId),
    invalidateListCache(PRODUCTS_EXPIRED_KEY, storeId),
    invalidateListCache(PRODUCTS_LOW_STOCK_KEY, storeId),
    redis.del(`${PRODUCTS_FORM_DATA_KEY}${storeId}`),
    redis.del(`${POS_KEY}${storeId}`),
    invalidateListCache(POS_PRODUCTS_KEY, storeId),
    redis.del(`${DASHBOARD_KEY}${storeId}`),
    redis.del(`${SALES_DASHBOARD_KEY}${storeId}`),
    redis.del(`${SALES_REPORT_KEY}${storeId}`),
    redis.del(`${INVENTORY_REPORT_KEY}${storeId}`),
    redis.del(`${INVOICE_REPORT_KEY}${storeId}`),
    redis.del(`${CUSTOMER_REPORT_KEY}${storeId}`),
    redis.del(`${SUPPLIER_REPORT_KEY}${storeId}`),
    redis.del(`${PRODUCT_REPORT_KEY}${storeId}`),
  ])
