"use client"

import { use } from "react"
import Link from "next/link"
import { Download, Eye, FileSpreadsheet, Pencil, Plus, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/shared/icon-button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { CategoryIcon } from "@/components/shared/entity-icon"
import { getProducts } from "@/lib/dummy-data"
import type { Product } from "@/lib/types"

const columns: DataTableColumn<Product>[] = [
  { key: "sku", header: "SKU", render: (p) => <span className="font-medium">{p.sku}</span> },
  {
    key: "name",
    header: "Product Name",
    render: (p) => (
      <div className="flex items-center gap-3">
        <CategoryIcon categoryName={p.categoryName} />
        <span className="font-medium">{p.name}</span>
      </div>
    ),
  },
  { key: "category", header: "Category", render: (p) => p.categoryName },
  { key: "brand", header: "Brand", render: (p) => p.brandName },
  { key: "price", header: "Price", render: (p) => `$${p.price}` },
  { key: "unit", header: "Unit", render: (p) => p.unit },
  {
    key: "qty",
    header: "Qty",
    render: (p) => (
      <span className={p.quantity <= p.lowStockThreshold ? "font-medium text-destructive" : ""}>{p.quantity}</span>
    ),
  },
  { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
  {
    key: "actions",
    header: "",
    className: "text-right",
    render: () => (
      <div className="flex justify-end gap-1">
        <IconButton label="View" size="icon-sm" variant="ghost">
          <Eye />
          </IconButton>
        <IconButton label="Edit" size="icon-sm" variant="ghost">
          <Pencil />
          </IconButton>
        <IconButton label="Delete" size="icon-sm" variant="ghost">
          <Trash2 className="text-destructive" />
          </IconButton>
      </div>
    ),
  },
]

export default function ProductsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = use(params)
  const products = getProducts()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Products"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Products" }]}
        actions={
          <>
            <IconButton label="Export PDF" variant="outline" size="icon">
              <Download />
            </IconButton>
            <IconButton label="Export Excel" variant="outline" size="icon">
              <FileSpreadsheet />
            </IconButton>
            <Button render={<Link href={`/${tenant}/products/create`} />}>
              <Plus /> Add Product
            </Button>
            <Button variant="secondary">
              <Upload /> Import
            </Button>
          </>
        }
      />
      <DataTable
        columns={columns}
        data={products}
        rowKey={(p) => p.id}
        searchPlaceholder="Search products..."
        getSearchValue={(p) => `${p.name} ${p.sku} ${p.categoryName} ${p.brandName}`}
        filters={
          <>
            <Select defaultValue="all">
              <SelectTrigger size="sm" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Category</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="groceries">Groceries</SelectItem>
                <SelectItem value="apparel">Apparel</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger size="sm" className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Brand</SelectItem>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="samsung">Samsung</SelectItem>
                <SelectItem value="nike">Nike</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />
    </div>
  )
}
