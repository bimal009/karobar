"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { BranchInsert, BranchUpdate } from "@/lib/database/zod/branches"
import { createBranch, deleteBranch, getBranches, updateBranch, type BranchWithMemberCount } from "../api/branch.action"

const branchesKey = (tenant: string) => ["branches", tenant] as const

export const useBranches = (tenant: string, initialData: BranchWithMemberCount[] = []) => {
  return useQuery({
    queryKey: branchesKey(tenant),
    queryFn: async () => {
      const res = await getBranches(tenant)
      if (res.error || !res.data) throw new Error(res.message)
      return res.data
    },
    initialData,
  })
}

export const useCreateBranch = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BranchInsert) => createBranch(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: branchesKey(tenant) })
    },
  })
}

export const useUpdateBranch = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BranchUpdate }) => updateBranch(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: branchesKey(tenant) })
    },
  })
}

export const useDeleteBranch = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBranch(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: branchesKey(tenant) })
    },
  })
}
