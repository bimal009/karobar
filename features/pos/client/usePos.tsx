"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { unwrapPaginatedQuery, unwrapQuery } from "@/lib/common/query-helpers"
import type { Meta } from "@/lib/common/pagination"
import type { OrderInsertInput } from "@/lib/database/zod/orders"
import {
  createOrder,
  getPosData,
  searchPosProducts,
  type PosData,
  type PosProduct,
  type PosProductSearchParams,
} from "../api/pos.action"

const defaultPosData: PosData = { categories: [], customers: [] }

const posDataKey = (tenant: string) => ["pos-data", tenant] as const
export const usePosData = (tenant: string, initialData: PosData = defaultPosData) =>
  useQuery({
    queryKey: posDataKey(tenant),
    queryFn: async () => unwrapQuery(await getPosData(tenant), "Failed to load POS data"),
    initialData,
  })

const posProductsKey = (tenant: string, params: PosProductSearchParams) =>
  [
    "pos-products",
    tenant,
    params.search ?? "",
    params.categoryId ?? "all",
    params.page ?? 1,
    params.limit ?? 10,
    params.sortBy ?? "",
    params.sortOrder ?? "",
  ] as const

export const usePosProducts = (
  tenant: string,
  params: PosProductSearchParams,
  initialData?: { rows: PosProduct[]; meta: Meta }
) =>
  useQuery({
    queryKey: posProductsKey(tenant, params),
    queryFn: async () =>
      unwrapPaginatedQuery(await searchPosProducts(tenant, params), "Failed to search products"),
    initialData,
  })

export const useCreateOrder = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: OrderInsertInput) => createOrder(tenant, data),
    onSuccess: (res) => {
      if (!res.error) {
        queryClient.invalidateQueries({ queryKey: posDataKey(tenant) })
        queryClient.invalidateQueries({ queryKey: ["pos-products", tenant] })
      }
    },
  })
}
