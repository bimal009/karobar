import type { Order, RevenuePoint, TopProduct } from "@/lib/types"

const TENANT = "t1"

export const orders: Order[] = [
  {
    id: "o1", tenantId: TENANT, orderNo: "INV-20260731-001", customerName: "Robert Fox", customerAvatar: "R",
    items: [{ productId: "p1", productName: "iPhone 15 Pro Max", quantity: 1, price: 1199, image: "📱" }],
    subtotal: 1199, discount: 20, tax: 94.32, total: 1273.32, paymentMethod: "card", status: "completed", biller: "Olivia Brown", store: "Downtown Store", createdAt: "2026-07-31T14:22:00",
  },
  {
    id: "o2", tenantId: TENANT, orderNo: "INV-20260731-002", customerName: "Jenny Wilson", customerAvatar: "J",
    items: [
      { productId: "p9", productName: "Nike Dri-FIT T-Shirt", quantity: 3, price: 34.99, image: "👕" },
      { productId: "p4", productName: "Nike Air Max 270", quantity: 1, price: 150, image: "👟" },
    ],
    subtotal: 254.97, discount: 10, tax: 19.6, total: 264.57, paymentMethod: "cash", status: "completed", biller: "Noah Wilson", store: "Mall Outlet", createdAt: "2026-07-31T11:05:00",
  },
  {
    id: "o3", tenantId: TENANT, orderNo: "INV-20260730-014", customerName: "Cody Fisher", customerAvatar: "C",
    items: [{ productId: "p3", productName: "Nestle KitKat 4 Finger", quantity: 12, price: 2.5, image: "🍫" }],
    subtotal: 30, discount: 0, tax: 2.4, total: 32.4, paymentMethod: "wallet", status: "pending", biller: "Ava Martinez", store: "Downtown Store", createdAt: "2026-07-30T18:40:00",
  },
  {
    id: "o4", tenantId: TENANT, orderNo: "INV-20260730-013", customerName: "Esther Howard", customerAvatar: "E",
    items: [{ productId: "p7", productName: "MacBook Air M3", quantity: 1, price: 1299, image: "💻" }],
    subtotal: 1299, discount: 50, tax: 99.92, total: 1348.92, paymentMethod: "card", status: "completed", biller: "Olivia Brown", store: "Downtown Store", createdAt: "2026-07-30T16:12:00",
  },
  {
    id: "o5", tenantId: TENANT, orderNo: "INV-20260729-009", customerName: "Devon Lane", customerAvatar: "D",
    items: [{ productId: "p8", productName: 'Samsung 55" QLED TV', quantity: 1, price: 799, image: "📺" }],
    subtotal: 799, discount: 0, tax: 63.92, total: 862.92, paymentMethod: "card", status: "cancelled", biller: "Noah Wilson", store: "Mall Outlet", createdAt: "2026-07-29T09:50:00",
  },
  {
    id: "o6", tenantId: TENANT, orderNo: "INV-20260729-008", customerName: "Kristin Watson", customerAvatar: "K",
    items: [{ productId: "p12", productName: "L'Oreal Paris Shampoo 400ml", quantity: 2, price: 12.49, image: "🧴" }],
    subtotal: 24.98, discount: 0, tax: 2.0, total: 26.98, paymentMethod: "cash", status: "returned", biller: "Ava Martinez", store: "Downtown Store", createdAt: "2026-07-29T08:15:00",
  },
  {
    id: "o7", tenantId: TENANT, orderNo: "INV-20260728-004", customerName: "Robert Fox", customerAvatar: "R",
    items: [{ productId: "p11", productName: "IKEA POÄNG Armchair", quantity: 2, price: 129, image: "🛋️" }],
    subtotal: 258, discount: 0, tax: 20.64, total: 278.64, paymentMethod: "card", status: "completed", biller: "Liam Anderson", store: "Airport Kiosk", createdAt: "2026-07-28T13:30:00",
  },
]

export const revenueSeries: RevenuePoint[] = [
  { label: "Jan", revenue: 42000, expenses: 28000 },
  { label: "Feb", revenue: 38500, expenses: 26500 },
  { label: "Mar", revenue: 51200, expenses: 31000 },
  { label: "Apr", revenue: 47800, expenses: 29800 },
  { label: "May", revenue: 55600, expenses: 33200 },
  { label: "Jun", revenue: 61200, expenses: 35400 },
  { label: "Jul", revenue: 58940, expenses: 34100 },
]

export const topProducts: TopProduct[] = [
  { id: "p1", name: "iPhone 15 Pro Max", categoryName: "Electronics", sold: 214, revenue: 256586 },
  { id: "p7", name: "MacBook Air M3", categoryName: "Electronics", sold: 96, revenue: 124704 },
  { id: "p4", name: "Nike Air Max 270", categoryName: "Apparel", sold: 340, revenue: 51000 },
  { id: "p9", name: "Nike Dri-FIT T-Shirt", categoryName: "Apparel", sold: 512, revenue: 17915 },
  { id: "p3", name: "Nestle KitKat 4 Finger", categoryName: "Groceries", sold: 4820, revenue: 12050 },
]

export function getOrders() { return orders }
export function getRevenueSeries() { return revenueSeries }
export function getTopProducts() { return topProducts }
