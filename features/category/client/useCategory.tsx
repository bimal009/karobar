"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { CategoryInsert, CategoryUpdate } from "@/lib/database/zod/categories"
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  type CategoryWithProductCount,
} from "../api/category.action"

const categoriesKey = (tenant: string) => ["categories", tenant] as const

export const useCategories = (tenant: string, initialData: CategoryWithProductCount[] = []) => {
  return useQuery({
    queryKey: categoriesKey(tenant),
    queryFn: async () => {
      const res = await getCategories(tenant)
      if (res.error || !res.data) throw new Error(res.message)
      return res.data
    },
    initialData,
  })
}

export const useCreateCategory = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CategoryInsert) => createCategory(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: categoriesKey(tenant) })
    },
  })
}

export const useUpdateCategory = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryUpdate }) => updateCategory(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: categoriesKey(tenant) })
    },
  })
}

export const useDeleteCategory = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCategory(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: categoriesKey(tenant) })
    },
  })
}
