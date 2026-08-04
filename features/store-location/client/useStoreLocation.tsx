"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { StoreLocation } from "@/lib/database/schemas"
import type { StoreLocationInsert, StoreLocationUpdate } from "@/lib/database/zod/store-locations"
import { createStore, deleteStore, getStores, updateStore } from "../api/store-location.action"

const storeLocationsKey = (tenant: string) => ["store-locations", tenant] as const

export const useStoreLocations = (tenant: string, initialData: StoreLocation[] = []) => {
  return useQuery({
    queryKey: storeLocationsKey(tenant),
    queryFn: async () => {
      const res = await getStores(tenant)
      if (res.error || !res.data) throw new Error(res.message)
      return res.data
    },
    initialData,
  })
}

export const useCreateStoreLocation = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: StoreLocationInsert) => createStore(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: storeLocationsKey(tenant) })
    },
  })
}

export const useUpdateStoreLocation = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StoreLocationUpdate }) => updateStore(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: storeLocationsKey(tenant) })
    },
  })
}

export const useDeleteStoreLocation = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteStore(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: storeLocationsKey(tenant) })
    },
  })
}
