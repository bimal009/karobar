"use client"

import { Mail, Pencil, Phone, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/shared/icon-button"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, useDataTableParams, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { toast } from "@/components/ui/toast"
import type { Meta } from "@/lib/common/pagination"
import type { Customer } from "@/lib/database/schemas"
import { CustomerFormSheet } from "./customer-form-sheet"
import { useCustomers, useDeleteCustomer } from "../client/useCustomer"

interface CustomersViewProps {
  tenant: string
  initialData: { rows: Customer[]; meta: Meta }
}

export function CustomersView({ tenant, initialData }: CustomersViewProps) {
  const [{ q, page, pageSize, sortBy, sortOrder }] = useDataTableParams()
  const { data, isFetching } = useCustomers(
    tenant,
    { search: q || undefined, page, limit: pageSize, sortBy: sortBy || undefined, sortOrder },
    initialData
  )
  const customers = data?.rows ?? []
  const total = data?.meta.total ?? 0
  const { mutateAsync: deleteCustomer, isPending: isDeleting } = useDeleteCustomer(tenant)

  async function handleDelete(id: string) {
    const result = await deleteCustomer(id)
    if (!result.error) {
      toast.add({ title: "Customer deleted", type: "success" })
    } else {
      toast.add({ title: "Failed to delete customer", description: result.message, type: "error" })
    }
    return !result.error
  }

  const columns: DataTableColumn<Customer>[] = [
    {
      key: "name",
      header: "Customer",
      sortKey: "name",
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {c.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{c.name}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="size-3" /> {c.email ?? "—"}
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
          <Phone className="size-3.5 text-muted-foreground" /> {c.phone ?? "—"}
        </span>
      ),
    },
    { key: "location", header: "Location", render: (c) => c.location ?? "—" },
    { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (c) => (
        <div className="flex justify-end gap-1">
          <CustomerFormSheet
            tenant={tenant}
            customer={c}
            trigger={
              <IconButton label="Edit" size="icon-sm" variant="ghost">
                <Pencil />
              </IconButton>
            }
          />
          <ConfirmDeleteDialog
            trigger={
              <IconButton label="Delete" size="icon-sm" variant="ghost">
                <Trash2 className="text-destructive" />
              </IconButton>
            }
            title={`Delete "${c.name}"?`}
            description="This will permanently remove the customer from this store's directory."
            isPending={isDeleting}
            onConfirm={() => handleDelete(c.id)}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customers"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Customers" }]}
        actions={
          <CustomerFormSheet
            tenant={tenant}
            trigger={
              <Button>
                <Plus /> Add Customer
              </Button>
            }
          />
        }
      />
      <DataTable
        columns={columns}
        data={customers}
        total={total}
        isLoading={isFetching}
        rowKey={(c) => c.id}
        searchPlaceholder="Search customers..."
      />
    </div>
  )
}
