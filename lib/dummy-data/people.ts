import type { Supplier } from "@/lib/types"

const TENANT = "t1"

/**
 * Only suppliers remain here. Customers/billers/stores/warehouses are now
 * real DB-backed features. Suppliers stays dummy because the Purchase Report
 * is the one report with no real purchase/procurement table to draw from.
 */
export const suppliers: Supplier[] = [
  { id: "su1", tenantId: TENANT, name: "Global Supply Co.", email: "contact@globalsupply.com", phone: "+1 202-555-0110", avatarInitial: "G", totalOrders: 58, totalDue: 12400, location: "Newark, US", status: "active" },
  { id: "su2", tenantId: TENANT, name: "Pacific Distributors", email: "sales@pacificdist.com", phone: "+1 202-555-0121", avatarInitial: "P", totalOrders: 32, totalDue: 0, location: "Los Angeles, US", status: "active" },
  { id: "su3", tenantId: TENANT, name: "Everline Traders", email: "info@everline.com", phone: "+1 202-555-0134", avatarInitial: "E", totalOrders: 14, totalDue: 3200, location: "Miami, US", status: "active" },
  { id: "su4", tenantId: TENANT, name: "Nordic Imports", email: "hello@nordicimports.com", phone: "+1 202-555-0145", avatarInitial: "N", totalOrders: 9, totalDue: 850, location: "Portland, US", status: "inactive" },
]

export function getSuppliers() { return suppliers }
