"use client"

import * as React from "react"
import { Printer, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { CategoryIcon } from "@/components/shared/entity-icon"
import { getProducts } from "@/lib/dummy-data"

export default function PrintQrCodePage() {
  const products = getProducts()
  const [selected, setSelected] = React.useState<string[]>([products[0].id, products[1].id])

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Print QR Code"
        crumbs={[{ label: "Dashboard" }, { label: "Print QR Code" }]}
        actions={
          <Button disabled={selected.length === 0}>
            <Printer /> Print Selected
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit">
          <CardContent className="flex flex-col gap-3">
            <Input placeholder="Search products..." />
            <div className="flex max-h-[480px] flex-col gap-1 overflow-y-auto">
              {products.map((p) => (
                <label key={p.id} className="flex items-center gap-2 rounded-md p-2 text-sm hover:bg-muted">
                  <Checkbox checked={selected.includes(p.id)} onCheckedChange={() => toggle(p.id)} />
                  <CategoryIcon categoryName={p.categoryName} className="size-6" iconClassName="size-3" />
                  <span className="flex-1 truncate">{p.name}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h3 className="mb-4 font-semibold">Preview ({selected.length} labels)</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {products
                .filter((p) => selected.includes(p.id))
                .map((p) => (
                  <div key={p.id} className="flex flex-col items-center gap-2 rounded-lg border p-3 text-center">
                    <p className="w-full truncate text-xs font-medium">{p.name}</p>
                    <QrCode className="size-16 text-foreground" strokeWidth={1} />
                    <p className="font-mono text-xs">{p.sku}</p>
                    <p className="text-xs font-semibold">${p.price}</p>
                  </div>
                ))}
              {selected.length === 0 && (
                <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
                  Select products from the left to preview QR labels.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
