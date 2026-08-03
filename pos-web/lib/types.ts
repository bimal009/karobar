export type TenantStatus = "active" | "trial" | "suspended"
export type TenantPlan = "starter" | "growth" | "enterprise"

export interface Tenant {
  id: string
  slug: string
  name: string
  logoInitial: string
  logoColor: string
  plan: TenantPlan
  status: TenantStatus
  ownerName: string
  ownerEmail: string
  usersCount: number
  storesCount: number
  mrr: number
  createdAt: string
  trialEndsAt?: string
  country: string
}

export type UserRole = "admin" | "manager" | "salesperson"

export interface AppUser {
  id: string
  tenantId: string
  branchId: string | null
  name: string
  email: string
  avatarInitial: string
  role: UserRole
  status: "active" | "inactive"
  phone: string
  joinedAt: string
}

export interface Branch {
  id: string
  tenantId: string
  name: string
  code: string
  location: string
  phone: string
  managerName: string
  isMain: boolean
  status: "active" | "inactive"
}

export interface BranchStock {
  branchId: string
  productId: string
  quantity: number
}

export interface Category {
  id: string
  tenantId: string
  name: string
  slug: string
  productsCount: number
  status: "active" | "inactive"
}

export interface SubCategory {
  id: string
  tenantId: string
  categoryId: string
  categoryName: string
  name: string
  productsCount: number
  status: "active" | "inactive"
}

export interface Brand {
  id: string
  tenantId: string
  name: string
  productsCount: number
  status: "active" | "inactive"
}

export interface Unit {
  id: string
  tenantId: string
  name: string
  shortName: string
  status: "active" | "inactive"
}

export interface VariantAttribute {
  id: string
  tenantId: string
  name: string
  values: string[]
  status: "active" | "inactive"
}

export interface Warranty {
  id: string
  tenantId: string
  name: string
  duration: string
  description: string
  status: "active" | "inactive"
}

export interface Product {
  id: string
  tenantId: string
  name: string
  sku: string
  barcode: string
  categoryId: string
  categoryName: string
  brandId: string
  brandName: string
  unit: string
  price: number
  cost: number
  quantity: number
  lowStockThreshold: number
  status: "active" | "inactive"
  expiryDate?: string
  createdAt: string
}

export interface Customer {
  id: string
  tenantId: string
  name: string
  email: string
  phone: string
  avatarInitial: string
  totalOrders: number
  totalSpent: number
  status: "active" | "inactive"
  location: string
  joinedAt: string
}

export interface Supplier {
  id: string
  tenantId: string
  name: string
  email: string
  phone: string
  avatarInitial: string
  totalOrders: number
  totalDue: number
  location: string
  status: "active" | "inactive"
}

export interface Biller {
  id: string
  tenantId: string
  name: string
  email: string
  phone: string
  avatarInitial: string
  salesCount: number
  location: string
  status: "active" | "inactive"
}

export interface Store {
  id: string
  tenantId: string
  name: string
  email: string
  phone: string
  manager: string
  location: string
  status: "active" | "inactive"
}

export interface Warehouse {
  id: string
  tenantId: string
  name: string
  email: string
  phone: string
  contactPerson: string
  location: string
  status: "active" | "inactive"
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  image: string
}

export interface Order {
  id: string
  tenantId: string
  orderNo: string
  customerName: string
  customerAvatar: string
  items: OrderItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: "cash" | "card" | "wallet"
  status: "completed" | "pending" | "cancelled" | "returned"
  biller: string
  store: string
  createdAt: string
}

export interface StockMovement {
  id: string
  tenantId: string
  productId: string
  productName: string
  sku: string
  type: "adjustment" | "transfer"
  fromStore?: string
  toStore?: string
  quantityBefore: number
  quantityChange: number
  quantityAfter: number
  reason: string
  responsible: string
  date: string
}

export interface RevenuePoint {
  label: string
  revenue: number
  expenses: number
}

export interface TopProduct {
  id: string
  name: string
  categoryName: string
  sold: number
  revenue: number
}
