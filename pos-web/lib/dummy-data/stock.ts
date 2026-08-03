import type { StockMovement } from "@/lib/types"

const TENANT = "t1"

export const stockMovements: StockMovement[] = [
  { id: "sm1", tenantId: TENANT, productId: "p2", productName: "Samsung Galaxy S24", sku: "SAM-GS24-128", type: "adjustment", quantityBefore: 20, quantityChange: -12, quantityAfter: 8, reason: "Damaged in transit", responsible: "James Carter", date: "2026-07-29" },
  { id: "sm2", tenantId: TENANT, productId: "p10", productName: "Nestle Nescafe Gold 200g", sku: "NES-NCG-200", type: "adjustment", quantityBefore: 30, quantityChange: -26, quantityAfter: 4, reason: "Stock count correction", responsible: "Emma Davis", date: "2026-07-28" },
  { id: "sm3", tenantId: TENANT, productId: "p6", productName: "L'Oreal Revitalift Serum", sku: "LOR-RVT-SRM", type: "adjustment", quantityBefore: 25, quantityChange: -22, quantityAfter: 3, reason: "Expired batch removed", responsible: "James Carter", date: "2026-07-25" },
  { id: "sm4", tenantId: TENANT, productId: "p1", productName: "iPhone 15 Pro Max", sku: "APL-IP15PM-256", type: "transfer", fromStore: "Central Warehouse", toStore: "Downtown Store", quantityBefore: 60, quantityChange: -18, quantityAfter: 42, reason: "Store replenishment", responsible: "Michael Scott", date: "2026-07-27" },
  { id: "sm5", tenantId: TENANT, productId: "p9", productName: "Nike Dri-FIT T-Shirt", sku: "NIK-DRF-TS-M", type: "transfer", fromStore: "North Distribution Hub", toStore: "Mall Outlet", quantityBefore: 200, quantityChange: -80, quantityAfter: 120, reason: "Seasonal restock", responsible: "Pam Beesly", date: "2026-07-22" },
  { id: "sm6", tenantId: TENANT, productId: "p4", productName: "Nike Air Max 270", sku: "NIK-AM270-42", type: "transfer", fromStore: "Central Warehouse", toStore: "Airport Kiosk", quantityBefore: 40, quantityChange: -16, quantityAfter: 24, reason: "New store launch", responsible: "Michael Scott", date: "2026-07-18" },
]

export function getStockMovements(type?: "adjustment" | "transfer") {
  if (!type) return stockMovements
  return stockMovements.filter((m) => m.type === type)
}
