"use client"

import { Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconButton } from "@/components/shared/icon-button"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { toast } from "@/components/ui/toast"
import { RoleFormSheet } from "./role-form-sheet"
import { PermissionsSheet } from "./permissions-sheet"
import { useDeleteRole, useRoles } from "../client/useRoles"
import type { StoreRole } from "@/lib/database/schemas"

interface RolesViewProps {
  tenant: string
  initialData: StoreRole[]
}

export function RolesView({ tenant, initialData }: RolesViewProps) {
  const { data: roles } = useRoles(tenant, initialData)
  const { mutateAsync: deleteRole, isPending: isDeleting } = useDeleteRole(tenant)

  async function handleDelete(id: string) {
    const result = await deleteRole(id)
    if (!result.error) {
      toast.add({ title: "Role deleted", type: "success" })
    } else {
      toast.add({ title: "Failed to delete role", description: result.message, type: "error" })
    }
    return !result.error
  }

  const columns: DataTableColumn<StoreRole>[] = [
    {
      key: "name",
      header: "Role",
      render: (r) => (
        <div>
          <div className="flex items-center gap-2 font-medium">
            {r.name}
            {r.isSystem && <Badge variant="secondary">System</Badge>}
          </div>
          {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (r) => (
        <div className="flex justify-end gap-1">
          <PermissionsSheet
            tenant={tenant}
            role={r}
            trigger={
              <IconButton label="Permissions" size="icon-sm" variant="ghost">
                <ShieldCheck />
              </IconButton>
            }
          />
          {!r.isSystem && (
            <>
              <RoleFormSheet
                tenant={tenant}
                role={r}
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
                title={`Delete "${r.name}"?`}
                description="This will permanently remove the role. Roles with members assigned cannot be deleted."
                isPending={isDeleting}
                onConfirm={() => handleDelete(r.id)}
              />
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Roles & Permissions"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Roles" }]}
        actions={
          <RoleFormSheet
            tenant={tenant}
            trigger={
              <Button>
                <Plus /> Add Role
              </Button>
            }
          />
        }
      />
      <DataTable
        columns={columns}
        data={roles}
        rowKey={(r) => r.id}
        searchPlaceholder="Search roles..."
        getSearchValue={(r) => `${r.name} ${r.description ?? ""}`}
      />
    </div>
  )
}
