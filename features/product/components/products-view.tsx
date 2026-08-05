"use client"

import Image from "next/image"
import { parseAsString, useQueryStates } from "nuqs"
import { Download, FileSpreadsheet, Pencil, Plus, Trash2, Upload } from "lucide-react"
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
import { DataTable, useDataTableParams, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { toast } from "@/components/ui/toast"
import type { Meta } from "@/lib/common/pagination"
import { formatCurrency } from "@/lib/common/currency"
import { useShell } from "@/components/layout/shell-context"
import { ProductFormSheet } from "./product-form-sheet"
import { emptyProductFormData, useDeleteProduct, useProductFormData, useProducts } from "../client/useProduct"
import type { ProductWithRelations } from "../api/product.action"

const ALL = "all"

interface ProductsViewProps {
  tenant: string
  initialData: { rows: ProductWithRelations[]; meta: Meta }
}

export function ProductsView({ tenant, initialData }: ProductsViewProps) {
  const { currency } = useShell()
  const { data: formData = emptyProductFormData } = useProductFormData(tenant)
  const { mutateAsync: deleteProduct, isPending: isDeleting } = useDeleteProduct(tenant)

  const [{ category: categoryFilter, brand: brandFilter }, setFilters] = useQueryStates({
    category: parseAsString.withDefault(ALL),
    brand: parseAsString.withDefault(ALL),
  })
  const [{ q, page, pageSize, sortBy, sortOrder }] = useDataTableParams()

  const { data, isFetching } = useProducts(
    tenant,
    {
      search: q || undefined,
      page,
      limit: pageSize,
      sortBy: sortBy || undefined,
      sortOrder,
      categoryId: categoryFilter === ALL ? undefined : categoryFilter,
      brandId: brandFilter === ALL ? undefined : brandFilter,
    },
    initialData
  )
  const products = data?.rows ?? []
  const total = data?.meta.total ?? 0

  async function handleDelete(id: string) {
    const result = await deleteProduct(id)
    if (!result.error) {
      toast.add({ title: "Product deleted", type: "success" })
    } else {
      toast.add({ title: "Failed to delete product", description: result.message, type: "error" })
    }
    return !result.error
  }

  const columns: DataTableColumn<ProductWithRelations>[] = [
    { key: "sku", header: "SKU", render: (p) => <span className="font-medium">{p.sku}</span> },
    {
      key: "name",
      header: "Product Name",
      sortKey: "name",
      render: (p) => (
        <div className="flex items-center gap-3">
          {p.image && (
            <Image
              src={p.image}
              alt={p.name}
              width={36}
              height={36}
              className="size-9 shrink-0 rounded-lg object-cover"
            />
          )}
          <span className="font-medium">{p.name}</span>
        </div>
      ),
    },
    { key: "category", header: "Category", render: (p) => p.category?.name ?? "—" },
    { key: "brand", header: "Brand", render: (p) => p.brand?.name ?? "—" },
    { key: "price", header: "Price", sortKey: "price", render: (p) => formatCurrency(Number(p.price), currency) },
    { key: "unit", header: "Unit", render: (p) => p.unit?.shortName ?? "—" },
    {
      key: "qty",
      header: "Qty",
      sortKey: "quantity",
      render: (p) => (
        <span className={p.quantity <= p.lowStockThreshold ? "font-medium text-destructive" : ""}>
          {p.quantity}
        </span>
      ),
    },
    { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (p) => (
        <div className="flex justify-end gap-1">
          <ProductFormSheet
            tenant={tenant}
            data={formData}
            product={p}
            trigger={
              <IconButton label="Edit" size="icon-sm" variant="ghost">
                <Pencil />
              </IconButton>
            }
          />
          <ConfirmDeleteDialog
            trigger={
              <IconButton label="Delete" size="icon-sm" variant="ghost">
                <Trash2 className="text-destructive" />
              </IconButton>
            }
            title={`Delete "${p.name}"?`}
            description="This action cannot be undone."
            isPending={isDeleting}
            onConfirm={() => handleDelete(p.id)}
          />
        </div>
      ),
    },
  ]

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
            <ProductFormSheet
              tenant={tenant}
              data={formData}
              trigger={
                <Button>
                  <Plus /> Add Product
                </Button>
              }
            />
            <Button variant="secondary">
              <Upload /> Import
            </Button>
          </>
        }
      />
      <DataTable
        columns={columns}
        data={products}
        total={total}
        isLoading={isFetching}
        rowKey={(p) => p.id}
        searchPlaceholder="Search products..."
        filters={
          <>
            <Select
              items={[
                { value: ALL, label: "Category" },
                ...formData.categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
              value={categoryFilter}
              onValueChange={(value) => setFilters({ category: value === ALL ? null : value })}
            >
              <SelectTrigger size="sm" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Category</SelectItem>
                {formData.categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              items={[
                { value: ALL, label: "Brand" },
                ...formData.brands.map((b) => ({ value: b.id, label: b.name })),
              ]}
              value={brandFilter}
              onValueChange={(value) => setFilters({ brand: value === ALL ? null : value })}
            >
              <SelectTrigger size="sm" className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Brand</SelectItem>
                {formData.brands.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />
    </div>
  )
}
