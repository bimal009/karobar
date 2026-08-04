"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { unwrapQuery } from "@/lib/common/query-helpers"
import type { RoleInsert, RoleUpdate, PermissionUpdate } from "@/lib/database/zod/roles"
import type { StoreRole } from "@/lib/database/schemas"
import {
  createRole,
  deleteRole,
  getRoles,
  updateRole,
  updateRolePermissions,
} from "../api/role.action"

const rolesKey = (tenant: string) => ["roles", tenant] as const

export const useRoles = (tenant: string, initialData: StoreRole[] = []) => {
  return useQuery({
    queryKey: rolesKey(tenant),
    queryFn: async () => unwrapQuery(await getRoles(tenant), "Failed to load roles"),
    initialData,
  })
}

export const useCreateRole = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: RoleInsert) => createRole(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: rolesKey(tenant) })
    },
  })
}

export const useUpdateRole = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RoleUpdate }) => updateRole(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: rolesKey(tenant) })
    },
  })
}

export const useDeleteRole = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteRole(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: rolesKey(tenant) })
    },
  })
}

export const useUpdateRolePermissions = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PermissionUpdate }) =>
      updateRolePermissions(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: rolesKey(tenant) })
    },
  })
}
