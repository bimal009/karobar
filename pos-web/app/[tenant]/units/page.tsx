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
import { getUnits } from "@/lib/dummy-data"
import type { Unit } from "@/lib/types"

const columns: DataTableColumn<Unit>[] = [
  { key: "name", header: "Unit", render: (u) => <span className="font-medium">{u.name}</span> },
  { key: "short", header: "Short Name", render: (u) => u.shortName },
  { key: "status", header: "Status", render: (u) => <StatusBadge status={u.status} /> },
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

export default function UnitsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = use(params)
  const units = getUnits()
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Units"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Units" }]}
        actions={
          <FormSheet
            trigger={<Button><Plus /> Add Unit</Button>}
            title="Add Unit"
            description="Create a new measurement unit for your products."
            submitLabel="Add Unit"
          >
            <FieldRow label="Unit Name" required htmlFor="unit-name">
              <Input id="unit-name" placeholder="e.g. Kilogram" required />
            </FieldRow>
            <FieldRow label="Short Name" required htmlFor="unit-short">
              <Input id="unit-short" placeholder="e.g. Kg" required />
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
      <DataTable columns={columns} data={units} rowKey={(u) => u.id} searchPlaceholder="Search units..." getSearchValue={(u) => u.name} />
    </div>
  )
}
