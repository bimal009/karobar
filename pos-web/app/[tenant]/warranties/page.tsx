"use client"

import { use } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/shared/icon-button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { getWarranties } from "@/lib/dummy-data"
import type { Warranty } from "@/lib/types"

const columns: DataTableColumn<Warranty>[] = [
  { key: "name", header: "Warranty", render: (w) => <span className="font-medium">{w.name}</span> },
  { key: "duration", header: "Duration", render: (w) => w.duration },
  { key: "description", header: "Description", render: (w) => <span className="text-muted-foreground">{w.description}</span> },
  { key: "status", header: "Status", render: (w) => <StatusBadge status={w.status} /> },
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

export default function WarrantiesPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = use(params)
  const warranties = getWarranties()
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Warranties"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Warranties" }]}
        actions={
          <FormSheet
            trigger={<Button><Plus /> Add Warranty</Button>}
            title="Add Warranty"
            description="Create a new warranty policy to attach to products."
            submitLabel="Add Warranty"
          >
            <FieldRow label="Warranty Name" required htmlFor="w-name">
              <Input id="w-name" placeholder="e.g. 1 Year Warranty" required />
            </FieldRow>
            <FieldRow label="Duration" required htmlFor="w-duration">
              <Input id="w-duration" placeholder="e.g. 12 months" required />
            </FieldRow>
            <FieldRow label="Description" htmlFor="w-desc">
              <Textarea id="w-desc" placeholder="What this warranty covers..." rows={3} />
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
      <DataTable columns={columns} data={warranties} rowKey={(w) => w.id} searchPlaceholder="Search warranties..." getSearchValue={(w) => w.name} />
    </div>
  )
}
