"use client"

import { Mail, Pencil, Phone, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/shared/icon-button"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { toast } from "@/components/ui/toast"
import type { Warehouse } from "@/lib/database/schemas"
import { WarehouseFormSheet } from "./warehouse-form-sheet"
import { useDeleteWarehouse, useWarehouses } from "../client/useWarehouse"

interface WarehousesViewProps {
  tenant: string
  initialData: Warehouse[]
}

export function WarehousesView({ tenant, initialData }: WarehousesViewProps) {
  const { data: warehouses } = useWarehouses(tenant, initialData)
  const { mutateAsync: deleteWarehouse, isPending: isDeleting } = useDeleteWarehouse(tenant)

  async function handleDelete(id: string) {
    const result = await deleteWarehouse(id)
    if (!result.error) {
      toast.add({ title: "Warehouse deleted", type: "success" })
    } else {
      toast.add({ title: "Failed to delete warehouse", description: result.message, type: "error" })
    }
  }

  const columns: DataTableColumn<Warehouse>[] = [
    { key: "name", header: "Warehouse", render: (w) => <span className="font-medium">{w.name}</span> },
    { key: "contact", header: "Contact Person", render: (w) => w.contactPerson ?? "—" },
    {
      key: "email",
      header: "Email",
      render: (w) => (
        <span className="flex items-center gap-1.5">
          <Mail className="size-3.5 text-muted-foreground" /> {w.email ?? "—"}
        </span>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (w) => (
        <span className="flex items-center gap-1.5">
          <Phone className="size-3.5 text-muted-foreground" /> {w.phone ?? "—"}
        </span>
      ),
    },
    { key: "location", header: "Location", render: (w) => w.location ?? "—" },
    { key: "status", header: "Status", render: (w) => <StatusBadge status={w.status} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (w) => (
        <div className="flex justify-end gap-1">
          <WarehouseFormSheet
            tenant={tenant}
            warehouse={w}
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
            title={`Delete "${w.name}"?`}
            description="This will permanently remove this warehouse."
            isPending={isDeleting}
            onConfirm={() => handleDelete(w.id)}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Warehouses"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Warehouses" }]}
        actions={
          <WarehouseFormSheet
            tenant={tenant}
            trigger={
              <Button>
                <Plus /> Add Warehouse
              </Button>
            }
          />
        }
      />
      <DataTable
        columns={columns}
        data={warehouses}
        rowKey={(w) => w.id}
        searchPlaceholder="Search warehouses..."
        getSearchValue={(w) => `${w.name} ${w.location ?? ""}`}
      />
    </div>
  )
}
