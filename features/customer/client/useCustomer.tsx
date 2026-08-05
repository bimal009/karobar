"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { unwrapPaginatedQuery } from "@/lib/common/query-helpers"
import type { Meta, PaginationQuery } from "@/lib/common/pagination"
import type { Customer } from "@/lib/database/schemas"
import type { CustomerInsert, CustomerUpdate } from "@/lib/database/zod/customers"
import { createCustomer, deleteCustomer, getCustomers, updateCustomer } from "../api/customer.action"

const customersKey = (tenant: string, params: Partial<PaginationQuery>) =>
  [
    "customers",
    tenant,
    params.page ?? 1,
    params.limit ?? 10,
    params.search ?? "",
    params.sortBy ?? "",
    params.sortOrder ?? "",
  ] as const

export const useCustomers = (
  tenant: string,
  params: Partial<PaginationQuery> = {},
  initialData?: { rows: Customer[]; meta: Meta }
) => {
  const isDefaultParams = !params.page && !params.limit && !params.search && !params.sortBy && !params.sortOrder
  return useQuery({
    queryKey: customersKey(tenant, params),
    queryFn: async () => unwrapPaginatedQuery(await getCustomers(tenant, params), "Failed to load customers"),
    initialData: isDefaultParams ? initialData : undefined,
  })
}

export const useCreateCustomer = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CustomerInsert) => createCustomer(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["customers", tenant] })
    },
  })
}

export const useUpdateCustomer = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CustomerUpdate }) => updateCustomer(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["customers", tenant] })
    },
  })
}

export const useDeleteCustomer = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCustomer(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: ["customers", tenant] })
    },
  })
}
