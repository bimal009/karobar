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
import { CategoryIcon } from "@/components/shared/entity-icon"
import { FormSheet } from "@/components/shared/form-sheet"
import { FieldRow } from "@/components/shared/field-row"
import { getCategories } from "@/lib/dummy-data"
import type { Category } from "@/lib/types"

const columns: DataTableColumn<Category>[] = [
  {
    key: "name",
    header: "Category",
    render: (c) => (
      <div className="flex items-center gap-3">
        <CategoryIcon categoryName={c.name} />
        <span className="font-medium">{c.name}</span>
      </div>
    ),
  },
  { key: "slug", header: "Slug", render: (c) => <span className="text-muted-foreground">/{c.slug}</span> },
  { key: "products", header: "Products", render: (c) => c.productsCount },
  { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
  {
    key: "actions",
    header: "",
    className: "text-right",
    render: () => (
      <div className="flex justify-end gap-1">
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

export default function CategoriesPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = use(params)
  const categories = getCategories()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Categories"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Categories" }]}
        actions={
          <FormSheet
            trigger={
              <Button>
                <Plus /> Add Category
              </Button>
            }
            title="Add Category"
            description="Create a new product category for this store."
            submitLabel="Add Category"
          >
            <FieldRow label="Category Name" required htmlFor="cat-name">
              <Input id="cat-name" placeholder="e.g. Electronics" required />
            </FieldRow>
            <FieldRow label="Slug" htmlFor="cat-slug">
              <Input id="cat-slug" placeholder="e.g. electronics" />
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
      <DataTable
        columns={columns}
        data={categories}
        rowKey={(c) => c.id}
        searchPlaceholder="Search categories..."
        getSearchValue={(c) => c.name}
      />
    </div>
  )
}
