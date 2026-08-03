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
import { getBillers, getStores } from "@/lib/dummy-data"
import type { Biller } from "@/lib/types"

const columns: DataTableColumn<Biller>[] = [
  {
    key: "name",
    header: "Biller",
    render: (b) => (
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{b.avatarInitial}</div>
        <div>
          <p className="font-medium">{b.name}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="size-3" /> {b.email}</p>
        </div>
      </div>
    ),
  },
  { key: "phone", header: "Phone", render: (b) => <span className="flex items-center gap-1.5"><Phone className="size-3.5 text-muted-foreground" /> {b.phone}</span> },
  { key: "location", header: "Store", render: (b) => b.location },
  { key: "sales", header: "Sales", render: (b) => b.salesCount },
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

export default function BillersPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = use(params)
  const billers = getBillers()
  const stores = getStores()
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Billers"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Billers" }]}
        actions={
          <FormSheet
            trigger={<Button><Plus /> Add Biller</Button>}
            title="Add Biller"
            description="Add a staff member who can process sales at the till."
            submitLabel="Add Biller"
          >
            <FieldRow label="Full Name" required htmlFor="biller-name">
              <Input id="biller-name" placeholder="e.g. Olivia Brown" required />
            </FieldRow>
            <FieldRow label="Email" required htmlFor="biller-email">
              <Input id="biller-email" type="email" placeholder="biller@example.com" required />
            </FieldRow>
            <FieldRow label="Phone" required htmlFor="biller-phone">
              <Input id="biller-phone" placeholder="+1 202-555-0100" required />
            </FieldRow>
            <FieldRow label="Store" required>
              <Select required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
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
      <DataTable columns={columns} data={billers} rowKey={(b) => b.id} searchPlaceholder="Search billers..." getSearchValue={(b) => `${b.name} ${b.email}`} />
    </div>
  )
}
