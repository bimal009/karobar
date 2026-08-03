"use client"

import { use } from "react"
import { Mail, Pencil, Phone, Plus, Trash2 } from "lucide-react"
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
import { getWarehouses } from "@/lib/dummy-data"
import type { Warehouse } from "@/lib/types"

const columns: DataTableColumn<Warehouse>[] = [
  { key: "name", header: "Warehouse", render: (w) => <span className="font-medium">{w.name}</span> },
  { key: "contact", header: "Contact Person", render: (w) => w.contactPerson },
  { key: "email", header: "Email", render: (w) => <span className="flex items-center gap-1.5"><Mail className="size-3.5 text-muted-foreground" /> {w.email}</span> },
  { key: "phone", header: "Phone", render: (w) => <span className="flex items-center gap-1.5"><Phone className="size-3.5 text-muted-foreground" /> {w.phone}</span> },
  { key: "location", header: "Location", render: (w) => w.location },
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

export default function WarehousesPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = use(params)
  const warehouses = getWarehouses()
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Warehouses"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Warehouses" }]}
        actions={
          <FormSheet
            trigger={<Button><Plus /> Add Warehouse</Button>}
            title="Add Warehouse"
            description="Register a new storage warehouse."
            submitLabel="Add Warehouse"
          >
            <FieldRow label="Warehouse Name" required htmlFor="wh-name">
              <Input id="wh-name" placeholder="e.g. Central Warehouse" required />
            </FieldRow>
            <FieldRow label="Contact Person" required htmlFor="wh-contact">
              <Input id="wh-contact" placeholder="e.g. Michael Scott" required />
            </FieldRow>
            <FieldRow label="Email" required htmlFor="wh-email">
              <Input id="wh-email" type="email" placeholder="warehouse@example.com" required />
            </FieldRow>
            <FieldRow label="Phone" required htmlFor="wh-phone">
              <Input id="wh-phone" placeholder="+1 202-555-0100" required />
            </FieldRow>
            <FieldRow label="Location" htmlFor="wh-location">
              <Input id="wh-location" placeholder="e.g. Industrial Zone, Newark" />
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
      <DataTable columns={columns} data={warehouses} rowKey={(w) => w.id} searchPlaceholder="Search warehouses..." getSearchValue={(w) => `${w.name} ${w.location}`} />
    </div>
  )
}
