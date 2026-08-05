"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { unwrapPaginatedQuery, unwrapQuery } from "@/lib/common/query-helpers"
import type { Meta, PaginationQuery } from "@/lib/common/pagination"
import { invalidateDerivedQueries } from "@/lib/query/invalidate"
import type { ProductInsert, ProductUpdate } from "@/lib/database/zod/products"
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getExpiredProducts,
  getLowStockProducts,
  getProductCreateFormData,
  getProducts,
  updateProduct,
  type ProductCreateFormData,
  type ProductListParams,
  type ProductWithRelations,
} from "../api/product.action"

const productsKey = (tenant: string, params: ProductListParams) =>
  [
    "products",
    tenant,
    "list",
    params.page ?? 1,
    params.limit ?? 10,
    params.search ?? "",
    params.sortBy ?? "",
    params.sortOrder ?? "",
    params.categoryId ?? "",
    params.brandId ?? "",
  ] as const
const allProductsKey = (tenant: string) => ["products", tenant, "all"] as const
const expiredProductsKey = (tenant: string, params: Partial<PaginationQuery>) =>
  [
    "products",
    tenant,
    "expired",
    params.page ?? 1,
    params.limit ?? 10,
    params.search ?? "",
    params.sortBy ?? "",
    params.sortOrder ?? "",
  ] as const
const lowStockProductsKey = (tenant: string, params: Partial<PaginationQuery>) =>
  [
    "products",
    tenant,
    "low-stock",
    params.page ?? 1,
    params.limit ?? 10,
    params.search ?? "",
    params.sortBy ?? "",
    params.sortOrder ?? "",
  ] as const
const productFormDataKey = (tenant: string) => ["products", tenant, "form-data"] as const

export const useProducts = (
  tenant: string,
  params: ProductListParams = {},
  initialData?: { rows: ProductWithRelations[]; meta: Meta }
) => {
  const isDefaultParams =
    !params.page &&
    !params.limit &&
    !params.search &&
    !params.sortBy &&
    !params.sortOrder &&
    !params.categoryId &&
    !params.brandId
  return useQuery({
    queryKey: productsKey(tenant, params),
    queryFn: async () => unwrapPaginatedQuery(await getProducts(tenant, params), "Failed to load products"),
    initialData: isDefaultParams ? initialData : undefined,
  })
}

/** Full unpaginated catalog, for consumers like label printing that need every product. */
export const useAllProducts = (tenant: string, initialData: ProductWithRelations[] = []) =>
  useQuery({
    queryKey: allProductsKey(tenant),
    queryFn: async () => unwrapQuery(await getAllProducts(tenant), "Failed to load products"),
    initialData,
  })

export const useExpiredProducts = (
  tenant: string,
  params: Partial<PaginationQuery> = {},
  initialData?: { rows: ProductWithRelations[]; meta: Meta }
) => {
  const isDefaultParams = !params.page && !params.limit && !params.search && !params.sortBy && !params.sortOrder
  return useQuery({
    queryKey: expiredProductsKey(tenant, params),
    queryFn: async () =>
      unwrapPaginatedQuery(await getExpiredProducts(tenant, params), "Failed to load expired products"),
    initialData: isDefaultParams ? initialData : undefined,
  })
}

export const useLowStockProducts = (
  tenant: string,
  params: Partial<PaginationQuery> = {},
  initialData?: { rows: ProductWithRelations[]; meta: Meta }
) => {
  const isDefaultParams = !params.page && !params.limit && !params.search && !params.sortBy && !params.sortOrder
  return useQuery({
    queryKey: lowStockProductsKey(tenant, params),
    queryFn: async () =>
      unwrapPaginatedQuery(await getLowStockProducts(tenant, params), "Failed to load low stock products"),
    initialData: isDefaultParams ? initialData : undefined,
  })
}

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
        invalidateDerivedQueries(queryClient, tenant)
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
        invalidateDerivedQueries(queryClient, tenant)
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
        invalidateDerivedQueries(queryClient, tenant)
      }
    },
  })
}
