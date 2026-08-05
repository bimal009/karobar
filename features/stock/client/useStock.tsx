"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { unwrapPaginatedQuery, unwrapQuery } from "@/lib/common/query-helpers"
import type { Meta } from "@/lib/common/pagination"
import type { StockAdjustmentInput, StockTransferInput } from "@/lib/database/zod/stock-movements"
import {
  adjustStock,
  getBranchStock,
  getStockFormOptions,
  getStockMovements,
  transferStock,
  type BranchStockListParams,
  type BranchStockRow,
  type StockFormOptions,
  type StockMovementListParams,
  type StockMovementRow,
} from "../api/stock.action"

const branchStockKey = (tenant: string, params: BranchStockListParams) =>
  [
    "branch-stock",
    tenant,
    params.page ?? 1,
    params.limit ?? 10,
    params.search ?? "",
    params.sortBy ?? "",
    params.sortOrder ?? "",
    params.branchId ?? "",
  ] as const

export const useBranchStock = (
  tenant: string,
  params: BranchStockListParams = {},
  initialData?: { rows: BranchStockRow[]; meta: Meta }
) => {
  const isDefaultParams =
    !params.page && !params.limit && !params.search && !params.sortBy && !params.sortOrder && !params.branchId
  return useQuery({
    queryKey: branchStockKey(tenant, params),
    queryFn: async () =>
      unwrapPaginatedQuery(await getBranchStock(tenant, params), "Failed to load branch stock"),
    initialData: isDefaultParams ? initialData : undefined,
  })
}

const stockMovementsKey = (tenant: string, params: StockMovementListParams) =>
  [
    "stock-movements",
    tenant,
    params.type ?? "all",
    params.page ?? 1,
    params.limit ?? 10,
    params.search ?? "",
    params.sortBy ?? "",
    params.sortOrder ?? "",
  ] as const

export const useStockMovements = (
  tenant: string,
  params: StockMovementListParams = {},
  initialData?: { rows: StockMovementRow[]; meta: Meta }
) => {
  const isDefaultParams = !params.page && !params.limit && !params.search && !params.sortBy && !params.sortOrder
  return useQuery({
    queryKey: stockMovementsKey(tenant, params),
    queryFn: async () =>
      unwrapPaginatedQuery(await getStockMovements(tenant, params), "Failed to load stock movements"),
    initialData: isDefaultParams ? initialData : undefined,
  })
}

const defaultStockFormOptions: StockFormOptions = { branches: [], products: [] }

const stockFormOptionsKey = (tenant: string) => ["stock-form-options", tenant] as const
export const useStockFormOptions = (
  tenant: string,
  initialData: StockFormOptions = defaultStockFormOptions
) =>
  useQuery({
    queryKey: stockFormOptionsKey(tenant),
    queryFn: async () =>
      unwrapQuery(await getStockFormOptions(tenant), "Failed to load stock form options"),
    initialData,
  })

export const useAdjustStock = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: StockAdjustmentInput) => adjustStock(tenant, data),
    onSuccess: (res) => {
      if (!res.error) {
        queryClient.invalidateQueries({ queryKey: ["branch-stock", tenant] })
        queryClient.invalidateQueries({ queryKey: ["stock-movements", tenant] })
      }
    },
  })
}

export const useTransferStock = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: StockTransferInput) => transferStock(tenant, data),
    onSuccess: (res) => {
      if (!res.error) {
        queryClient.invalidateQueries({ queryKey: ["branch-stock", tenant] })
        queryClient.invalidateQueries({ queryKey: ["stock-movements", tenant] })
      }
    },
  })
}
