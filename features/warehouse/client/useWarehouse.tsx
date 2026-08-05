"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { unwrapPaginatedQuery } from "@/lib/common/query-helpers"
import type { Meta, PaginationQuery } from "@/lib/common/pagination"
import type { Warehouse } from "@/lib/database/schemas"
import type { WarehouseInsert, WarehouseUpdate } from "@/lib/database/zod/warehouses"
import { createWarehouse, deleteWarehouse, getWarehouses, updateWarehouse } from "../api/warehouse.action"

const warehousesKey = (tenant: string, params: Partial<PaginationQuery>) =>
  [
    "warehouses",
    tenant,
    params.page ?? 1,
    params.limit ?? 10,
    params.search ?? "",
    params.sortBy ?? "",
    params.sortOrder ?? "",
  ] as const

export const useWarehouses = (
  tenant: string,
  params: Partial<PaginationQuery> = {},
  initialData?: { rows: Warehouse[]; meta: Meta }
) => {
  const isDefaultParams = !params.page && !params.limit && !params.search && !params.sortBy && !params.sortOrder
  return useQuery({
    queryKey: warehousesKey(tenant, params),
    queryFn: async () => unwrapPaginatedQuery(await getWarehouses(tenant, params), "Failed to load warehouses"),
    initialData: isDefaultParams ? initialData : undefined,
  })
}

export const useCreateWarehouse = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: WarehouseInsert) => createWarehouse(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["warehouses", tenant] })
    },
  })
}

export const useUpdateWarehouse = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WarehouseUpdate }) => updateWarehouse(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["warehouses", tenant] })
    },
  })
}

export const useDeleteWarehouse = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteWarehouse(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["warehouses", tenant] })
    },
  })
}
