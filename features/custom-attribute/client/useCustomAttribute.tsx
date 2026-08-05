"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { unwrapPaginatedQuery } from "@/lib/common/query-helpers"
import type { Meta, PaginationQuery } from "@/lib/common/pagination"
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

const customAttributesKey = (tenant: string, params: Partial<PaginationQuery>) =>
  [
    "custom-attributes",
    tenant,
    params.page ?? 1,
    params.limit ?? 10,
    params.search ?? "",
    params.sortBy ?? "",
    params.sortOrder ?? "",
  ] as const

export const useCustomAttributes = (
  tenant: string,
  params: Partial<PaginationQuery> = {},
  initialData?: { rows: CustomAttribute[]; meta: Meta }
) => {
  const isDefaultParams = !params.page && !params.limit && !params.search && !params.sortBy && !params.sortOrder
  return useQuery({
    queryKey: customAttributesKey(tenant, params),
    queryFn: async () =>
      unwrapPaginatedQuery(await getCustomAttributes(tenant, params), "Failed to load custom attributes"),
    initialData: isDefaultParams ? initialData : undefined,
  })
}

export const useCreateCustomAttribute = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CustomAttributeInsert) => createCustomAttribute(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["custom-attributes", tenant] })
    },
  })
}

export const useUpdateCustomAttribute = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CustomAttributeUpdate }) =>
      updateCustomAttribute(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["custom-attributes", tenant] })
    },
  })
}

export const useDeleteCustomAttribute = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCustomAttribute(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["custom-attributes", tenant] })
    },
  })
}
