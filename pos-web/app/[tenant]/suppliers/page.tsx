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
import { getSuppliers } from "@/lib/dummy-data"
import type { Supplier } from "@/lib/types"

const columns: DataTableColumn<Supplier>[] = [
  {
    key: "name",
    header: "Supplier",
    render: (s) => (
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{s.avatarInitial}</div>
        <div>
          <p className="font-medium">{s.name}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="size-3" /> {s.email}</p>
        </div>
      </div>
    ),
  },
  { key: "phone", header: "Phone", render: (s) => <span className="flex items-center gap-1.5"><Phone className="size-3.5 text-muted-foreground" /> {s.phone}</span> },
  { key: "location", header: "Location", render: (s) => s.location },
  { key: "orders", header: "Orders", render: (s) => s.totalOrders },
  { key: "due", header: "Due", render: (s) => (s.totalDue > 0 ? <span className="font-medium text-destructive">${s.totalDue.toLocaleString()}</span> : "$0") },
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

export default function SuppliersPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = use(params)
  const suppliers = getSuppliers()
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Suppliers"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Suppliers" }]}
        actions={
          <FormSheet
            trigger={<Button><Plus /> Add Supplier</Button>}
            title="Add Supplier"
            description="Add a new supplier you purchase inventory from."
            submitLabel="Add Supplier"
          >
            <FieldRow label="Supplier Name" required htmlFor="sup-name">
              <Input id="sup-name" placeholder="e.g. Global Supply Co." required />
            </FieldRow>
            <FieldRow label="Email" required htmlFor="sup-email">
              <Input id="sup-email" type="email" placeholder="supplier@example.com" required />
            </FieldRow>
            <FieldRow label="Phone" required htmlFor="sup-phone">
              <Input id="sup-phone" placeholder="+1 202-555-0100" required />
            </FieldRow>
            <FieldRow label="Location" htmlFor="sup-location">
              <Input id="sup-location" placeholder="e.g. Newark, US" />
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
      <DataTable columns={columns} data={suppliers} rowKey={(s) => s.id} searchPlaceholder="Search suppliers..." getSearchValue={(s) => `${s.name} ${s.email}`} />
    </div>
  )
}
