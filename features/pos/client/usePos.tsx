"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { OrderInsertInput } from "@/lib/database/zod/orders"
import { createOrder, getPosData, type PosData } from "../api/pos.action"

const defaultPosData: PosData = { categories: [], products: [] }

const posDataKey = (tenant: string) => ["pos-data", tenant] as const
export const usePosData = (tenant: string, initialData: PosData = defaultPosData) =>
  useQuery({
    queryKey: posDataKey(tenant),
    queryFn: async () => {
      const res = await getPosData(tenant)
      if (res.error || !res.data) throw new Error(res.message)
      return res.data
    },
    initialData,
  })

export const useCreateOrder = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: OrderInsertInput) => createOrder(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: posDataKey(tenant) })
    },
  })
}
