"use client"

import { use } from "react"
import { Mail, Phone, Pencil, Plus, Trash2 } from "lucide-react"
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
import { getCustomers } from "@/lib/dummy-data"
import type { Customer } from "@/lib/types"

const columns: DataTableColumn<Customer>[] = [
  {
    key: "name",
    header: "Customer",
    render: (c) => (
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {c.avatarInitial}
        </div>
        <div>
          <p className="font-medium">{c.name}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Mail className="size-3" /> {c.email}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "phone",
    header: "Phone",
    render: (c) => (
      <span className="flex items-center gap-1.5">
        <Phone className="size-3.5 text-muted-foreground" /> {c.phone}
      </span>
    ),
  },
  { key: "location", header: "Location", render: (c) => c.location },
  { key: "orders", header: "Orders", render: (c) => c.totalOrders },
  { key: "spent", header: "Total Spent", render: (c) => `$${c.totalSpent.toLocaleString()}` },
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

export default function CustomersPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = use(params)
  const customers = getCustomers()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customers"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Customers" }]}
        actions={
          <FormSheet
            trigger={<Button><Plus /> Add Customer</Button>}
            title="Add Customer"
            description="Add a new customer to this store's directory."
            submitLabel="Add Customer"
          >
            <FieldRow label="Full Name" required htmlFor="cust-name">
              <Input id="cust-name" placeholder="e.g. Robert Fox" required />
            </FieldRow>
            <FieldRow label="Email" required htmlFor="cust-email">
              <Input id="cust-email" type="email" placeholder="customer@example.com" required />
            </FieldRow>
            <FieldRow label="Phone" required htmlFor="cust-phone">
              <Input id="cust-phone" placeholder="+1 202-555-0100" required />
            </FieldRow>
            <FieldRow label="Location" htmlFor="cust-location">
              <Input id="cust-location" placeholder="e.g. New York, US" />
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
        data={customers}
        rowKey={(c) => c.id}
        searchPlaceholder="Search customers..."
        getSearchValue={(c) => `${c.name} ${c.email} ${c.location}`}
      />
    </div>
  )
}
