"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { Warranty } from "@/lib/database/schemas"
import type { WarrantyInsert, WarrantyUpdate } from "@/lib/database/zod/warranties"
import { createWarranty, deleteWarranty, getWarranties, updateWarranty } from "../api/warranty.action"

const warrantiesKey = (tenant: string) => ["warranties", tenant] as const

export const useWarranties = (tenant: string, initialData: Warranty[] = []) =>
  useQuery({
    queryKey: warrantiesKey(tenant),
    queryFn: async () => {
      const res = await getWarranties(tenant)
      if (res.error || !res.data) throw new Error(res.message)
      return res.data
    },
    initialData,
  })

export const useCreateWarranty = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: WarrantyInsert) => createWarranty(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: warrantiesKey(tenant) })
    },
  })
}

export const useUpdateWarranty = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WarrantyUpdate }) => updateWarranty(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: warrantiesKey(tenant) })
    },
  })
}

export const useDeleteWarranty = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteWarranty(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: warrantiesKey(tenant) })
    },
  })
}
