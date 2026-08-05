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
import { formatCurrency } from "@/lib/common/currency"
import { useShell } from "@/components/layout/shell-context"
import type { Supplier } from "@/lib/database/schemas"
import { SupplierFormSheet } from "./supplier-form-sheet"
import { useDeleteSupplier, useSuppliers } from "../client/useSupplier"

interface SuppliersViewProps {
  tenant: string
  initialData: { rows: Supplier[]; meta: Meta }
}

export function SuppliersView({ tenant, initialData }: SuppliersViewProps) {
  const { currency } = useShell()
  const [{ q, page, pageSize, sortBy, sortOrder }] = useDataTableParams()
  const { data, isFetching } = useSuppliers(
    tenant,
    { search: q || undefined, page, limit: pageSize, sortBy: sortBy || undefined, sortOrder },
    initialData
  )
  const suppliers = data?.rows ?? []
  const total = data?.meta.total ?? 0
  const { mutateAsync: deleteSupplier, isPending: isDeleting } = useDeleteSupplier(tenant)

  async function handleDelete(id: string) {
    const result = await deleteSupplier(id)
    if (!result.error) {
      toast.add({ title: "Supplier deleted", type: "success" })
    } else {
      toast.add({ title: "Failed to delete supplier", description: result.message, type: "error" })
    }
    return !result.error
  }

  const columns: DataTableColumn<Supplier>[] = [
    {
      key: "name",
      header: "Supplier",
      sortKey: "name",
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {s.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{s.name}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="size-3" /> {s.email ?? "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (s) => (
        <span className="flex items-center gap-1.5">
          <Phone className="size-3.5 text-muted-foreground" /> {s.phone ?? "—"}
        </span>
      ),
    },
    { key: "location", header: "Location", render: (s) => s.location ?? "—" },
    {
      key: "due",
      header: "Due",
      render: (s) => {
        const due = Number(s.totalDue)
        return due > 0 ? (
          <span className="font-medium text-destructive">{formatCurrency(due, currency, { maximumFractionDigits: 0 })}</span>
        ) : (
          formatCurrency(0, currency, { maximumFractionDigits: 0 })
        )
      },
    },
    { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (s) => (
        <div className="flex justify-end gap-1">
          <SupplierFormSheet
            tenant={tenant}
            supplier={s}
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
            title={`Delete "${s.name}"?`}
            description="This will permanently remove the supplier from this store's directory."
            isPending={isDeleting}
            onConfirm={() => handleDelete(s.id)}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Suppliers"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Suppliers" }]}
        actions={
          <SupplierFormSheet
            tenant={tenant}
            trigger={
              <Button>
                <Plus /> Add Supplier
              </Button>
            }
          />
        }
      />
      <DataTable
        columns={columns}
        data={suppliers}
        total={total}
        isLoading={isFetching}
        rowKey={(s) => s.id}
        searchPlaceholder="Search suppliers..."
      />
    </div>
  )
}
