"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { unwrapQuery } from "@/lib/common/query-helpers"
import type { CustomAttribute } from "@/lib/database/schemas"
import type {
  CustomAttributeInsert,
  CustomAttributeUpdate,
} from "@/lib/database/zod/custom-attributes"
import {
  createCustomAttribute,
  deleteCustomAttribute,
  getCustomAttributes,
  updateCustomAttribute,
} from "../api/custom-attribute.action"

const customAttributesKey = (tenant: string) => ["custom-attributes", tenant] as const

export const useCustomAttributes = (tenant: string, initialData: CustomAttribute[] = []) =>
  useQuery({
    queryKey: customAttributesKey(tenant),
    queryFn: async () =>
      unwrapQuery(await getCustomAttributes(tenant), "Failed to load custom attributes"),
    initialData,
  })

export const useCreateCustomAttribute = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CustomAttributeInsert) => createCustomAttribute(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: customAttributesKey(tenant) })
    },
  })
}

export const useUpdateCustomAttribute = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CustomAttributeUpdate }) =>
      updateCustomAttribute(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: customAttributesKey(tenant) })
    },
  })
}

export const useDeleteCustomAttribute = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCustomAttribute(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: customAttributesKey(tenant) })
    },
  })
}
