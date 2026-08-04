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
import type { VariantAttribute } from "@/lib/database/schemas"
import { VariantAttributeFormSheet } from "./variant-attribute-form-sheet"
import { useDeleteVariantAttribute, useVariantAttributes } from "../client/useVariantAttribute"

interface VariantAttributesViewProps {
  tenant: string
  initialData: VariantAttribute[]
}

export function VariantAttributesView({ tenant, initialData }: VariantAttributesViewProps) {
  const { data: variantAttributes } = useVariantAttributes(tenant, initialData)
  const { mutateAsync: deleteVariantAttribute, isPending: isDeleting } = useDeleteVariantAttribute(tenant)

  async function handleDelete(id: string) {
    const result = await deleteVariantAttribute(id)
    if (!result.error) {
      toast.add({ title: "Attribute deleted", type: "success" })
    } else {
      toast.add({ title: "Failed to delete attribute", description: result.message, type: "error" })
    }
    return !result.error
  }

  const columns: DataTableColumn<VariantAttribute>[] = [
    { key: "name", header: "Attribute", render: (v) => <span className="font-medium">{v.name}</span> },
    {
      key: "values",
      header: "Values",
      render: (v) => (
        <div className="flex flex-wrap gap-1">
          {v.values.map((val) => (
            <Badge key={val} variant="outline">{val}</Badge>
          ))}
        </div>
      ),
    },
    { key: "status", header: "Status", render: (v) => <StatusBadge status={v.status} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (v) => (
        <div className="flex justify-end gap-1">
          <VariantAttributeFormSheet
            tenant={tenant}
            variantAttribute={v}
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
            title={`Delete "${v.name}"?`}
            description="This action cannot be undone."
            isPending={isDeleting}
            onConfirm={() => handleDelete(v.id)}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Variant Attributes"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Variant Attributes" }]}
        actions={
          <VariantAttributeFormSheet
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
        data={variantAttributes}
        rowKey={(v) => v.id}
        searchPlaceholder="Search attributes..."
        getSearchValue={(v) => v.name}
      />
    </div>
  )
}
