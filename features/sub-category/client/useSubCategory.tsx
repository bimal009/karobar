"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { unwrapPaginatedQuery } from "@/lib/common/query-helpers"
import type { Meta, PaginationQuery } from "@/lib/common/pagination"
import type { SubCategoryInsert, SubCategoryUpdate } from "@/lib/database/zod/sub-categories"
import {
  createSubCategory,
  deleteSubCategory,
  getSubCategoryPageData,
  updateSubCategory,
  type SubCategoryPageData,
} from "../api/sub-category.action"

const subCategoriesKey = (tenant: string, params: Partial<PaginationQuery>) =>
  [
    "sub-categories",
    tenant,
    params.page ?? 1,
    params.limit ?? 10,
    params.search ?? "",
    params.sortBy ?? "",
    params.sortOrder ?? "",
  ] as const

export const useSubCategories = (
  tenant: string,
  params: Partial<PaginationQuery> = {},
  initialData?: { rows: SubCategoryPageData; meta: Meta }
) => {
  const isDefaultParams = !params.page && !params.limit && !params.search && !params.sortBy && !params.sortOrder
  return useQuery({
    queryKey: subCategoriesKey(tenant, params),
    queryFn: async () =>
      unwrapPaginatedQuery(await getSubCategoryPageData(tenant, params), "Failed to load sub-categories"),
    initialData: isDefaultParams ? initialData : undefined,
  })
}

export const useCreateSubCategory = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SubCategoryInsert) => createSubCategory(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["sub-categories", tenant] })
    },
  })
}

export const useUpdateSubCategory = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubCategoryUpdate }) =>
      updateSubCategory(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["sub-categories", tenant] })
    },
  })
}

export const useDeleteSubCategory = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteSubCategory(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["sub-categories", tenant] })
    },
  })
}
