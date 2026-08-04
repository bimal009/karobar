"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { unwrapQuery } from "@/lib/common/query-helpers"
import type { BrandInsert, BrandUpdate } from "@/lib/database/zod/brands"
import {
  createBrand,
  deleteBrand,
  getBrands,
  updateBrand,
  type BrandWithProductCount,
} from "../api/brand.action"

const brandsKey = (tenant: string) => ["brands", tenant] as const

export const useBrands = (tenant: string, initialData: BrandWithProductCount[] = []) =>
  useQuery({
    queryKey: brandsKey(tenant),
    queryFn: async () => unwrapQuery(await getBrands(tenant), "Failed to load brands"),
    initialData,
  })

export const useCreateBrand = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BrandInsert) => createBrand(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: brandsKey(tenant) })
    },
  })
}

export const useUpdateBrand = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BrandUpdate }) => updateBrand(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: brandsKey(tenant) })
    },
  })
}

export const useDeleteBrand = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBrand(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: brandsKey(tenant) })
    },
  })
}
