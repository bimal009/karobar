"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { unwrapPaginatedQuery } from "@/lib/common/query-helpers"
import type { Meta, PaginationQuery } from "@/lib/common/pagination"
import type { CategoryInsert, CategoryUpdate } from "@/lib/database/zod/categories"
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  type CategoryWithProductCount,
} from "../api/category.action"

const categoriesKey = (tenant: string, params: Partial<PaginationQuery>) =>
  [
    "categories",
    tenant,
    params.page ?? 1,
    params.limit ?? 10,
    params.search ?? "",
    params.sortBy ?? "",
    params.sortOrder ?? "",
  ] as const

export const useCategories = (
  tenant: string,
  params: Partial<PaginationQuery> = {},
  initialData?: { rows: CategoryWithProductCount[]; meta: Meta }
) => {
  const isDefaultParams = !params.page && !params.limit && !params.search && !params.sortBy && !params.sortOrder
  return useQuery({
    queryKey: categoriesKey(tenant, params),
    queryFn: async () =>
      unwrapPaginatedQuery(await getCategories(tenant, params), "Failed to load categories"),
    initialData: isDefaultParams ? initialData : undefined,
  })
}

export const useCreateCategory = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CategoryInsert) => createCategory(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["categories", tenant] })
    },
  })
}

export const useUpdateCategory = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryUpdate }) => updateCategory(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["categories", tenant] })
    },
  })
}

export const useDeleteCategory = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCategory(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["categories", tenant] })
    },
  })
}
