"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { Supplier } from "@/lib/database/schemas"
import type { SupplierInsert, SupplierUpdate } from "@/lib/database/zod/suppliers"
import { createSupplier, deleteSupplier, getSuppliers, updateSupplier } from "../api/supplier.action"

const suppliersKey = (tenant: string) => ["suppliers", tenant] as const

export const useSuppliers = (tenant: string, initialData: Supplier[] = []) => {
  return useQuery({
    queryKey: suppliersKey(tenant),
    queryFn: async () => {
      const res = await getSuppliers(tenant)
      if (res.error || !res.data) throw new Error(res.message)
      return res.data
    },
    initialData,
  })
}

export const useCreateSupplier = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SupplierInsert) => createSupplier(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: suppliersKey(tenant) })
    },
  })
}

export const useUpdateSupplier = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SupplierUpdate }) => updateSupplier(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: suppliersKey(tenant) })
    },
  })
}

export const useDeleteSupplier = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteSupplier(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: suppliersKey(tenant) })
    },
  })
}
