"use client"

import Link from "next/link"
import { Pencil, Plus, Trash2, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/shared/icon-button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { toast } from "@/components/ui/toast"
import { BranchFormSheet } from "./branch-form-sheet"
import { useBranches, useDeleteBranch } from "../client/useBranch"
import type { BranchWithMemberCount } from "../api/branch.action"

interface BranchesViewProps {
  tenant: string
  initialData: BranchWithMemberCount[]
}

export function BranchesView({ tenant, initialData }: BranchesViewProps) {
  const { data: branches } = useBranches(tenant, initialData)
  const { mutateAsync: deleteBranch, isPending: isDeleting } = useDeleteBranch(tenant)

  async function handleDelete(id: string) {
    const result = await deleteBranch(id)
    if (!result.error) {
      toast.add({ title: "Branch deleted", type: "success" })
    } else {
      toast.add({ title: "Failed to delete branch", description: result.message, type: "error" })
    }
  }

  const columns: DataTableColumn<BranchWithMemberCount>[] = [
    {
      key: "name",
      header: "Branch",
      render: (b) => (
        <div>
          <div className="flex items-center gap-2 font-medium">
            {b.name}
            {b.isMain && <Badge variant="secondary">Main</Badge>}
          </div>
          <p className="text-xs text-muted-foreground">{b.code}</p>
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (b) => [b.city, b.state, b.country].filter(Boolean).join(", ") || "—",
    },
    { key: "phone", header: "Phone", render: (b) => b.phone ?? "—" },
    {
      key: "members",
      header: "Members",
      render: (b) => (
        <Link
          href={`/${tenant}/branches/members?branch=${b.id}`}
          className="flex items-center gap-1.5 text-primary hover:underline"
        >
          <Users className="size-3.5" /> {b.memberCount}
        </Link>
      ),
    },
    { key: "status", header: "Status", render: (b) => <StatusBadge status={b.status} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (b) => (
        <div className="flex justify-end gap-1">
          <BranchFormSheet
            tenant={tenant}
            branch={b}
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
            description="This will permanently remove the branch and its member assignments."
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
        title="Branches"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Branches" }]}
        actions={
          <BranchFormSheet
            tenant={tenant}
            trigger={
              <Button>
                <Plus /> Add Branch
              </Button>
            }
          />
        }
      />
      <DataTable
        columns={columns}
        data={branches}
        rowKey={(b) => b.id}
        searchPlaceholder="Search branches..."
        getSearchValue={(b) => `${b.name} ${b.code} ${b.city ?? ""}`}
      />
    </div>
  )
}
