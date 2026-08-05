"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { unwrapPaginatedQuery } from "@/lib/common/query-helpers"
import type { Meta, PaginationQuery } from "@/lib/common/pagination"
import { invalidateDerivedQueries } from "@/lib/query/invalidate"
import type { Supplier } from "@/lib/database/schemas"
import type { SupplierInsert, SupplierUpdate } from "@/lib/database/zod/suppliers"
import { createSupplier, deleteSupplier, getSuppliers, updateSupplier } from "../api/supplier.action"

const suppliersKey = (tenant: string, params: Partial<PaginationQuery>) =>
  [
    "suppliers",
    tenant,
    params.page ?? 1,
    params.limit ?? 10,
    params.search ?? "",
    params.sortBy ?? "",
    params.sortOrder ?? "",
  ] as const

export const useSuppliers = (
  tenant: string,
  params: Partial<PaginationQuery> = {},
  initialData?: { rows: Supplier[]; meta: Meta }
) => {
  const isDefaultParams = !params.page && !params.limit && !params.search && !params.sortBy && !params.sortOrder
  return useQuery({
    queryKey: suppliersKey(tenant, params),
    queryFn: async () => unwrapPaginatedQuery(await getSuppliers(tenant, params), "Failed to load suppliers"),
    initialData: isDefaultParams ? initialData : undefined,
  })
}

export const useCreateSupplier = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SupplierInsert) => createSupplier(tenant, data),
    onSuccess: (res) => {
      if (!res.error) {
        queryClient.invalidateQueries({ queryKey: ["suppliers", tenant] })
        invalidateDerivedQueries(queryClient, tenant)
      }
    },
  })
}

export const useUpdateSupplier = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SupplierUpdate }) => updateSupplier(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) {
        queryClient.invalidateQueries({ queryKey: ["suppliers", tenant] })
        invalidateDerivedQueries(queryClient, tenant)
      }
    },
  })
}

export const useDeleteSupplier = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteSupplier(tenant, id),
    onSuccess: (res) => {
      if (!res.error) {
        queryClient.invalidateQueries({ queryKey: ["suppliers", tenant] })
        invalidateDerivedQueries(queryClient, tenant)
      }
    },
  })
}
