"use client"

import { use } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/shared/icon-button"
import { Input } from "@/components/ui/input"
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
import { FormSheet } from "@/components/shared/form-sheet"
import { FieldRow } from "@/components/shared/field-row"
import { getBrands } from "@/lib/dummy-data"
import type { Brand } from "@/lib/types"

const columns: DataTableColumn<Brand>[] = [
  { key: "name", header: "Brand", render: (b) => <span className="font-medium">{b.name}</span> },
  { key: "products", header: "Products", render: (b) => b.productsCount },
  { key: "status", header: "Status", render: (b) => <StatusBadge status={b.status} /> },
  {
    key: "actions",
    header: "",
    className: "text-right",
    render: () => (
      <div className="flex justify-end gap-1">
        <IconButton label="Edit" size="icon-sm" variant="ghost"><Pencil /></IconButton>
        <IconButton label="Delete" size="icon-sm" variant="ghost"><Trash2 className="text-destructive" /></IconButton>
      </div>
    ),
  },
]

export default function BrandsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = use(params)
  const brands = getBrands()
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Brands"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Brands" }]}
        actions={
          <FormSheet
            trigger={<Button><Plus /> Add Brand</Button>}
            title="Add Brand"
            description="Create a new brand to tag your products with."
            submitLabel="Add Brand"
          >
            <FieldRow label="Brand Name" required htmlFor="brand-name">
              <Input id="brand-name" placeholder="e.g. Samsung" required />
            </FieldRow>
            <FieldRow label="Status">
              <Select defaultValue="active">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>
          </FormSheet>
        }
      />
      <DataTable columns={columns} data={brands} rowKey={(b) => b.id} searchPlaceholder="Search brands..." getSearchValue={(b) => b.name} />
    </div>
  )
}
