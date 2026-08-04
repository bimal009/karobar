"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { unwrapQuery } from "@/lib/common/query-helpers"
import type { SubCategoryInsert, SubCategoryUpdate } from "@/lib/database/zod/sub-categories"
import {
  createSubCategory,
  deleteSubCategory,
  getSubCategories,
  updateSubCategory,
  type SubCategoryWithCategory,
} from "../api/sub-category.action"

const subCategoriesKey = (tenant: string) => ["sub-categories", tenant] as const

export const useSubCategories = (tenant: string, initialData: SubCategoryWithCategory[] = []) =>
  useQuery({
    queryKey: subCategoriesKey(tenant),
    queryFn: async () => unwrapQuery(await getSubCategories(tenant), "Failed to load sub-categories"),
    initialData,
  })

export const useCreateSubCategory = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SubCategoryInsert) => createSubCategory(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: subCategoriesKey(tenant) })
    },
  })
}

export const useUpdateSubCategory = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubCategoryUpdate }) =>
      updateSubCategory(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: subCategoriesKey(tenant) })
    },
  })
}

export const useDeleteSubCategory = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteSubCategory(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: subCategoriesKey(tenant) })
    },
  })
}
