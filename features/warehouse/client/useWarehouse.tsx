"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { Warehouse } from "@/lib/database/schemas"
import type { WarehouseInsert, WarehouseUpdate } from "@/lib/database/zod/warehouses"
import { createWarehouse, deleteWarehouse, getWarehouses, updateWarehouse } from "../api/warehouse.action"

const warehousesKey = (tenant: string) => ["warehouses", tenant] as const

export const useWarehouses = (tenant: string, initialData: Warehouse[] = []) => {
  return useQuery({
    queryKey: warehousesKey(tenant),
    queryFn: async () => {
      const res = await getWarehouses(tenant)
      if (res.error || !res.data) throw new Error(res.message)
      return res.data
    },
    initialData,
  })
}

export const useCreateWarehouse = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: WarehouseInsert) => createWarehouse(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: warehousesKey(tenant) })
    },
  })
}

export const useUpdateWarehouse = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WarehouseUpdate }) => updateWarehouse(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: warehousesKey(tenant) })
    },
  })
}

export const useDeleteWarehouse = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteWarehouse(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: warehousesKey(tenant) })
    },
  })
}
