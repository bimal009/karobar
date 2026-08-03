import type { Biller, Customer, Store, Supplier, Warehouse } from "@/lib/types"

const TENANT = "t1"

export const customers: Customer[] = [
  { id: "cu1", tenantId: TENANT, name: "Robert Fox", email: "robert.fox@example.com", phone: "+1 202-555-0143", avatarInitial: "R", totalOrders: 34, totalSpent: 4820.5, status: "active", location: "New York, US", joinedAt: "2024-02-14" },
  { id: "cu2", tenantId: TENANT, name: "Jenny Wilson", email: "jenny.wilson@example.com", phone: "+1 202-555-0187", avatarInitial: "J", totalOrders: 21, totalSpent: 2310.0, status: "active", location: "Boston, US", joinedAt: "2024-04-01" },
  { id: "cu3", tenantId: TENANT, name: "Cody Fisher", email: "cody.fisher@example.com", phone: "+1 202-555-0122", avatarInitial: "C", totalOrders: 12, totalSpent: 998.75, status: "active", location: "Chicago, US", joinedAt: "2024-05-19" },
  { id: "cu4", tenantId: TENANT, name: "Esther Howard", email: "esther.howard@example.com", phone: "+1 202-555-0199", avatarInitial: "E", totalOrders: 45, totalSpent: 6120.4, status: "active", location: "Austin, US", joinedAt: "2023-12-08" },
  { id: "cu5", tenantId: TENANT, name: "Kristin Watson", email: "kristin.watson@example.com", phone: "+1 202-555-0155", avatarInitial: "K", totalOrders: 3, totalSpent: 210.0, status: "inactive", location: "Denver, US", joinedAt: "2025-01-27" },
  { id: "cu6", tenantId: TENANT, name: "Devon Lane", email: "devon.lane@example.com", phone: "+1 202-555-0166", avatarInitial: "D", totalOrders: 18, totalSpent: 1540.9, status: "active", location: "Seattle, US", joinedAt: "2024-07-03" },
]

export const suppliers: Supplier[] = [
  { id: "su1", tenantId: TENANT, name: "Global Supply Co.", email: "contact@globalsupply.com", phone: "+1 202-555-0110", avatarInitial: "G", totalOrders: 58, totalDue: 12400, location: "Newark, US", status: "active" },
  { id: "su2", tenantId: TENANT, name: "Pacific Distributors", email: "sales@pacificdist.com", phone: "+1 202-555-0121", avatarInitial: "P", totalOrders: 32, totalDue: 0, location: "Los Angeles, US", status: "active" },
  { id: "su3", tenantId: TENANT, name: "Everline Traders", email: "info@everline.com", phone: "+1 202-555-0134", avatarInitial: "E", totalOrders: 14, totalDue: 3200, location: "Miami, US", status: "active" },
  { id: "su4", tenantId: TENANT, name: "Nordic Imports", email: "hello@nordicimports.com", phone: "+1 202-555-0145", avatarInitial: "N", totalOrders: 9, totalDue: 850, location: "Portland, US", status: "inactive" },
]

export const billers: Biller[] = [
  { id: "bi1", tenantId: TENANT, name: "Olivia Brown", email: "olivia@acmeretail.com", phone: "+1 202-555-0198", avatarInitial: "O", salesCount: 412, location: "Downtown Store", status: "active" },
  { id: "bi2", tenantId: TENANT, name: "Noah Wilson", email: "noah@acmeretail.com", phone: "+1 202-555-0111", avatarInitial: "N", salesCount: 356, location: "Mall Outlet", status: "active" },
  { id: "bi3", tenantId: TENANT, name: "Ava Martinez", email: "ava@acmeretail.com", phone: "+1 202-555-0177", avatarInitial: "A", salesCount: 198, location: "Downtown Store", status: "active" },
  { id: "bi4", tenantId: TENANT, name: "Liam Anderson", email: "liam@acmeretail.com", phone: "+1 202-555-0163", avatarInitial: "L", salesCount: 87, location: "Airport Kiosk", status: "inactive" },
]

export const stores: Store[] = [
  { id: "st1", tenantId: TENANT, name: "Downtown Store", email: "downtown@acmeretail.com", phone: "+1 202-555-0201", manager: "James Carter", location: "5th Avenue, New York", status: "active" },
  { id: "st2", tenantId: TENANT, name: "Mall Outlet", email: "mall@acmeretail.com", phone: "+1 202-555-0212", manager: "Emma Davis", location: "Westfield Mall, Boston", status: "active" },
  { id: "st3", tenantId: TENANT, name: "Airport Kiosk", email: "airport@acmeretail.com", phone: "+1 202-555-0223", manager: "Liam Anderson", location: "JFK Terminal 4, New York", status: "active" },
  { id: "st4", tenantId: TENANT, name: "Riverside Branch", email: "riverside@acmeretail.com", phone: "+1 202-555-0234", manager: "Sophia Turner", location: "Riverside Plaza, Chicago", status: "inactive" },
]

export const warehouses: Warehouse[] = [
  { id: "wh1", tenantId: TENANT, name: "Central Warehouse", email: "central.wh@acmeretail.com", phone: "+1 202-555-0301", contactPerson: "Michael Scott", location: "Industrial Zone, Newark", status: "active" },
  { id: "wh2", tenantId: TENANT, name: "North Distribution Hub", email: "north.wh@acmeretail.com", phone: "+1 202-555-0312", contactPerson: "Pam Beesly", location: "Logistics Park, Boston", status: "active" },
  { id: "wh3", tenantId: TENANT, name: "West Coast Depot", email: "west.wh@acmeretail.com", phone: "+1 202-555-0323", contactPerson: "Jim Halpert", location: "Port District, Los Angeles", status: "inactive" },
]

export function getCustomers() { return customers }
export function getSuppliers() { return suppliers }
export function getBillers() { return billers }
export function getStores() { return stores }
export function getWarehouses() { return warehouses }
