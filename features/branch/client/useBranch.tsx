"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { unwrapPaginatedQuery } from "@/lib/common/query-helpers"
import type { Meta, PaginationQuery } from "@/lib/common/pagination"
import type { BranchInsert, BranchUpdate } from "@/lib/database/zod/branches"
import { createBranch, deleteBranch, getBranches, updateBranch, type BranchWithMemberCount } from "../api/branch.action"

const branchesKey = (tenant: string, params: Partial<PaginationQuery>) =>
  [
    "branches",
    tenant,
    params.page ?? 1,
    params.limit ?? 10,
    params.search ?? "",
    params.sortBy ?? "",
    params.sortOrder ?? "",
  ] as const

export const useBranches = (
  tenant: string,
  params: Partial<PaginationQuery> = {},
  initialData?: { rows: BranchWithMemberCount[]; meta: Meta }
) => {
  const isDefaultParams = !params.page && !params.limit && !params.search && !params.sortBy && !params.sortOrder
  return useQuery({
    queryKey: branchesKey(tenant, params),
    queryFn: async () => unwrapPaginatedQuery(await getBranches(tenant, params), "Failed to load branches"),
    initialData: isDefaultParams ? initialData : undefined,
  })
}

export const useCreateBranch = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BranchInsert) => createBranch(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["branches", tenant] })
    },
  })
}

export const useUpdateBranch = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BranchUpdate }) => updateBranch(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["branches", tenant] })
    },
  })
}

export const useDeleteBranch = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBranch(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["branches", tenant] })
    },
  })
}
