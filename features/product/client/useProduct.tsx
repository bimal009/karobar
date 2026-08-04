"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { ProductInsert, ProductUpdate } from "@/lib/database/zod/products"
import {
  createProduct,
  deleteProduct,
  getExpiredProducts,
  getLowStockProducts,
  getProductCreateFormData,
  getProducts,
  updateProduct,
  type ProductCreateFormData,
  type ProductWithRelations,
} from "../api/product.action"

const productsKey = (tenant: string) => ["products", tenant] as const
const expiredProductsKey = (tenant: string) => ["products", "expired", tenant] as const
const lowStockProductsKey = (tenant: string) => ["products", "low-stock", tenant] as const
const productFormDataKey = (tenant: string) => ["products", "form-data", tenant] as const

export const useProducts = (tenant: string, initialData: ProductWithRelations[] = []) =>
  useQuery({
    queryKey: productsKey(tenant),
    queryFn: async () => {
      const res = await getProducts(tenant)
      if (res.error || !res.data) throw new Error(res.message)
      return res.data
    },
    initialData,
  })

export const useExpiredProducts = (tenant: string, initialData: ProductWithRelations[] = []) =>
  useQuery({
    queryKey: expiredProductsKey(tenant),
    queryFn: async () => {
      const res = await getExpiredProducts(tenant)
      if (res.error || !res.data) throw new Error(res.message)
      return res.data
    },
    initialData,
  })

export const useLowStockProducts = (tenant: string, initialData: ProductWithRelations[] = []) =>
  useQuery({
    queryKey: lowStockProductsKey(tenant),
    queryFn: async () => {
      const res = await getLowStockProducts(tenant)
      if (res.error || !res.data) throw new Error(res.message)
      return res.data
    },
    initialData,
  })

const emptyFormData: ProductCreateFormData = {
  categories: [],
  brands: [],
  units: [],
  warranties: [],
  branches: [],
}

export const useProductFormData = (tenant: string, initialData: ProductCreateFormData = emptyFormData) =>
  useQuery({
    queryKey: productFormDataKey(tenant),
    queryFn: async () => {
      const res = await getProductCreateFormData(tenant)
      if (res.error || !res.data) throw new Error(res.message)
      return res.data
    },
    initialData,
  })

export const useCreateProduct = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProductInsert) => createProduct(tenant, data),
    onSuccess: (res) => {
      if (!res.error) {
        queryClient.invalidateQueries({ queryKey: productsKey(tenant) })
        queryClient.invalidateQueries({ queryKey: expiredProductsKey(tenant) })
        queryClient.invalidateQueries({ queryKey: lowStockProductsKey(tenant) })
      }
    },
  })
}

export const useUpdateProduct = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductUpdate }) => updateProduct(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) {
        queryClient.invalidateQueries({ queryKey: productsKey(tenant) })
        queryClient.invalidateQueries({ queryKey: expiredProductsKey(tenant) })
        queryClient.invalidateQueries({ queryKey: lowStockProductsKey(tenant) })
      }
    },
  })
}

export const useDeleteProduct = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProduct(tenant, id),
    onSuccess: (res) => {
      if (!res.error) {
        queryClient.invalidateQueries({ queryKey: productsKey(tenant) })
        queryClient.invalidateQueries({ queryKey: expiredProductsKey(tenant) })
        queryClient.invalidateQueries({ queryKey: lowStockProductsKey(tenant) })
      }
    },
  })
}
