"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { unwrapPaginatedQuery } from "@/lib/common/query-helpers"
import type { Meta, PaginationQuery } from "@/lib/common/pagination"
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

const variantAttributesKey = (tenant: string, params: Partial<PaginationQuery>) =>
  [
    "variant-attributes",
    tenant,
    params.page ?? 1,
    params.limit ?? 10,
    params.search ?? "",
    params.sortBy ?? "",
    params.sortOrder ?? "",
  ] as const

export const useVariantAttributes = (
  tenant: string,
  params: Partial<PaginationQuery> = {},
  initialData?: { rows: VariantAttribute[]; meta: Meta }
) => {
  const isDefaultParams = !params.page && !params.limit && !params.search && !params.sortBy && !params.sortOrder
  return useQuery({
    queryKey: variantAttributesKey(tenant, params),
    queryFn: async () =>
      unwrapPaginatedQuery(await getVariantAttributes(tenant, params), "Failed to load variant attributes"),
    initialData: isDefaultParams ? initialData : undefined,
  })
}

export const useCreateVariantAttribute = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: VariantAttributeInsert) => createVariantAttribute(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["variant-attributes", tenant] })
    },
  })
}

export const useUpdateVariantAttribute = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VariantAttributeUpdate }) =>
      updateVariantAttribute(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["variant-attributes", tenant] })
    },
  })
}

export const useDeleteVariantAttribute = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteVariantAttribute(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["variant-attributes", tenant] })
    },
  })
}
