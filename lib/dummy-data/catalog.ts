import type {
  Brand,
  Category,
  Product,
  SubCategory,
  Unit,
  VariantAttribute,
  Warranty,
} from "@/lib/types"

const TENANT = "t1"

export const categories: Category[] = [
  { id: "c1", tenantId: TENANT, name: "Electronics", slug: "electronics", productsCount: 48, status: "active" },
  { id: "c2", tenantId: TENANT, name: "Groceries", slug: "groceries", productsCount: 132, status: "active" },
  { id: "c3", tenantId: TENANT, name: "Furniture", slug: "furniture", productsCount: 26, status: "active" },
  { id: "c4", tenantId: TENANT, name: "Beauty & Health", slug: "beauty-health", productsCount: 63, status: "active" },
  { id: "c5", tenantId: TENANT, name: "Apparel", slug: "apparel", productsCount: 95, status: "active" },
  { id: "c6", tenantId: TENANT, name: "Stationery", slug: "stationery", productsCount: 41, status: "inactive" },
]

export const subCategories: SubCategory[] = [
  { id: "sc1", tenantId: TENANT, categoryId: "c1", categoryName: "Electronics", name: "Mobile Phones", productsCount: 18, status: "active" },
  { id: "sc2", tenantId: TENANT, categoryId: "c1", categoryName: "Electronics", name: "Laptops", productsCount: 12, status: "active" },
  { id: "sc3", tenantId: TENANT, categoryId: "c2", categoryName: "Groceries", name: "Beverages", productsCount: 34, status: "active" },
  { id: "sc4", tenantId: TENANT, categoryId: "c2", categoryName: "Groceries", name: "Snacks", productsCount: 52, status: "active" },
  { id: "sc5", tenantId: TENANT, categoryId: "c5", categoryName: "Apparel", name: "Men's Wear", productsCount: 46, status: "active" },
  { id: "sc6", tenantId: TENANT, categoryId: "c5", categoryName: "Apparel", name: "Women's Wear", productsCount: 49, status: "active" },
]

export const brands: Brand[] = [
  { id: "b1", tenantId: TENANT, name: "Nestle", productsCount: 54, status: "active" },
  { id: "b2", tenantId: TENANT, name: "Samsung", productsCount: 21, status: "active" },
  { id: "b3", tenantId: TENANT, name: "Apple", productsCount: 14, status: "active" },
  { id: "b4", tenantId: TENANT, name: "Nike", productsCount: 32, status: "active" },
  { id: "b5", tenantId: TENANT, name: "IKEA", productsCount: 18, status: "active" },
  { id: "b6", tenantId: TENANT, name: "L'Oreal", productsCount: 27, status: "inactive" },
]

export const units: Unit[] = [
  { id: "un1", tenantId: TENANT, name: "Piece", shortName: "Pc", status: "active" },
  { id: "un2", tenantId: TENANT, name: "Kilogram", shortName: "Kg", status: "active" },
  { id: "un3", tenantId: TENANT, name: "Box", shortName: "Box", status: "active" },
  { id: "un4", tenantId: TENANT, name: "Litre", shortName: "Ltr", status: "active" },
  { id: "un5", tenantId: TENANT, name: "Dozen", shortName: "Dz", status: "active" },
  { id: "un6", tenantId: TENANT, name: "Pack", shortName: "Pack", status: "active" },
]

export const variantAttributes: VariantAttribute[] = [
  { id: "va1", tenantId: TENANT, name: "Color", values: ["Red", "Blue", "Black", "White"], status: "active" },
  { id: "va2", tenantId: TENANT, name: "Size", values: ["S", "M", "L", "XL"], status: "active" },
  { id: "va3", tenantId: TENANT, name: "Storage", values: ["64GB", "128GB", "256GB"], status: "active" },
  { id: "va4", tenantId: TENANT, name: "Material", values: ["Cotton", "Polyester", "Leather"], status: "inactive" },
]

export const warranties: Warranty[] = [
  { id: "w1", tenantId: TENANT, name: "1 Year Warranty", duration: "12 months", description: "Standard manufacturer warranty covering defects", status: "active" },
  { id: "w2", tenantId: TENANT, name: "2 Year Extended", duration: "24 months", description: "Extended warranty with accidental damage cover", status: "active" },
  { id: "w3", tenantId: TENANT, name: "90 Day Warranty", duration: "3 months", description: "Short-term warranty for accessories", status: "active" },
  { id: "w4", tenantId: TENANT, name: "Lifetime Warranty", duration: "Lifetime", description: "Lifetime coverage for premium furniture", status: "inactive" },
]

export const products: Product[] = [
  { id: "p1", tenantId: TENANT, name: "iPhone 15 Pro Max", sku: "APL-IP15PM-256", barcode: "8901234567890", categoryId: "c1", categoryName: "Electronics", brandId: "b3", brandName: "Apple", unit: "Pc", price: 1199, cost: 950, quantity: 42, lowStockThreshold: 10, status: "active", createdAt: "2025-11-02" },
  { id: "p2", tenantId: TENANT, name: "Samsung Galaxy S24", sku: "SAM-GS24-128", barcode: "8901234567891", categoryId: "c1", categoryName: "Electronics", brandId: "b2", brandName: "Samsung", unit: "Pc", price: 899, cost: 690, quantity: 8, lowStockThreshold: 10, status: "active", createdAt: "2025-11-10" },
  { id: "p3", tenantId: TENANT, name: "Nestle KitKat 4 Finger", sku: "NES-KK4F", barcode: "8901234567892", categoryId: "c2", categoryName: "Groceries", brandId: "b1", brandName: "Nestle", unit: "Box", price: 2.5, cost: 1.6, quantity: 560, lowStockThreshold: 100, status: "active", createdAt: "2025-10-28" },
  { id: "p4", tenantId: TENANT, name: "Nike Air Max 270", sku: "NIK-AM270-42", barcode: "8901234567893", categoryId: "c5", categoryName: "Apparel", brandId: "b4", brandName: "Nike", unit: "Pc", price: 150, cost: 95, quantity: 24, lowStockThreshold: 15, status: "active", createdAt: "2025-09-15" },
  { id: "p5", tenantId: TENANT, name: "IKEA MALM Desk", sku: "IKE-MLM-DSK", barcode: "8901234567894", categoryId: "c3", categoryName: "Furniture", brandId: "b5", brandName: "IKEA", unit: "Pc", price: 179, cost: 120, quantity: 6, lowStockThreshold: 5, status: "active", createdAt: "2025-08-20" },
  { id: "p6", tenantId: TENANT, name: "L'Oreal Revitalift Serum", sku: "LOR-RVT-SRM", barcode: "8901234567895", categoryId: "c4", categoryName: "Beauty & Health", brandId: "b6", brandName: "L'Oreal", unit: "Pc", price: 24.99, cost: 14, quantity: 3, lowStockThreshold: 20, status: "active", expiryDate: "2026-09-01", createdAt: "2025-07-11" },
  { id: "p7", tenantId: TENANT, name: "MacBook Air M3", sku: "APL-MBA-M3-13", barcode: "8901234567896", categoryId: "c1", categoryName: "Electronics", brandId: "b3", brandName: "Apple", unit: "Pc", price: 1299, cost: 1050, quantity: 15, lowStockThreshold: 8, status: "active", createdAt: "2025-12-01" },
  { id: "p8", tenantId: TENANT, name: "Samsung 55\" QLED TV", sku: "SAM-QLED-55", barcode: "8901234567897", categoryId: "c1", categoryName: "Electronics", brandId: "b2", brandName: "Samsung", unit: "Pc", price: 799, cost: 610, quantity: 0, lowStockThreshold: 5, status: "active", createdAt: "2025-06-19" },
  { id: "p9", tenantId: TENANT, name: "Nike Dri-FIT T-Shirt", sku: "NIK-DRF-TS-M", barcode: "8901234567898", categoryId: "c5", categoryName: "Apparel", brandId: "b4", brandName: "Nike", unit: "Pc", price: 34.99, cost: 18, quantity: 120, lowStockThreshold: 30, status: "active", createdAt: "2025-05-02" },
  { id: "p10", tenantId: TENANT, name: "Nestle Nescafe Gold 200g", sku: "NES-NCG-200", barcode: "8901234567899", categoryId: "c2", categoryName: "Groceries", brandId: "b1", brandName: "Nestle", unit: "Pc", price: 8.99, cost: 5.5, quantity: 4, lowStockThreshold: 25, status: "active", expiryDate: "2026-08-25", createdAt: "2025-04-14" },
  { id: "p11", tenantId: TENANT, name: "IKEA POÄNG Armchair", sku: "IKE-PONG-CHR", barcode: "8901234567800", categoryId: "c3", categoryName: "Furniture", brandId: "b5", brandName: "IKEA", unit: "Pc", price: 129, cost: 85, quantity: 11, lowStockThreshold: 5, status: "active", createdAt: "2025-03-22" },
  { id: "p12", tenantId: TENANT, name: "L'Oreal Paris Shampoo 400ml", sku: "LOR-SHM-400", barcode: "8901234567801", categoryId: "c4", categoryName: "Beauty & Health", brandId: "b6", brandName: "L'Oreal", unit: "Pc", price: 12.49, cost: 7, quantity: 88, lowStockThreshold: 20, status: "inactive", createdAt: "2025-02-08" },
]

export function getCategories() {
  return categories
}
export function getSubCategories() {
  return subCategories
}
export function getBrands() {
  return brands
}
export function getUnits() {
  return units
}
export function getVariantAttributes() {
  return variantAttributes
}
export function getWarranties() {
  return warranties
}
export function getProducts() {
  return products
}
export function getExpiredProducts() {
  return products.filter((p) => p.expiryDate)
}
export function getLowStockProducts() {
  return products.filter((p) => p.quantity <= p.lowStockThreshold)
}
export function getProductById(id: string) {
  return products.find((p) => p.id === id)
}
