"use client"

import * as React from "react"
import {
  Banknote,
  CreditCard,
  LayoutGrid,
  Loader2,
  Minus,
  Plus,
  QrCode,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { usePosData, useCreateOrder } from "../client/usePos"
import type { PosData } from "../api/pos.action"

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
}

export function PosView({ tenant, initialData }: PosViewProps) {
  const { data } = usePosData(tenant, initialData)
  const { categories, products } = data
  const { mutateAsync: placeOrder, isPending } = useCreateOrder(tenant)

  const [activeCategory, setActiveCategory] = React.useState<string>("all")
  const [search, setSearch] = React.useState("")
  const [cart, setCart] = React.useState<CartLine[]>([])
  const [payment, setPayment] = React.useState<"cash" | "card" | "wallet">("cash")

  const filtered = products.filter((p) => {
    const matchesCategory = activeCategory === "all" || p.categoryId === activeCategory
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  function addToCart(productId: string) {
    const product = products.find((p) => p.id === productId)
    if (!product) return
    setCart((prev) => {
      const existing = prev.find((l) => l.id === productId)
      if (existing) {
        return prev.map((l) => (l.id === productId ? { ...l, qty: l.qty + 1 } : l))
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
              <span className="text-[11px] text-muted-foreground">{products.length} Items</span>
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
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Products</h3>
            <div className="relative w-56">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search Product"
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <button key={p.id} onClick={() => addToCart(p.id)} className="text-left">
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
          </div>
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
