"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { unwrapPaginatedQuery, unwrapQuery } from "@/lib/common/query-helpers"
import type { Meta } from "@/lib/common/pagination"
import type { MemberInsert, MemberUpdate } from "@/lib/database/zod/members"
import {
  createMember,
  deleteMember,
  getMemberFormOptions,
  getMembers,
  updateMember,
  type MemberFormOptions,
  type MemberListParams,
  type MemberRow,
} from "../api/member.action"

const membersKey = (tenant: string, params: MemberListParams) =>
  [
    "members",
    tenant,
    params.page ?? 1,
    params.limit ?? 10,
    params.search ?? "",
    params.sortBy ?? "",
    params.sortOrder ?? "",
    params.roleId ?? "",
    params.branchId ?? "",
  ] as const
const memberOptionsKey = (tenant: string) => ["members", tenant, "options"] as const

export const useMembers = (
  tenant: string,
  params: MemberListParams = {},
  initialData?: { rows: MemberRow[]; meta: Meta }
) => {
  const isDefaultParams =
    !params.page &&
    !params.limit &&
    !params.search &&
    !params.sortBy &&
    !params.sortOrder &&
    !params.roleId &&
    !params.branchId
  return useQuery({
    queryKey: membersKey(tenant, params),
    queryFn: async () => unwrapPaginatedQuery(await getMembers(tenant, params), "Failed to load members"),
    initialData: isDefaultParams ? initialData : undefined,
  })
}

export const useMemberFormOptions = (tenant: string, initialData?: MemberFormOptions) => {
  return useQuery({
    queryKey: memberOptionsKey(tenant),
    queryFn: async () =>
      unwrapQuery(await getMemberFormOptions(tenant), "Failed to load member form options"),
    initialData,
  })
}

export const useCreateMember = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: MemberInsert) => createMember(tenant, data),
    onSuccess: (res) => {
      if (!res.error) {
        queryClient.invalidateQueries({ queryKey: ["members", tenant] })
        // Member CRUD writes branchMember, which drives each branch's memberCount.
        queryClient.invalidateQueries({ queryKey: ["branches", tenant] })
      }
    },
  })
}

export const useUpdateMember = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MemberUpdate }) => updateMember(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) {
        queryClient.invalidateQueries({ queryKey: ["members", tenant] })
        queryClient.invalidateQueries({ queryKey: ["branches", tenant] })
      }
    },
  })
}

export const useDeleteMember = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteMember(tenant, id),
    onSuccess: (res) => {
      if (!res.error) {
        queryClient.invalidateQueries({ queryKey: ["members", tenant] })
        queryClient.invalidateQueries({ queryKey: ["branches", tenant] })
      }
    },
  })
}
