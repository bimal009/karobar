"use client"

import { Mail, Pencil, Phone, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/shared/icon-button"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { toast } from "@/components/ui/toast"
import type { StoreLocation } from "@/lib/database/schemas"
import { StoreLocationFormSheet } from "./store-location-form-sheet"
import { useDeleteStoreLocation, useStoreLocations } from "../client/useStoreLocation"

interface StoreLocationsViewProps {
  tenant: string
  initialData: StoreLocation[]
}

export function StoreLocationsView({ tenant, initialData }: StoreLocationsViewProps) {
  const { data: stores } = useStoreLocations(tenant, initialData)
  const { mutateAsync: deleteStore, isPending: isDeleting } = useDeleteStoreLocation(tenant)

  async function handleDelete(id: string) {
    const result = await deleteStore(id)
    if (!result.error) {
      toast.add({ title: "Store deleted", type: "success" })
    } else {
      toast.add({ title: "Failed to delete store", description: result.message, type: "error" })
    }
  }

  const columns: DataTableColumn<StoreLocation>[] = [
    { key: "name", header: "Store", render: (s) => <span className="font-medium">{s.name}</span> },
    { key: "manager", header: "Manager", render: (s) => s.manager ?? "—" },
    {
      key: "email",
      header: "Email",
      render: (s) => (
        <span className="flex items-center gap-1.5">
          <Mail className="size-3.5 text-muted-foreground" /> {s.email ?? "—"}
        </span>
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
    { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (s) => (
        <div className="flex justify-end gap-1">
          <StoreLocationFormSheet
            tenant={tenant}
            store={s}
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
            description="This will permanently remove this store location."
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
        title="Stores"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Stores" }]}
        actions={
          <StoreLocationFormSheet
            tenant={tenant}
            trigger={
              <Button>
                <Plus /> Add Store
              </Button>
            }
          />
        }
      />
      <DataTable
        columns={columns}
        data={stores}
        rowKey={(s) => s.id}
        searchPlaceholder="Search stores..."
        getSearchValue={(s) => `${s.name} ${s.location ?? ""}`}
      />
    </div>
  )
}
