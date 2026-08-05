"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { unwrapPaginatedQuery } from "@/lib/common/query-helpers"
import type { Meta, PaginationQuery } from "@/lib/common/pagination"
import type { BrandInsert, BrandUpdate } from "@/lib/database/zod/brands"
import {
  createBrand,
  deleteBrand,
  getBrands,
  updateBrand,
  type BrandWithProductCount,
} from "../api/brand.action"

const brandsKey = (tenant: string, params: Partial<PaginationQuery>) =>
  [
    "brands",
    tenant,
    params.page ?? 1,
    params.limit ?? 10,
    params.search ?? "",
    params.sortBy ?? "",
    params.sortOrder ?? "",
  ] as const

export const useBrands = (
  tenant: string,
  params: Partial<PaginationQuery> = {},
  initialData?: { rows: BrandWithProductCount[]; meta: Meta }
) => {
  const isDefaultParams = !params.page && !params.limit && !params.search && !params.sortBy && !params.sortOrder
  return useQuery({
    queryKey: brandsKey(tenant, params),
    queryFn: async () => unwrapPaginatedQuery(await getBrands(tenant, params), "Failed to load brands"),
    initialData: isDefaultParams ? initialData : undefined,
  })
}

export const useCreateBrand = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BrandInsert) => createBrand(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["brands", tenant] })
    },
  })
}

export const useUpdateBrand = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BrandUpdate }) => updateBrand(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["brands", tenant] })
    },
  })
}

export const useDeleteBrand = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBrand(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["brands", tenant] })
    },
  })
}
