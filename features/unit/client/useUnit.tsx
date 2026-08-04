"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { unwrapQuery } from "@/lib/common/query-helpers"
import type { Unit } from "@/lib/database/schemas"
import type { UnitInsert, UnitUpdate } from "@/lib/database/zod/units"
import { createUnit, deleteUnit, getUnits, updateUnit } from "../api/unit.action"

const unitsKey = (tenant: string) => ["units", tenant] as const

export const useUnits = (tenant: string, initialData: Unit[] = []) =>
  useQuery({
    queryKey: unitsKey(tenant),
    queryFn: async () => unwrapQuery(await getUnits(tenant), "Failed to load units"),
    initialData,
  })

export const useCreateUnit = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UnitInsert) => createUnit(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: unitsKey(tenant) })
    },
  })
}

export const useUpdateUnit = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UnitUpdate }) => updateUnit(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: unitsKey(tenant) })
    },
  })
}

export const useDeleteUnit = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteUnit(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: unitsKey(tenant) })
    },
  })
}
