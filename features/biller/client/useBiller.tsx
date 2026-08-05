"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { unwrapPaginatedQuery } from "@/lib/common/query-helpers"
import type { Meta, PaginationQuery } from "@/lib/common/pagination"
import type { Biller } from "@/lib/database/schemas"
import type { BillerInsert, BillerUpdate } from "@/lib/database/zod/billers"
import { createBiller, deleteBiller, getBillers, updateBiller } from "../api/biller.action"

const billersKey = (tenant: string, params: Partial<PaginationQuery>) =>
  [
    "billers",
    tenant,
    params.page ?? 1,
    params.limit ?? 10,
    params.search ?? "",
    params.sortBy ?? "",
    params.sortOrder ?? "",
  ] as const

export const useBillers = (
  tenant: string,
  params: Partial<PaginationQuery> = {},
  initialData?: { rows: Biller[]; meta: Meta }
) => {
  const isDefaultParams = !params.page && !params.limit && !params.search && !params.sortBy && !params.sortOrder
  return useQuery({
    queryKey: billersKey(tenant, params),
    queryFn: async () => unwrapPaginatedQuery(await getBillers(tenant, params), "Failed to load billers"),
    initialData: isDefaultParams ? initialData : undefined,
  })
}

export const useCreateBiller = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BillerInsert) => createBiller(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["billers", tenant] })
    },
  })
}

export const useUpdateBiller = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BillerUpdate }) => updateBiller(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["billers", tenant] })
    },
  })
}

export const useDeleteBiller = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBiller(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["billers", tenant] })
    },
  })
}
