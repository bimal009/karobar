"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { VariantAttribute } from "@/lib/database/schemas"
import type {
  VariantAttributeInsert,
  VariantAttributeUpdate,
} from "@/lib/database/zod/variant-attributes"
import {
  createVariantAttribute,
  deleteVariantAttribute,
  getVariantAttributes,
  updateVariantAttribute,
} from "../api/variant-attribute.action"

const variantAttributesKey = (tenant: string) => ["variant-attributes", tenant] as const

export const useVariantAttributes = (tenant: string, initialData: VariantAttribute[] = []) =>
  useQuery({
    queryKey: variantAttributesKey(tenant),
    queryFn: async () => {
      const res = await getVariantAttributes(tenant)
      if (res.error || !res.data) throw new Error(res.message)
      return res.data
    },
    initialData,
  })

export const useCreateVariantAttribute = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: VariantAttributeInsert) => createVariantAttribute(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: variantAttributesKey(tenant) })
    },
  })
}

export const useUpdateVariantAttribute = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VariantAttributeUpdate }) =>
      updateVariantAttribute(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: variantAttributesKey(tenant) })
    },
  })
}

export const useDeleteVariantAttribute = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteVariantAttribute(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: variantAttributesKey(tenant) })
    },
  })
}
