import type { QueryClient } from "@tanstack/react-query"

/**
 * Client-side counterpart to `invalidateDerivedCaches` (lib/cache/invalidate.ts).
 * Products, POS, dashboards, and reports all read overlapping data, so any mutation
 * to products/categories/brands/units/warranties/customers/suppliers/orders should
 * invalidate all of them rather than just its own query key — that's what let stale
 * data linger in open tabs after edits made elsewhere.
 */
export const invalidateDerivedQueries = (queryClient: QueryClient, tenant: string) =>
  Promise.all(
    (
      [
        ["products", tenant],
        ["pos-data", tenant],
        ["pos-products", tenant],
        ["dashboard", tenant],
        ["sales-dashboard", tenant],
        ["sales-report", tenant],
        ["inventory-report", tenant],
        ["invoice-report", tenant],
        ["supplier-report", tenant],
        ["customer-report", tenant],
        ["product-report", tenant],
      ] as const
    ).map((queryKey) => queryClient.invalidateQueries({ queryKey }))
  )
