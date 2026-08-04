"use client"

import { Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/shared/icon-button"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { toast } from "@/components/ui/toast"
import type { Warranty } from "@/lib/database/schemas"
import { WarrantyFormSheet } from "./warranty-form-sheet"
import { useDeleteWarranty, useWarranties } from "../client/useWarranty"

interface WarrantiesViewProps {
  tenant: string
  initialData: Warranty[]
}

export function WarrantiesView({ tenant, initialData }: WarrantiesViewProps) {
  const { data: warranties } = useWarranties(tenant, initialData)
  const { mutateAsync: deleteWarranty, isPending: isDeleting } = useDeleteWarranty(tenant)

  async function handleDelete(id: string) {
    const result = await deleteWarranty(id)
    if (!result.error) {
      toast.add({ title: "Warranty deleted", type: "success" })
    } else {
      toast.add({ title: "Failed to delete warranty", description: result.message, type: "error" })
    }
  }

  const columns: DataTableColumn<Warranty>[] = [
    { key: "name", header: "Warranty", render: (w) => <span className="font-medium">{w.name}</span> },
    { key: "duration", header: "Duration", render: (w) => w.duration },
    {
      key: "description",
      header: "Description",
      render: (w) => <span className="text-muted-foreground">{w.description ?? "—"}</span>,
    },
    { key: "status", header: "Status", render: (w) => <StatusBadge status={w.status} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (w) => (
        <div className="flex justify-end gap-1">
          <WarrantyFormSheet
            tenant={tenant}
            warranty={w}
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
            description="This will permanently remove the warranty. Warranties with products cannot be deleted."
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
        title="Warranties"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Warranties" }]}
        actions={
          <WarrantyFormSheet
            tenant={tenant}
            trigger={
              <Button>
                <Plus /> Add Warranty
              </Button>
            }
          />
        }
      />
      <DataTable
        columns={columns}
        data={warranties}
        rowKey={(w) => w.id}
        searchPlaceholder="Search warranties..."
        getSearchValue={(w) => w.name}
      />
    </div>
  )
}
