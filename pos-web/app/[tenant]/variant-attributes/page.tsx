"use client"

import { use } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/shared/icon-button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { getVariantAttributes } from "@/lib/dummy-data"
import type { VariantAttribute } from "@/lib/types"

const columns: DataTableColumn<VariantAttribute>[] = [
  { key: "name", header: "Attribute", render: (v) => <span className="font-medium">{v.name}</span> },
  {
    key: "values",
    header: "Values",
    render: (v) => (
      <div className="flex flex-wrap gap-1">
        {v.values.map((val) => (
          <Badge key={val} variant="outline">{val}</Badge>
        ))}
      </div>
    ),
  },
  { key: "status", header: "Status", render: (v) => <StatusBadge status={v.status} /> },
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

export default function VariantAttributesPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = use(params)
  const variantAttributes = getVariantAttributes()
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Variant Attributes"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Variant Attributes" }]}
        actions={
          <FormSheet
            trigger={<Button><Plus /> Add Attribute</Button>}
            title="Add Variant Attribute"
            description="Define an attribute and its possible values, e.g. Color or Size."
            submitLabel="Add Attribute"
          >
            <FieldRow label="Attribute Name" required htmlFor="va-name">
              <Input id="va-name" placeholder="e.g. Color" required />
            </FieldRow>
            <FieldRow label="Values" required htmlFor="va-values">
              <Input id="va-values" placeholder="e.g. Red, Blue, Black" required />
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
      <DataTable columns={columns} data={variantAttributes} rowKey={(v) => v.id} searchPlaceholder="Search attributes..." getSearchValue={(v) => v.name} />
    </div>
  )
}
