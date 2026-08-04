import type { RevenuePoint } from "@/lib/types"

/**
 * Only revenueSeries remains here, used by the superadmin platform dashboard's
 * MRR chart. Real per-store revenue now comes from features/dashboard, which
 * derives it from real orders instead of this file.
 */
export const revenueSeries: RevenuePoint[] = [
  { label: "Jan", revenue: 42000, expenses: 28000 },
  { label: "Feb", revenue: 38500, expenses: 26500 },
  { label: "Mar", revenue: 51200, expenses: 31000 },
  { label: "Apr", revenue: 47800, expenses: 29800 },
  { label: "May", revenue: 55600, expenses: 33200 },
  { label: "Jun", revenue: 61200, expenses: 35400 },
  { label: "Jul", revenue: 58940, expenses: 34100 },
]
