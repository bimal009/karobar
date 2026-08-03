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
import { getCategories, getSubCategories } from "@/lib/dummy-data"
import type { SubCategory } from "@/lib/types"

const columns: DataTableColumn<SubCategory>[] = [
  { key: "name", header: "Sub Category", render: (s) => <span className="font-medium">{s.name}</span> },
  { key: "category", header: "Category", render: (s) => s.categoryName },
  { key: "products", header: "Products", render: (s) => s.productsCount },
  { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status} /> },
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

export default function SubCategoriesPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = use(params)
  const subCategories = getSubCategories()
  const categories = getCategories()
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Sub Categories"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Sub Categories" }]}
        actions={
          <FormSheet
            trigger={<Button><Plus /> Add Sub Category</Button>}
            title="Add Sub Category"
            description="Create a new sub category nested under a parent category."
            submitLabel="Add Sub Category"
          >
            <FieldRow label="Sub Category Name" required htmlFor="subcat-name">
              <Input id="subcat-name" placeholder="e.g. Mobile Phones" required />
            </FieldRow>
            <FieldRow label="Parent Category" required>
              <Select required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
      <DataTable columns={columns} data={subCategories} rowKey={(s) => s.id} searchPlaceholder="Search sub categories..." getSearchValue={(s) => `${s.name} ${s.categoryName}`} />
    </div>
  )
}
