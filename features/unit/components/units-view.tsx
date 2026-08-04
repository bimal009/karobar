"use client"

import { Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/shared/icon-button"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { toast } from "@/components/ui/toast"
import type { Unit } from "@/lib/database/schemas"
import { UnitFormSheet } from "./unit-form-sheet"
import { useDeleteUnit, useUnits } from "../client/useUnit"

interface UnitsViewProps {
  tenant: string
  initialData: Unit[]
}

export function UnitsView({ tenant, initialData }: UnitsViewProps) {
  const { data: units } = useUnits(tenant, initialData)
  const { mutateAsync: deleteUnit, isPending: isDeleting } = useDeleteUnit(tenant)

  async function handleDelete(id: string) {
    const result = await deleteUnit(id)
    if (!result.error) {
      toast.add({ title: "Unit deleted", type: "success" })
    } else {
      toast.add({ title: "Failed to delete unit", description: result.message, type: "error" })
    }
  }

  const columns: DataTableColumn<Unit>[] = [
    { key: "name", header: "Unit", render: (u) => <span className="font-medium">{u.name}</span> },
    { key: "short", header: "Short Name", render: (u) => u.shortName },
    { key: "status", header: "Status", render: (u) => <StatusBadge status={u.status} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (u) => (
        <div className="flex justify-end gap-1">
          <UnitFormSheet
            tenant={tenant}
            unit={u}
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
            title={`Delete "${u.name}"?`}
            description="This will permanently remove the unit. Units with products cannot be deleted."
            isPending={isDeleting}
            onConfirm={() => handleDelete(u.id)}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Units"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Units" }]}
        actions={
          <UnitFormSheet
            tenant={tenant}
            trigger={
              <Button>
                <Plus /> Add Unit
              </Button>
            }
          />
        }
      />
      <DataTable
        columns={columns}
        data={units}
        rowKey={(u) => u.id}
        searchPlaceholder="Search units..."
        getSearchValue={(u) => u.name}
      />
    </div>
  )
}
