"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { unwrapPaginatedQuery } from "@/lib/common/query-helpers"
import type { Meta, PaginationQuery } from "@/lib/common/pagination"
import type { StoreLocation } from "@/lib/database/schemas"
import type { StoreLocationInsert, StoreLocationUpdate } from "@/lib/database/zod/store-locations"
import { createStore, deleteStore, getStoreLocations, updateStore } from "../api/store-location.action"

const storeLocationsKey = (tenant: string, params: Partial<PaginationQuery>) =>
  [
    "store-locations",
    tenant,
    params.page ?? 1,
    params.limit ?? 10,
    params.search ?? "",
    params.sortBy ?? "",
    params.sortOrder ?? "",
  ] as const

export const useStoreLocations = (
  tenant: string,
  params: Partial<PaginationQuery> = {},
  initialData?: { rows: StoreLocation[]; meta: Meta }
) => {
  const isDefaultParams = !params.page && !params.limit && !params.search && !params.sortBy && !params.sortOrder
  return useQuery({
    queryKey: storeLocationsKey(tenant, params),
    queryFn: async () =>
      unwrapPaginatedQuery(await getStoreLocations(tenant, params), "Failed to load store locations"),
    initialData: isDefaultParams ? initialData : undefined,
  })
}

export const useCreateStoreLocation = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: StoreLocationInsert) => createStore(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["store-locations", tenant] })
    },
  })
}

export const useUpdateStoreLocation = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StoreLocationUpdate }) => updateStore(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["store-locations", tenant] })
    },
  })
}

export const useDeleteStoreLocation = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteStore(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["store-locations", tenant] })
    },
  })
}
