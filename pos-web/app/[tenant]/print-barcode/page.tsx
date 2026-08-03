"use client"

import * as React from "react"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { CategoryIcon } from "@/components/shared/entity-icon"
import { getProducts } from "@/lib/dummy-data"

function BarcodeStripes() {
  const widths = React.useMemo(
    () => Array.from({ length: 28 }, () => (Math.random() > 0.5 ? 2 : 1)),
    []
  )
  return (
    <div className="flex h-10 items-stretch gap-[1px]">
      {widths.map((w, i) => (
        <div key={i} className="bg-foreground" style={{ width: w }} />
      ))}
    </div>
  )
}

export default function PrintBarcodePage() {
  const products = getProducts()
  const [selected, setSelected] = React.useState<string[]>([products[0].id, products[1].id])

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Print Barcode"
        crumbs={[{ label: "Dashboard" }, { label: "Print Barcode" }]}
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
                  <div key={p.id} className="flex flex-col items-center gap-1 rounded-lg border p-3 text-center">
                    <p className="w-full truncate text-xs font-medium">{p.name}</p>
                    <BarcodeStripes />
                    <p className="font-mono text-xs">{p.barcode}</p>
                    <p className="text-xs font-semibold">${p.price}</p>
                  </div>
                ))}
              {selected.length === 0 && (
                <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
                  Select products from the left to preview barcode labels.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
