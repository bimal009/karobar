"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { unwrapPaginatedQuery } from "@/lib/common/query-helpers"
import type { Meta, PaginationQuery } from "@/lib/common/pagination"
import type { Unit } from "@/lib/database/schemas"
import type { UnitInsert, UnitUpdate } from "@/lib/database/zod/units"
import { createUnit, deleteUnit, getUnits, updateUnit } from "../api/unit.action"

const unitsKey = (tenant: string, params: Partial<PaginationQuery>) =>
  [
    "units",
    tenant,
    params.page ?? 1,
    params.limit ?? 10,
    params.search ?? "",
    params.sortBy ?? "",
    params.sortOrder ?? "",
  ] as const

export const useUnits = (
  tenant: string,
  params: Partial<PaginationQuery> = {},
  initialData?: { rows: Unit[]; meta: Meta }
) => {
  const isDefaultParams = !params.page && !params.limit && !params.search && !params.sortBy && !params.sortOrder
  return useQuery({
    queryKey: unitsKey(tenant, params),
    queryFn: async () => unwrapPaginatedQuery(await getUnits(tenant, params), "Failed to load units"),
    initialData: isDefaultParams ? initialData : undefined,
  })
}

export const useCreateUnit = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UnitInsert) => createUnit(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["units", tenant] })
    },
  })
}

export const useUpdateUnit = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UnitUpdate }) => updateUnit(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["units", tenant] })
    },
  })
}

export const useDeleteUnit = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteUnit(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["units", tenant] })
    },
  })
}
