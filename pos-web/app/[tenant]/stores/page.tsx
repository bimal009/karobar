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
import { getStores } from "@/lib/dummy-data"
import type { Store } from "@/lib/types"

const columns: DataTableColumn<Store>[] = [
  { key: "name", header: "Store", render: (s) => <span className="font-medium">{s.name}</span> },
  { key: "manager", header: "Manager", render: (s) => s.manager },
  { key: "email", header: "Email", render: (s) => <span className="flex items-center gap-1.5"><Mail className="size-3.5 text-muted-foreground" /> {s.email}</span> },
  { key: "phone", header: "Phone", render: (s) => <span className="flex items-center gap-1.5"><Phone className="size-3.5 text-muted-foreground" /> {s.phone}</span> },
  { key: "location", header: "Location", render: (s) => s.location },
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

export default function StoresPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = use(params)
  const stores = getStores()
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Stores"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Stores" }]}
        actions={
          <FormSheet
            trigger={<Button><Plus /> Add Store</Button>}
            title="Add Store"
            description="Register a new physical store location."
            submitLabel="Add Store"
          >
            <FieldRow label="Store Name" required htmlFor="store-name">
              <Input id="store-name" placeholder="e.g. Downtown Store" required />
            </FieldRow>
            <FieldRow label="Manager" required htmlFor="store-manager">
              <Input id="store-manager" placeholder="e.g. James Carter" required />
            </FieldRow>
            <FieldRow label="Email" required htmlFor="store-email">
              <Input id="store-email" type="email" placeholder="store@example.com" required />
            </FieldRow>
            <FieldRow label="Phone" required htmlFor="store-phone">
              <Input id="store-phone" placeholder="+1 202-555-0100" required />
            </FieldRow>
            <FieldRow label="Location" htmlFor="store-location">
              <Input id="store-location" placeholder="e.g. 5th Avenue, New York" />
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
      <DataTable columns={columns} data={stores} rowKey={(s) => s.id} searchPlaceholder="Search stores..." getSearchValue={(s) => `${s.name} ${s.location}`} />
    </div>
  )
}
