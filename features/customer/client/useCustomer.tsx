"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { unwrapQuery } from "@/lib/common/query-helpers"
import type { Customer } from "@/lib/database/schemas"
import type { CustomerInsert, CustomerUpdate } from "@/lib/database/zod/customers"
import { createCustomer, deleteCustomer, getCustomers, updateCustomer } from "../api/customer.action"

const customersKey = (tenant: string) => ["customers", tenant] as const

export const useCustomers = (tenant: string, initialData: Customer[] = []) => {
  return useQuery({
    queryKey: customersKey(tenant),
    queryFn: async () => unwrapQuery(await getCustomers(tenant), "Failed to load customers"),
    initialData,
  })
}

export const useCreateCustomer = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CustomerInsert) => createCustomer(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: customersKey(tenant) })
    },
  })
}

export const useUpdateCustomer = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CustomerUpdate }) => updateCustomer(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: customersKey(tenant) })
    },
  })
}

export const useDeleteCustomer = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCustomer(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: customersKey(tenant) })
    },
  })
}
