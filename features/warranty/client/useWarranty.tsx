"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { unwrapPaginatedQuery } from "@/lib/common/query-helpers"
import type { Meta, PaginationQuery } from "@/lib/common/pagination"
import type { Warranty } from "@/lib/database/schemas"
import type { WarrantyInsert, WarrantyUpdate } from "@/lib/database/zod/warranties"
import { createWarranty, deleteWarranty, getWarranties, updateWarranty } from "../api/warranty.action"

const warrantiesKey = (tenant: string, params: Partial<PaginationQuery>) =>
  [
    "warranties",
    tenant,
    params.page ?? 1,
    params.limit ?? 10,
    params.search ?? "",
    params.sortBy ?? "",
    params.sortOrder ?? "",
  ] as const

export const useWarranties = (
  tenant: string,
  params: Partial<PaginationQuery> = {},
  initialData?: { rows: Warranty[]; meta: Meta }
) => {
  const isDefaultParams = !params.page && !params.limit && !params.search && !params.sortBy && !params.sortOrder
  return useQuery({
    queryKey: warrantiesKey(tenant, params),
    queryFn: async () =>
      unwrapPaginatedQuery(await getWarranties(tenant, params), "Failed to load warranties"),
    initialData: isDefaultParams ? initialData : undefined,
  })
}

export const useCreateWarranty = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: WarrantyInsert) => createWarranty(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["warranties", tenant] })
    },
  })
}

export const useUpdateWarranty = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WarrantyUpdate }) => updateWarranty(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["warranties", tenant] })
    },
  })
}

export const useDeleteWarranty = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteWarranty(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["warranties", tenant] })
    },
  })
}
