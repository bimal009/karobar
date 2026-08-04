"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { unwrapQuery } from "@/lib/common/query-helpers"
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
    queryFn: async () => unwrapQuery(await getProducts(tenant), "Failed to load products"),
    initialData,
  })

export const useExpiredProducts = (tenant: string, initialData: ProductWithRelations[] = []) =>
  useQuery({
    queryKey: expiredProductsKey(tenant),
    queryFn: async () => unwrapQuery(await getExpiredProducts(tenant), "Failed to load expired products"),
    initialData,
  })

export const useLowStockProducts = (tenant: string, initialData: ProductWithRelations[] = []) =>
  useQuery({
    queryKey: lowStockProductsKey(tenant),
    queryFn: async () =>
      unwrapQuery(await getLowStockProducts(tenant), "Failed to load low stock products"),
    initialData,
  })

const emptyFormData: ProductCreateFormData = {
  categories: [],
  brands: [],
  units: [],
  warranties: [],
  branches: [],
  customAttributes: [],
}

export const useProductFormData = (tenant: string, initialData?: ProductCreateFormData) =>
  useQuery({
    queryKey: productFormDataKey(tenant),
    queryFn: async () =>
      unwrapQuery(await getProductCreateFormData(tenant), "Failed to load product form data"),
    initialData,
  })

export { emptyFormData as emptyProductFormData }

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
