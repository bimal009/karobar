"use client"

import { Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/shared/icon-button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { toast } from "@/components/ui/toast"
import type { CustomAttribute } from "@/lib/database/schemas"
import { CustomAttributeFormSheet } from "./custom-attribute-form-sheet"
import { useDeleteCustomAttribute, useCustomAttributes } from "../client/useCustomAttribute"

interface CustomAttributesViewProps {
  tenant: string
  initialData: CustomAttribute[]
}

export function CustomAttributesView({ tenant, initialData }: CustomAttributesViewProps) {
  const { data: customAttributes } = useCustomAttributes(tenant, initialData)
  const { mutateAsync: deleteCustomAttribute, isPending: isDeleting } = useDeleteCustomAttribute(tenant)

  async function handleDelete(id: string) {
    const result = await deleteCustomAttribute(id)
    if (!result.error) {
      toast.add({ title: "Attribute deleted", type: "success" })
    } else {
      toast.add({ title: "Failed to delete attribute", description: result.message, type: "error" })
    }
    return !result.error
  }

  const columns: DataTableColumn<CustomAttribute>[] = [
    { key: "name", header: "Attribute", render: (a) => <span className="font-medium">{a.name}</span> },
    {
      key: "values",
      header: "Values",
      render: (a) => (
        <div className="flex flex-wrap gap-1">
          {a.values.map((val) => (
            <Badge key={val} variant="outline">{val}</Badge>
          ))}
        </div>
      ),
    },
    { key: "status", header: "Status", render: (a) => <StatusBadge status={a.status} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (a) => (
        <div className="flex justify-end gap-1">
          <CustomAttributeFormSheet
            tenant={tenant}
            customAttribute={a}
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
            title={`Delete "${a.name}"?`}
            description="This action cannot be undone."
            isPending={isDeleting}
            onConfirm={() => handleDelete(a.id)}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Custom Attributes"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Custom Attributes" }]}
        actions={
          <CustomAttributeFormSheet
            tenant={tenant}
            trigger={
              <Button>
                <Plus /> Add Attribute
              </Button>
            }
          />
        }
      />
      <DataTable
        columns={columns}
        data={customAttributes}
        rowKey={(a) => a.id}
        searchPlaceholder="Search attributes..."
        getSearchValue={(a) => a.name}
      />
    </div>
  )
}
