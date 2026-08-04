"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { StockAdjustmentInput, StockTransferInput } from "@/lib/database/zod/stock-movements"
import {
  adjustStock,
  getBranchStock,
  getStockFormOptions,
  getStockMovements,
  transferStock,
  type BranchStockRow,
  type StockFormOptions,
  type StockMovementRow,
} from "../api/stock.action"

const branchStockKey = (tenant: string) => ["branch-stock", tenant] as const
export const useBranchStock = (tenant: string, initialData: BranchStockRow[] = []) =>
  useQuery({
    queryKey: branchStockKey(tenant),
    queryFn: async () => {
      const res = await getBranchStock(tenant)
      if (res.error || !res.data) throw new Error(res.message)
      return res.data
    },
    initialData,
  })

const stockMovementsKey = (tenant: string, type?: "adjustment" | "transfer") =>
  ["stock-movements", tenant, type ?? "all"] as const

export const useStockMovements = (
  tenant: string,
  type?: "adjustment" | "transfer",
  initialData: StockMovementRow[] = []
) =>
  useQuery({
    queryKey: stockMovementsKey(tenant, type),
    queryFn: async () => {
      const res = await getStockMovements(tenant, type)
      if (res.error || !res.data) throw new Error(res.message)
      return res.data
    },
    initialData,
  })

const defaultStockFormOptions: StockFormOptions = { branches: [], products: [] }

const stockFormOptionsKey = (tenant: string) => ["stock-form-options", tenant] as const
export const useStockFormOptions = (
  tenant: string,
  initialData: StockFormOptions = defaultStockFormOptions
) =>
  useQuery({
    queryKey: stockFormOptionsKey(tenant),
    queryFn: async () => {
      const res = await getStockFormOptions(tenant)
      if (res.error || !res.data) throw new Error(res.message)
      return res.data
    },
    initialData,
  })

export const useAdjustStock = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: StockAdjustmentInput) => adjustStock(tenant, data),
    onSuccess: (res) => {
      if (!res.error) {
        queryClient.invalidateQueries({ queryKey: branchStockKey(tenant) })
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
        queryClient.invalidateQueries({ queryKey: branchStockKey(tenant) })
        queryClient.invalidateQueries({ queryKey: ["stock-movements", tenant] })
      }
    },
  })
}
