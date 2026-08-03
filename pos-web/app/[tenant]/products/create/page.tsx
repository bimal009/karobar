import { ImagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/shared/page-header"
import { getBranches, getBrands, getCategories, getUnits, getWarranties } from "@/lib/dummy-data"

export default async function CreateProductPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const categories = getCategories()
  const brands = getBrands()
  const units = getUnits()
  const warranties = getWarranties()
  const branches = getBranches()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Create Product"
        crumbs={[
          { label: "Dashboard", href: `/${tenant}/dashboard` },
          { label: "Products", href: `/${tenant}/products` },
          { label: "Create" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardContent className="flex flex-col gap-4">
              <h3 className="font-semibold">General Information</h3>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="p-name">Product Name</Label>
                <Input id="p-name" placeholder="e.g. iPhone 15 Pro Max" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="p-sku">SKU</Label>
                  <Input id="p-sku" placeholder="APL-IP15PM-256" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="p-barcode">Barcode</Label>
                  <Input id="p-barcode" placeholder="8901234567890" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="p-desc">Description</Label>
                <Textarea id="p-desc" placeholder="Short product description" rows={4} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-4">
              <h3 className="font-semibold">Pricing &amp; Stock</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="p-price">Selling Price</Label>
                  <Input id="p-price" type="number" placeholder="0.00" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="p-cost">Cost Price</Label>
                  <Input id="p-cost" type="number" placeholder="0.00" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="p-qty">Quantity</Label>
                  <Input id="p-qty" type="number" placeholder="0" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <Label>Branch</Label>
                  <Select defaultValue={branches.find((b) => b.isMain)?.id}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Stock quantity is tracked per branch.</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Unit</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Warranty</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select warranty" />
                    </SelectTrigger>
                    <SelectContent>
                      {warranties.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardContent className="flex flex-col gap-4">
              <h3 className="font-semibold">Organization</h3>
              <div className="flex flex-col gap-1.5">
                <Label>Category</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Brand</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-3">
              <h3 className="font-semibold">Product Image</h3>
              <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground">
                <ImagePlus className="size-6" />
                <p className="text-sm">Click to upload</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1">Save Product</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
