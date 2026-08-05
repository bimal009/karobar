"use client"

import * as React from "react"
import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  LayoutGrid,
  Loader2,
  Minus,
  Plus,
  QrCode,
  Search,
  ShoppingCart,
  Trash2,
  User,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import type { Meta, SortOrder } from "@/lib/common/pagination"
import { usePosData, usePosProducts, useCreateOrder } from "../client/usePos"
import type { PosData, PosProduct } from "../api/pos.action"

interface CartLine {
  id: string
  name: string
  categoryName: string
  price: number
  qty: number
}

interface PosViewProps {
  tenant: string
  initialData: PosData
  initialProducts: { rows: PosProduct[]; meta: Meta }
}

const NONE = "none"
const PAGE_SIZE = 24

export function PosView({ tenant, initialData, initialProducts }: PosViewProps) {
  const { data } = usePosData(tenant, initialData)
  const { categories, customers } = data
  const { mutateAsync: placeOrder, isPending } = useCreateOrder(tenant)

  const [activeCategory, setActiveCategory] = React.useState<string>("all")
  const [searchInput, setSearchInput] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [sortBy, setSortBy] = React.useState<"name" | "price" | "quantity">("name")
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("asc")
  const [cart, setCart] = React.useState<CartLine[]>([])
  const [payment, setPayment] = React.useState<"cash" | "card" | "wallet">("cash")
  const [customerId, setCustomerId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchInput), 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  React.useEffect(() => {
    setPage(1)
  }, [debouncedSearch, activeCategory, sortBy, sortOrder])

  const isDefaultQuery =
    debouncedSearch === "" && activeCategory === "all" && page === 1 && sortBy === "name" && sortOrder === "asc"
  const { data: productsData, isFetching: isSearching } = usePosProducts(
    tenant,
    { search: debouncedSearch || undefined, categoryId: activeCategory, page, limit: PAGE_SIZE, sortBy, sortOrder },
    isDefaultQuery ? initialProducts : undefined
  )
  const products = productsData?.rows ?? []
  const total = productsData?.meta.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const selectedCustomer = customers.find((c) => c.id === customerId) ?? null

  function addToCart(product: PosProduct) {
    setCart((prev) => {
      const existing = prev.find((l) => l.id === product.id)
      if (existing) {
        return prev.map((l) => (l.id === product.id ? { ...l, qty: l.qty + 1 } : l))
      }
      return [...prev, { id: product.id, name: product.name, categoryName: product.categoryName, price: product.price, qty: 1 }]
    })
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => (l.id === id ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0)
    )
  }

  function removeLine(id: string) {
    setCart((prev) => prev.filter((l) => l.id !== id))
  }

  const subtotal = cart.reduce((sum, l) => sum + l.price * l.qty, 0)
  const tax = subtotal * 0.08
  const grandTotal = subtotal + tax

  async function handleCompleteSale() {
    if (cart.length === 0) return

    const promise = placeOrder({
      paymentMethod: payment,
      customerId: customerId ?? undefined,
      items: cart.map((l) => ({ productId: l.id, productName: l.name, quantity: l.qty, price: l.price })),
      subtotal,
      discount: 0,
      tax,
      total: grandTotal,
    }).then((res) => {
      if (res.error) throw new Error(res.message)
      return res
    })

    toast.promise(promise, {
      loading: { title: "Processing sale...", type: "loading" },
      success: { title: "Sale completed", description: "Order placed successfully!", type: "success" },
      error: (err: Error) => ({ title: "Sale failed", description: err.message, type: "error" }),
    })

    try {
      await promise
      setCart([])
      setCustomerId(null)
    } catch {
      // toast already surfaced the error
    }
  }

  return (
    <div className="grid h-[calc(100vh-4rem)] grid-cols-1 gap-0 lg:grid-cols-[1fr_380px]">
      <div className="flex flex-col gap-4 overflow-y-auto p-4 md:p-6">
        <div>
          <h3 className="mb-3 font-semibold">Categories</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={cn(
                "flex w-28 shrink-0 flex-col items-center gap-1 rounded-lg border p-3 text-center transition-colors",
                activeCategory === "all" ? "border-primary bg-primary/5" : "hover:bg-muted"
              )}
            >
              <LayoutGrid className="size-6" />
              <span className="text-xs font-medium">All Categories</span>
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={cn(
                  "flex w-28 shrink-0 flex-col items-center gap-1 rounded-lg border p-3 text-center transition-colors",
                  activeCategory === c.id ? "border-primary bg-primary/5" : "hover:bg-muted"
                )}
              >
                <span className="text-xs font-medium">{c.name}</span>
                <span className="text-[11px] text-muted-foreground">{c.productsCount} Items</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold">Products</h3>
            <div className="flex items-center gap-2">
              <Select
                items={[
                  { value: "name:asc", label: "Name A-Z" },
                  { value: "name:desc", label: "Name Z-A" },
                  { value: "price:asc", label: "Price: Low-High" },
                  { value: "price:desc", label: "Price: High-Low" },
                  { value: "quantity:desc", label: "Stock: High-Low" },
                  { value: "quantity:asc", label: "Stock: Low-High" },
                ]}
                value={`${sortBy}:${sortOrder}`}
                onValueChange={(value) => {
                  if (!value) return
                  const [nextSortBy, nextSortOrder] = value.split(":") as [typeof sortBy, SortOrder]
                  setSortBy(nextSortBy)
                  setSortOrder(nextSortOrder)
                }}
              >
                <SelectTrigger size="sm" className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name:asc">Name A-Z</SelectItem>
                  <SelectItem value="name:desc">Name Z-A</SelectItem>
                  <SelectItem value="price:asc">Price: Low-High</SelectItem>
                  <SelectItem value="price:desc">Price: High-Low</SelectItem>
                  <SelectItem value="quantity:desc">Stock: High-Low</SelectItem>
                  <SelectItem value="quantity:asc">Stock: Low-High</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-56">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search Product"
                  className="pl-8"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {isSearching ? (
              Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[74px] rounded-lg" />)
            ) : (
              <>
                {products.map((p) => (
                  <button key={p.id} onClick={() => addToCart(p)} className="text-left">
                    <Card className="gap-2 p-3 transition-shadow hover:shadow-md">
                      <div>
                        <p className="text-xs text-muted-foreground">{p.categoryName}</p>
                        <p className="truncate text-sm font-medium">{p.name}</p>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-primary">{p.quantity} Pcs</span>
                        <span className="font-semibold">${p.price}</span>
                      </div>
                    </Card>
                  </button>
                ))}
                {products.length === 0 && (
                  <p className="col-span-full py-10 text-center text-sm text-muted-foreground">No products found.</p>
                )}
              </>
            )}
          </div>
          {!isSearching && products.length > 0 && (
            <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Page {page} of {totalPages} · {total} products
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t bg-card p-4 lg:border-t-0 lg:border-l">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Order List</h3>
            <p className="text-xs text-muted-foreground">{cart.length} item(s)</p>
          </div>
          <Button size="icon-sm" variant="ghost" aria-label="Clear order" onClick={() => setCart([])} disabled={cart.length === 0}>
            <Trash2 className="text-destructive" />
          </Button>
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-semibold">Customer</p>
          {selectedCustomer ? (
            <div className="flex items-center justify-between gap-2 rounded-lg border p-2">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{selectedCustomer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedCustomer.phone ?? selectedCustomer.email ?? "No contact info"}
                  </p>
                </div>
              </div>
              <Button size="icon-xs" variant="ghost" aria-label="Remove customer" onClick={() => setCustomerId(null)}>
                <X />
              </Button>
            </div>
          ) : (
            <Select
              items={[
                { value: NONE, label: "Walk-in customer" },
                ...customers.map((c) => ({ value: c.id, label: c.name })),
              ]}
              value={NONE}
              onValueChange={(value) => setCustomerId(value === NONE ? null : value)}
            >
              <SelectTrigger className="w-full">
                <User className="size-4 text-muted-foreground" />
                <SelectValue placeholder="Walk-in customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Walk-in customer</SelectItem>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>
              Product Added <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">{cart.length}</span>
            </span>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} className="text-xs text-destructive">
                Clear all
              </button>
            )}
          </div>
          {cart.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
              <ShoppingCart className="size-8" />
              <p className="text-sm">No Products Selected</p>
            </div>
          ) : (
            cart.map((line) => (
              <div key={line.id} className="flex items-center gap-2 rounded-lg border p-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{line.name}</p>
                  <p className="text-xs text-muted-foreground">${line.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon-xs" variant="outline" onClick={() => updateQty(line.id, -1)}>
                    <Minus />
                  </Button>
                  <span className="w-5 text-center text-sm">{line.qty}</span>
                  <Button size="icon-xs" variant="outline" onClick={() => updateQty(line.id, 1)}>
                    <Plus />
                  </Button>
                </div>
                <Button size="icon-xs" variant="ghost" onClick={() => removeLine(line.id)} aria-label="Remove">
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col gap-3 border-t pt-3">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          <p className="text-sm font-semibold">Payment Method</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setPayment("cash")}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border p-2 text-xs font-medium",
                payment === "cash" ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground"
              )}
            >
              <Banknote className="size-4" /> Cash
            </button>
            <button
              onClick={() => setPayment("card")}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border p-2 text-xs font-medium",
                payment === "card" ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground"
              )}
            >
              <CreditCard className="size-4" /> Card
            </button>
            <button
              onClick={() => setPayment("wallet")}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border p-2 text-xs font-medium",
                payment === "wallet" ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground"
              )}
            >
              <QrCode className="size-4" /> Wallet
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-zinc-900 px-4 py-3 text-white dark:bg-zinc-950">
            <span className="text-sm">Grand Total</span>
            <span className="font-bold">${grandTotal.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="destructive" onClick={() => setCart([])} disabled={cart.length === 0 || isPending}>
              Void
            </Button>
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-600/90"
              disabled={cart.length === 0 || isPending}
              onClick={handleCompleteSale}
            >
              {isPending && <Loader2 className="animate-spin" />}
              Complete Sale
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
