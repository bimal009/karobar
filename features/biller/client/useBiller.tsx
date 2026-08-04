"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { unwrapQuery } from "@/lib/common/query-helpers"
import type { Biller } from "@/lib/database/schemas"
import type { BillerInsert, BillerUpdate } from "@/lib/database/zod/billers"
import { createBiller, deleteBiller, getBillers, updateBiller } from "../api/biller.action"

const billersKey = (tenant: string) => ["billers", tenant] as const

export const useBillers = (tenant: string, initialData: Biller[] = []) => {
  return useQuery({
    queryKey: billersKey(tenant),
    queryFn: async () => unwrapQuery(await getBillers(tenant), "Failed to load billers"),
    initialData,
  })
}

export const useCreateBiller = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BillerInsert) => createBiller(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: billersKey(tenant) })
    },
  })
}

export const useUpdateBiller = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BillerUpdate }) => updateBiller(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: billersKey(tenant) })
    },
  })
}

export const useDeleteBiller = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBiller(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: billersKey(tenant) })
    },
  })
}
