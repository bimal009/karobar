"use client"

import { Mail, Pencil, Phone, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/shared/icon-button"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { toast } from "@/components/ui/toast"
import type { Biller, StoreLocation } from "@/lib/database/schemas"
import { BillerFormSheet } from "./biller-form-sheet"
import { useBillers, useDeleteBiller } from "../client/useBiller"

interface BillersViewProps {
  tenant: string
  initialData: Biller[]
  stores: StoreLocation[]
}

export function BillersView({ tenant, initialData, stores }: BillersViewProps) {
  const { data: billers } = useBillers(tenant, initialData)
  const { mutateAsync: deleteBiller, isPending: isDeleting } = useDeleteBiller(tenant)

  async function handleDelete(id: string) {
    const result = await deleteBiller(id)
    if (!result.error) {
      toast.add({ title: "Biller deleted", type: "success" })
    } else {
      toast.add({ title: "Failed to delete biller", description: result.message, type: "error" })
    }
    return !result.error
  }

  const columns: DataTableColumn<Biller>[] = [
    {
      key: "name",
      header: "Biller",
      render: (b) => (
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {b.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{b.name}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="size-3" /> {b.email ?? "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (b) => (
        <span className="flex items-center gap-1.5">
          <Phone className="size-3.5 text-muted-foreground" /> {b.phone ?? "—"}
        </span>
      ),
    },
    { key: "location", header: "Store", render: (b) => b.location ?? "—" },
    { key: "status", header: "Status", render: (b) => <StatusBadge status={b.status} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (b) => (
        <div className="flex justify-end gap-1">
          <BillerFormSheet
            tenant={tenant}
            biller={b}
            stores={stores}
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
            title={`Delete "${b.name}"?`}
            description="This will permanently remove the biller from this store's directory."
            isPending={isDeleting}
            onConfirm={() => handleDelete(b.id)}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Billers"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Billers" }]}
        actions={
          <BillerFormSheet
            tenant={tenant}
            stores={stores}
            trigger={
              <Button>
                <Plus /> Add Biller
              </Button>
            }
          />
        }
      />
      <DataTable
        columns={columns}
        data={billers}
        rowKey={(b) => b.id}
        searchPlaceholder="Search billers..."
        getSearchValue={(b) => `${b.name} ${b.email ?? ""}`}
      />
    </div>
  )
}
