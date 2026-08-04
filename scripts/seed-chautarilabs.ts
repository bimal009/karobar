import { config } from "dotenv"
config({ path: ".env" })

import { eq } from "drizzle-orm"

const STORE_SLUG = "chautarilabs"

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

async function main() {
  const { default: db } = await import("../lib/database/db")
  const {
    store,
    branch,
    category,
    brand,
    unit,
    warranty,
    product,
    customer,
    supplier,
    order,
    orderItem,
  } = await import("../lib/database/schemas")

  const [storeRow] = await db.select().from(store).where(eq(store.slug, STORE_SLUG)).limit(1)
  if (!storeRow) {
    throw new Error(`Store with slug "${STORE_SLUG}" not found. Create it first via /stores.`)
  }
  const storeId = storeRow.id
  console.log(`Seeding data for store "${storeRow.name}" (${storeId})`)

  let [mainBranch] = await db.select().from(branch).where(eq(branch.storeId, storeId)).limit(1)
  if (!mainBranch) {
    ;[mainBranch] = await db
      .insert(branch)
      .values({
        storeId,
        name: "Main Branch",
        code: "MAIN",
        isMain: true,
        status: "active",
      })
      .returning()
  }

  const categoryDefs = [
    { name: "Electronics", slug: "electronics" },
    { name: "Groceries", slug: "groceries" },
    { name: "Apparel", slug: "apparel" },
    { name: "Home & Living", slug: "home-living" },
  ]
  await db.insert(category).values(categoryDefs.map((c) => ({ ...c, storeId }))).onConflictDoNothing()
  const categories = await db.select().from(category).where(eq(category.storeId, storeId))

  const brandDefs = ["Samsung", "Apple", "Nestle", "Nike", "IKEA"]
  await db.insert(brand).values(brandDefs.map((name) => ({ name, storeId }))).onConflictDoNothing()
  const brands = await db.select().from(brand).where(eq(brand.storeId, storeId))

  const unitDefs = [
    { name: "Piece", shortName: "pc" },
    { name: "Kilogram", shortName: "kg" },
    { name: "Box", shortName: "box" },
  ]
  await db.insert(unit).values(unitDefs.map((u) => ({ ...u, storeId }))).onConflictDoNothing()
  const units = await db.select().from(unit).where(eq(unit.storeId, storeId))

  const warrantyDefs = [
    { name: "6 Months", duration: "6 months" },
    { name: "1 Year", duration: "12 months" },
  ]
  await db.insert(warranty).values(warrantyDefs.map((w) => ({ ...w, storeId }))).onConflictDoNothing()
  const warranties = await db.select().from(warranty).where(eq(warranty.storeId, storeId))

  const productDefs = [
    { name: "Galaxy S24", sku: "SAM-S24", price: 899, cost: 650, categorySlug: "electronics", brandName: "Samsung" },
    { name: "iPhone 15", sku: "APL-IP15", price: 999, cost: 750, categorySlug: "electronics", brandName: "Apple" },
    { name: "AirPods Pro", sku: "APL-APP", price: 249, cost: 150, categorySlug: "electronics", brandName: "Apple" },
    { name: "Galaxy Buds", sku: "SAM-GB", price: 129, cost: 70, categorySlug: "electronics", brandName: "Samsung" },
    { name: "Instant Coffee 200g", sku: "NES-IC200", price: 12, cost: 7, categorySlug: "groceries", brandName: "Nestle" },
    { name: "Chocolate Bar 100g", sku: "NES-CB100", price: 4, cost: 2, categorySlug: "groceries", brandName: "Nestle" },
    { name: "Running Shoes", sku: "NIKE-RS", price: 120, cost: 65, categorySlug: "apparel", brandName: "Nike" },
    { name: "Sports T-Shirt", sku: "NIKE-TS", price: 35, cost: 15, categorySlug: "apparel", brandName: "Nike" },
    { name: "Office Chair", sku: "IKEA-OC", price: 180, cost: 100, categorySlug: "home-living", brandName: "IKEA" },
    { name: "Study Desk", sku: "IKEA-SD", price: 220, cost: 130, categorySlug: "home-living", brandName: "IKEA" },
    { name: "Bookshelf", sku: "IKEA-BS", price: 95, cost: 50, categorySlug: "home-living", brandName: "IKEA" },
    { name: "4K Monitor", sku: "SAM-MON4K", price: 349, cost: 220, categorySlug: "electronics", brandName: "Samsung" },
  ]

  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]))
  const brandByName = new Map(brands.map((b) => [b.name, b]))

  await db
    .insert(product)
    .values(
      productDefs.map((p, i) => ({
        storeId,
        name: p.name,
        sku: p.sku,
        categoryId: categoryBySlug.get(p.categorySlug)!.id,
        brandId: brandByName.get(p.brandName)!.id,
        unitId: units[i % units.length].id,
        warrantyId: i % 3 === 0 ? warranties[0].id : null,
        price: String(p.price),
        cost: String(p.cost),
        quantity: randomInt(3, 120),
        lowStockThreshold: 10,
        status: "active" as const,
      }))
    )
    .onConflictDoNothing()
  const products = await db.select().from(product).where(eq(product.storeId, storeId))

  const [existingOrder] = await db.select({ id: order.id }).from(order).where(eq(order.storeId, storeId)).limit(1)
  if (existingOrder) {
    console.log("Orders already exist for this store — skipping customers/suppliers/orders to avoid duplicates.")
    console.log(`Catalog ensured: ${categories.length} categories, ${brands.length} brands, ${products.length} products.`)
    return
  }

  const customerDefs = [
    { name: "Ramesh Sharma", email: "ramesh@example.com", location: "Kathmandu" },
    { name: "Sita Gurung", email: "sita@example.com", location: "Pokhara" },
    { name: "Hari Thapa", email: "hari@example.com", location: "Lalitpur" },
    { name: "Gita Rai", email: "gita@example.com", location: "Bhaktapur" },
    { name: "Bikash Shrestha", email: "bikash@example.com", location: "Kathmandu" },
    { name: "Anita Karki", email: "anita@example.com", location: "Pokhara" },
  ]
  const customers = await db.insert(customer).values(customerDefs.map((c) => ({ ...c, storeId }))).returning()

  const supplierDefs = [
    { name: "Global Electronics Supply", email: "sales@geselectronics.com", totalDue: "1250.00" },
    { name: "Nestle Distribution Nepal", email: "orders@nestlenepal.com", totalDue: "0.00" },
    { name: "IKEA Wholesale", email: "wholesale@ikea.com", totalDue: "430.50" },
  ]
  await db.insert(supplier).values(supplierDefs.map((s) => ({ ...s, storeId })))

  const paymentMethods = ["cash", "card", "wallet"] as const
  const statuses: Array<"completed" | "completed" | "completed" | "pending" | "returned"> = [
    "completed",
    "completed",
    "completed",
    "pending",
    "returned",
  ]

  let orderCounter = 1
  for (let day = 45; day >= 0; day--) {
    const ordersToday = randomInt(0, 3)
    for (let i = 0; i < ordersToday; i++) {
      const itemCount = randomInt(1, 3)
      const chosenProducts = [...products].sort(() => Math.random() - 0.5).slice(0, itemCount)

      let subtotal = 0
      const items = chosenProducts.map((p) => {
        const qty = randomInt(1, 4)
        const price = Number(p.price)
        subtotal += qty * price
        return { productId: p.id, productName: p.name, quantity: qty, price: String(price) }
      })

      const tax = Math.round(subtotal * 0.08 * 100) / 100
      const total = subtotal + tax

      const [createdOrder] = await db
        .insert(order)
        .values({
          storeId,
          orderNo: `INV-${String(orderCounter).padStart(5, "0")}`,
          customerId: Math.random() > 0.15 ? customers[randomInt(0, customers.length - 1)].id : null,
          branchId: mainBranch.id,
          subtotal: String(subtotal),
          discount: "0",
          tax: String(tax),
          total: String(total),
          paymentMethod: paymentMethods[randomInt(0, paymentMethods.length - 1)],
          status: statuses[randomInt(0, statuses.length - 1)],
          createdAt: daysAgo(day),
        })
        .returning()

      await db.insert(orderItem).values(items.map((it) => ({ ...it, orderId: createdOrder.id })))
      orderCounter++
    }
  }

  console.log(`Seed complete: ${categories.length} categories, ${brands.length} brands, ${products.length} products, ${customers.length} customers, ${orderCounter - 1} orders.`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
