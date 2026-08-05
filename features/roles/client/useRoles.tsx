"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { unwrapPaginatedQuery } from "@/lib/common/query-helpers"
import type { Meta, PaginationQuery } from "@/lib/common/pagination"
import type { RoleInsert, RoleUpdate, PermissionUpdate } from "@/lib/database/zod/roles"
import type { StoreRole } from "@/lib/database/schemas"
import {
  createRole,
  deleteRole,
  getRoles,
  updateRole,
  updateRolePermissions,
} from "../api/role.action"

const rolesKey = (tenant: string, params: Partial<PaginationQuery>) =>
  [
    "roles",
    tenant,
    params.page ?? 1,
    params.limit ?? 10,
    params.search ?? "",
    params.sortBy ?? "",
    params.sortOrder ?? "",
  ] as const

export const useRoles = (
  tenant: string,
  params: Partial<PaginationQuery> = {},
  initialData?: { rows: StoreRole[]; meta: Meta }
) => {
  const isDefaultParams = !params.page && !params.limit && !params.search && !params.sortBy && !params.sortOrder
  return useQuery({
    queryKey: rolesKey(tenant, params),
    queryFn: async () => unwrapPaginatedQuery(await getRoles(tenant, params), "Failed to load roles"),
    initialData: isDefaultParams ? initialData : undefined,
  })
}

export const useCreateRole = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: RoleInsert) => createRole(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["roles", tenant] })
    },
  })
}

export const useUpdateRole = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RoleUpdate }) => updateRole(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["roles", tenant] })
    },
  })
}

export const useDeleteRole = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteRole(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["roles", tenant] })
    },
  })
}

export const useUpdateRolePermissions = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PermissionUpdate }) =>
      updateRolePermissions(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["roles", tenant] })
    },
  })
}
